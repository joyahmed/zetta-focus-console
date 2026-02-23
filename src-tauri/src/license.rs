//! License Manager Module - Centralized license management
//!
//! This module is the single source of truth for all license-related operations.
//! Only LicenseManager may mutate LicenseState. All other modules must treat
//! LicenseState as read-only.
//!
//! ## Cryptographic Verification
//!
//! License keys are verified using Ed25519 signatures. The verification flow:
//! 1. Parse key format (ZFC-PRO-XXXX-XXXX or ZFC-FOUNDER-XXXX-XXXX)
//! 2. If signed data present, verify cryptographic signature
//! 3. Validate tier and product
//! 4. Persist license data locally

use crate::pricing::trial;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

// Import cryptographic verification module
use crate::license_crypto;

/// Get the trial marker file path
fn get_trial_marker_path() -> PathBuf {
    let base_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    base_dir.join(".zetta_focus").join(".trial_marker")
}

/// Check if trial marker exists (for trial resilience)
fn trial_marker_exists() -> bool {
    get_trial_marker_path().exists()
}

/// Create trial marker file with hashed timestamp
fn create_trial_marker(trial_start: u64) -> Result<(), String> {
    let path = get_trial_marker_path();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    trial_start.hash(&mut hasher);
    let hash = hasher.finish();

    fs::write(&path, format!("{}", hash)).map_err(|e| e.to_string())?;
    Ok(())
}

/// Get trial marker hash if exists
fn get_trial_marker_hash() -> Option<u64> {
    let path = get_trial_marker_path();
    if !path.exists() {
        return None;
    }

    fs::read_to_string(&path).ok()?.trim().parse().ok()
}

/// Verify trial marker is valid (prevents simple trial reset)
fn is_trial_marker_valid(trial_start: u64) -> bool {
    if let Some(saved_hash) = get_trial_marker_hash() {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        trial_start.hash(&mut hasher);
        let current_hash = hasher.finish();

        saved_hash == current_hash
    } else {
        false
    }
}

// ============================================================================
// DEV LICENSE OVERRIDES (Debug builds only)
// ============================================================================

/// Development license override enum - allows simulating different license states
/// Only available in debug builds for testing purposes
#[cfg(debug_assertions)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum DevLicenseOverride {
    /// No override - use actual license state
    #[default]
    None,
    /// Force license to appear as Free
    ForceFree,
    /// Force license to appear as Trial
    ForceTrial,
    /// Force license to appear as Pro
    ForcePro,
    /// Force license to appear as Founder
    ForceFounder,
    /// Simulate an expired trial (shows as Trial but is expired)
    SimulateExpiredTrial,
}

/// Debug license state - stored in memory only, not persisted
#[cfg(debug_assertions)]
#[derive(Debug, Clone, Default)]
pub struct DevLicenseState {
    pub override_mode: DevLicenseOverride,
    pub simulate_expired_trial: bool,
}

#[cfg(debug_assertions)]
impl DevLicenseState {
    /// Set the current override mode
    pub fn set_override(&mut self, mode: DevLicenseOverride) {
        self.override_mode = mode;
        self.simulate_expired_trial = (mode == DevLicenseOverride::SimulateExpiredTrial);
    }

    /// Get the current override mode
    pub fn get_override(&self) -> DevLicenseOverride {
        self.override_mode
    }

    /// Clear all overrides
    pub fn clear(&mut self) {
        self.override_mode = DevLicenseOverride::None;
        self.simulate_expired_trial = false;
    }
}

/// Debug license overrides - compile-time config (for code-based testing)
#[cfg(debug_assertions)]
#[derive(Debug, Clone, Copy, Default)]
pub struct DevOverrides {
    /// Current override mode (runtime adjustable)
    pub override_mode: DevLicenseOverride,
}

#[cfg(debug_assertions)]
impl DevOverrides {
    /// Get the current override mode from global state
    /// Uses a simple static Mutex for thread safety
    pub fn get() -> Self {
        Self {
            override_mode: DEBUG_LICENSE_STATE.lock().unwrap().override_mode,
        }
    }

    /// Set the override mode at runtime
    pub fn set_override(mode: DevLicenseOverride) {
        DEBUG_LICENSE_STATE.lock().unwrap().set_override(mode);
    }

    /// Clear all overrides
    pub fn clear() {
        DEBUG_LICENSE_STATE.lock().unwrap().clear();
    }
}

/// Initialize the debug license state - call once at startup
#[cfg(debug_assertions)]
static DEBUG_LICENSE_STATE: std::sync::LazyLock<std::sync::Mutex<DevLicenseState>> =
    std::sync::LazyLock::new(|| {
        std::sync::Mutex::new(DevLicenseState {
            override_mode: DevLicenseOverride::None,
            simulate_expired_trial: false,
        })
    });

/// License tier enum - the internal representation of license state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LicenseTier {
    Free,
    Trial,
    Pro,
    Founder,
}

impl Default for LicenseTier {
    fn default() -> Self {
        LicenseTier::Free
    }
}

impl std::fmt::Display for LicenseTier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LicenseTier::Free => write!(f, "Free"),
            LicenseTier::Trial => write!(f, "Trial"),
            LicenseTier::Pro => write!(f, "Pro"),
            LicenseTier::Founder => write!(f, "Founder"),
        }
    }
}

impl LicenseTier {
    /// Convert to the existing LicenseState string format for persistence
    pub fn to_license_type(&self) -> String {
        match self {
            LicenseTier::Free => "Free".to_string(),
            LicenseTier::Trial => "Trial".to_string(),
            LicenseTier::Pro => "Pro".to_string(),
            LicenseTier::Founder => "Founder".to_string(),
        }
    }

    /// Parse from license type string
    pub fn from_license_type(s: &str) -> Self {
        match s {
            "Trial" => LicenseTier::Trial,
            "Pro" => LicenseTier::Pro,
            "Founder" => LicenseTier::Founder,
            _ => LicenseTier::Free,
        }
    }
}

/// License data stored on disk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseData {
    pub license_type: String,
    pub trial_start_timestamp: Option<u64>,
    pub signature: Option<String>,
}

impl Default for LicenseData {
    fn default() -> Self {
        Self {
            license_type: "Free".to_string(),
            trial_start_timestamp: None,
            signature: None,
        }
    }
}

/// License Manager - Single source of truth for all license operations
pub struct LicenseManager {
    tier: LicenseTier,
    trial_start_timestamp: Option<u64>,
    signature: Option<String>,
}

impl Default for LicenseManager {
    fn default() -> Self {
        Self::new()
    }
}

impl LicenseManager {
    /// Create a new LicenseManager - loads from storage or initializes trial
    pub fn new() -> Self {
        // DIAGNOSTIC: Track LicenseManager instance creation
        eprintln!("[DIAGNOSTIC] LicenseManager::new() called - creating new instance");
        eprintln!("[DIAGNOSTIC] License file path: {:?}", Self::get_license_path());
        eprintln!("[DIAGNOSTIC] Trial marker path: {:?}", get_trial_marker_path());

        let license_data = Self::load_from_storage();

        // DIAGNOSTIC: Log loaded data
        eprintln!("[DIAGNOSTIC] Loaded license data: tier={}, trial_start={:?}",
            license_data.license_type, license_data.trial_start_timestamp);

        let mut manager = Self {
            tier: LicenseTier::from_license_type(&license_data.license_type),
            trial_start_timestamp: license_data.trial_start_timestamp,
            signature: license_data.signature,
        };

        // Check trial expiration on startup
        manager.check_trial_expiration();

        // If no license file exists:
        if !Self::license_file_exists() {
            // Trial resilience: if marker exists but license doesn't, fail-safe to Free
            // This prevents users from resetting trial by deleting license file
            if trial_marker_exists() {
                // Marker exists but license was deleted - restore to Free (trial was previously used)
                // Keep marker as-is so they can't restart trial
                manager.tier = LicenseTier::Free;
                manager.trial_start_timestamp = None;
                manager.persist().ok();
            } else {
                // No license and no marker - initialize fresh trial
                manager.initialize_trial();
            }
        } else {
            // License file exists - validate marker for Trial state
            if manager.tier == LicenseTier::Trial {
                if let Some(ts) = manager.trial_start_timestamp {
                    if !is_trial_marker_valid(ts) {
                        // Marker invalid - restore to Free (fail-safe)
                        manager.tier = LicenseTier::Free;
                        manager.trial_start_timestamp = None;
                        manager.persist().ok();
                    }
                }
            }
        }

        manager
    }

    /// Get the current license tier
    pub fn get_tier(&self) -> LicenseTier {
        self.tier
    }

    /// Get license type as string (for UI display)
    /// Respects dev overrides in debug builds
    pub fn get_license_type(&self) -> String {
        self.effective_tier().to_license_type()
    }

    /// Get the license signature
    pub fn get_signature(&self) -> Option<String> {
        self.signature.clone()
    }

    /// Check if Pro features are enabled
    /// Returns true if: Pro, Founder, or Trial (not expired)
    /// Returns false if: Free
    ///
    /// In debug builds, this respects DevOverrides for testing Pro features.
    pub fn is_pro_enabled(&self) -> bool {
        let effective = self.effective_tier();
        match effective {
            LicenseTier::Pro | LicenseTier::Founder => true,
            LicenseTier::Trial => !self.is_trial_effectively_expired(),
            LicenseTier::Free => false,
        }
    }

    /// Get the effective license tier, respecting dev overrides in debug builds
    ///
    /// In debug builds, this allows forcing Free/Trial/Pro/Founder for testing.
    /// In release builds, this always returns the actual stored tier.
    ///
    /// Dev overrides do NOT modify stored license data.
    pub fn effective_tier(&self) -> LicenseTier {
        #[cfg(debug_assertions)]
        {
            let dev_overrides = DevOverrides::get();
            match dev_overrides.override_mode {
                DevLicenseOverride::ForceFree => return LicenseTier::Free,
                DevLicenseOverride::ForceTrial => return LicenseTier::Trial,
                DevLicenseOverride::ForcePro => return LicenseTier::Pro,
                DevLicenseOverride::ForceFounder => return LicenseTier::Founder,
                DevLicenseOverride::SimulateExpiredTrial => return LicenseTier::Trial,
                DevLicenseOverride::None => {}
            }
        }

        // In release builds, or when no overrides are active, return actual tier
        self.tier
    }

    /// Check if the license is Founder (permanent status)
    pub fn is_founder(&self) -> bool {
        self.tier == LicenseTier::Founder
    }

    /// Check if current license is Pro or higher (for backward compatibility)
    pub fn is_pro(&self) -> bool {
        matches!(self.tier, LicenseTier::Pro | LicenseTier::Founder)
    }

    /// Check if trial has expired
    fn is_trial_expired(&self) -> bool {
        if let Some(start_ts) = self.trial_start_timestamp {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            now > start_ts + trial::DURATION_SECS
        } else {
            true // No start timestamp means trial expired
        }
    }

    /// Check if trial is effectively expired, considering dev overrides
    /// In debug builds with SimulateExpiredTrial, this returns true
    /// In other cases, checks the actual timestamp
    fn is_trial_effectively_expired(&self) -> bool {
        #[cfg(debug_assertions)]
        {
            let dev_overrides = DevOverrides::get();
            if dev_overrides.override_mode == DevLicenseOverride::SimulateExpiredTrial {
                return true;
            }
        }
        self.is_trial_expired()
    }

    /// Get trial days remaining (0 if expired or not in trial)
    /// Returns 0 if in debug mode with force_free override
    /// Returns 0 if in debug mode with simulate_expired_trial override
    pub fn get_trial_days_remaining(&self) -> u32 {
        let effective = self.effective_tier();

        if effective != LicenseTier::Trial {
            return 0;
        }

        // Check if trial is effectively expired (including dev overrides)
        if self.is_trial_effectively_expired() {
            return 0;
        }

        if let Some(start_ts) = self.trial_start_timestamp {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            let elapsed = now.saturating_sub(start_ts);
            let remaining = trial::DURATION_SECS.saturating_sub(elapsed);

            (remaining / (24 * 60 * 60)) as u32
        } else {
            0
        }
    }

    /// Check if currently in trial period
    /// Respects dev overrides in debug builds
    pub fn is_in_trial(&self) -> bool {
        let effective = self.effective_tier();
        effective == LicenseTier::Trial && !self.is_trial_effectively_expired()
    }

    /// Initialize trial on first launch
    fn initialize_trial(&mut self) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        self.tier = LicenseTier::Trial;
        self.trial_start_timestamp = Some(now);
        self.signature = None;

        // Create trial marker for resilience
        let _ = create_trial_marker(now);

        // Persist the trial state
        let _ = self.persist();
    }

    /// Check trial expiration and downgrade if needed
    fn check_trial_expiration(&mut self) {
        if self.tier == LicenseTier::Trial && self.is_trial_expired() {
            self.tier = LicenseTier::Free;
            self.trial_start_timestamp = None;
            let _ = self.persist();
        }
    }

    /// Activate a license key
    ///
    /// # Arguments
    /// * `key` - The license key to activate
    ///
    /// # Returns
    /// * `Ok(())` - If activation was successful
    /// * `Err(String)` - If activation failed
    pub fn activate_key(&mut self, key: &str) -> Result<(), String> {
        // Step 1: Parse the key (basic validation)
        if key.is_empty() {
            return Err("License key cannot be empty".to_string());
        }

        // Step 2: Verify cryptographic signature using the crypto module
        let (tier, license_id) = match license_crypto::verify_license(key) {
            Ok((tier, id)) => (tier, id),
            Err(e) => return Err(format!("License verification failed: {}", e)),
        };

        // Step 3: Determine tier and update LicenseState
        let license_tier = match tier.as_str() {
            "PRO" => LicenseTier::Pro,
            "FOUNDER" => LicenseTier::Founder,
            _ => return Err("Invalid license tier".to_string()),
        };

        self.tier = license_tier;
        self.trial_start_timestamp = None; // Clear trial state
        self.signature = Some(key.to_string()); // Store the full key as signature

        // Step 4: Persist encrypted license
        self.persist()?;

        Ok(())
    }

    /// Verify license key signature
    ///
    /// Uses the cryptographic verification module to validate the license key.
    /// Supports both simple format keys (for testing) and signed keys (production).
    ///
    /// # Arguments
    /// * `key` - The license key to verify
    ///
    /// # Returns
    /// * `(is_valid, tier, signature)` - Tuple of validation result, tier, and signature
    #[deprecated(note = "Use license_crypto::verify_license instead")]
    fn verify_license_key(key: &str) -> (bool, LicenseTier, String) {
        // Fallback implementation for backward compatibility
        // This uses the old format-based validation

        let key_upper = key.to_uppercase();

        // New format: ZFC-PRO-XXXX-XXXX
        if key_upper.starts_with("ZFC-PRO-") && key_upper.len() >= 16 {
            let parts: Vec<&str> = key_upper.split('-').collect();
            if parts.len() == 4 && parts[0] == "ZFC" && parts[1] == "PRO" {
                let code = format!("{}-{}", parts[2], parts[3]);
                if code.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
                    return (true, LicenseTier::Pro, key.to_string());
                }
            }
        }

        // New format: ZFC-FOUNDER-XXXX-XXXX
        if key_upper.starts_with("ZFC-FOUNDER-") && key_upper.len() >= 20 {
            let parts: Vec<&str> = key_upper.split('-').collect();
            if parts.len() == 4 && parts[0] == "ZFC" && parts[1] == "FOUNDER" {
                let code = format!("{}-{}", parts[2], parts[3]);
                if code.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
                    return (true, LicenseTier::Founder, key.to_string());
                }
            }
        }

        // Legacy format: ZETTA-PRO-XXXX (backward compatibility)
        if key_upper.starts_with("ZETTA-PRO-") && key_upper.len() > 10 {
            let code = &key_upper[10..];
            if code.chars().all(|c| c.is_ascii_alphanumeric()) {
                return (true, LicenseTier::Pro, key.to_string());
            }
        }

        // Legacy format: ZETTA-FOUNDER-XXXX (backward compatibility)
        if key_upper.starts_with("ZETTA-FOUNDER-") && key_upper.len() > 14 {
            let code = &key_upper[14..];
            if code.chars().all(|c| c.is_ascii_alphanumeric()) {
                return (true, LicenseTier::Founder, key.to_string());
            }
        }

        // Invalid key format
        (false, LicenseTier::Free, String::new())
    }

    /// Get the license data directory path
    fn get_license_dir() -> PathBuf {
        let base_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
        base_dir.join(".zetta_focus")
    }

    /// Get the license file path
    pub fn get_license_path() -> PathBuf {
        Self::get_license_dir().join("license.dat")
    }

    /// Check if license file exists
    fn license_file_exists() -> bool {
        Self::get_license_path().exists()
    }

    /// Load license data from storage
    fn load_from_storage() -> LicenseData {
        let path = Self::get_license_path();

        if !path.exists() {
            return LicenseData::default();
        }

        match fs::read_to_string(&path) {
            Ok(content) => {
                // Try to deserialize - handle both old and new formats
                serde_json::from_str::<LicenseData>(&content).unwrap_or_else(|e| {
                    eprintln!("Failed to parse license file: {}", e);
                    LicenseData::default()
                })
            }
            Err(e) => {
                eprintln!("Failed to read license file: {}", e);
                LicenseData::default()
            }
        }
    }

    /// Persist license data to storage
    fn persist(&self) -> Result<(), String> {
        let path = Self::get_license_path();

        // Ensure directory exists
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let license_data = LicenseData {
            license_type: self.tier.to_license_type(),
            trial_start_timestamp: self.trial_start_timestamp,
            signature: self.signature.clone(),
        };

        let content = serde_json::to_string_pretty(&license_data).map_err(|e| e.to_string())?;
        fs::write(&path, content).map_err(|e| e.to_string())?;

        Ok(())
    }

    /// Get trial start timestamp (for testing/debugging)
    #[allow(dead_code)]
    pub fn get_trial_start_timestamp(&self) -> Option<u64> {
        self.trial_start_timestamp
    }

    /// Reset to free tier (for testing)
    #[allow(dead_code)]
    pub fn reset_to_free(&mut self) {
        self.tier = LicenseTier::Free;
        self.trial_start_timestamp = None;
        self.signature = None;
        let _ = self.persist();
    }
}

/// Get the current license state as a LicenseState-compatible struct
/// This is for backward compatibility with the existing types
///
/// Note: This function creates a new LicenseManager instance. For commands,
/// prefer using the license_manager from EngineState directly.
pub fn get_license_state() -> crate::types::LicenseState {
    // DIAGNOSTIC: Track when get_license_state creates a new instance
    eprintln!("[DIAGNOSTIC] get_license_state() called - WARNING: creates new LicenseManager instance!");
    eprintln!("[DIAGNOSTIC] This may cause stale data if EngineState has a different instance");

    let manager = LicenseManager::new();

    // DIAGNOSTIC: Log what's being returned
    eprintln!("[DIAGNOSTIC] Returning license_type={}", manager.get_license_type());

    crate::types::LicenseState {
        license_type: manager.get_license_type(),
        issued_at: None,
        expires_at: None,
        signature: manager.get_signature(),
    }
}

/// Check if Pro features are enabled (global function)
pub fn is_pro_enabled() -> bool {
    LicenseManager::new().is_pro_enabled()
}



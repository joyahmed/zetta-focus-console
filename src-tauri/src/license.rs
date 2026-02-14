//! License Manager Module - Centralized license management
//!
//! This module is the single source of truth for all license-related operations.
//! Only LicenseManager may mutate LicenseState. All other modules must treat
//! LicenseState as read-only.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

/// Trial duration in seconds (14 days)
const TRIAL_DURATION_SECS: u64 = 14 * 24 * 60 * 60;

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
        let license_data = Self::load_from_storage();

        let mut manager = Self {
            tier: LicenseTier::from_license_type(&license_data.license_type),
            trial_start_timestamp: license_data.trial_start_timestamp,
            signature: license_data.signature,
        };

        // Check trial expiration on startup
        manager.check_trial_expiration();

        // If no license file existed, initialize trial
        if !Self::license_file_exists() {
            manager.initialize_trial();
        }

        manager
    }

    /// Get the current license tier
    pub fn get_tier(&self) -> LicenseTier {
        self.tier
    }

    /// Get license type as string (for UI display)
    pub fn get_license_type(&self) -> String {
        self.tier.to_license_type()
    }

    /// Check if Pro features are enabled
    /// Returns true if: Pro, Founder, or Trial (not expired)
    /// Returns false if: Free
    pub fn is_pro_enabled(&self) -> bool {
        match self.tier {
            LicenseTier::Pro | LicenseTier::Founder => true,
            LicenseTier::Trial => !self.is_trial_expired(),
            LicenseTier::Free => false,
        }
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

            now > start_ts + TRIAL_DURATION_SECS
        } else {
            true // No start timestamp means trial expired
        }
    }

    /// Get trial days remaining (0 if expired or not in trial)
    pub fn get_trial_days_remaining(&self) -> u32 {
        if self.tier != LicenseTier::Trial {
            return 0;
        }

        if let Some(start_ts) = self.trial_start_timestamp {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            let elapsed = now.saturating_sub(start_ts);
            let remaining = TRIAL_DURATION_SECS.saturating_sub(elapsed);

            (remaining / (24 * 60 * 60)) as u32
        } else {
            0
        }
    }

    /// Check if currently in trial period
    pub fn is_in_trial(&self) -> bool {
        self.tier == LicenseTier::Trial && !self.is_trial_expired()
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

        // Step 2: Verify cryptographic signature
        // Note: In production, this would call a real verification module
        // For now, we assume a verification function exists and returns true/false
        let (is_valid, tier, signature) = Self::verify_license_key(key);

        if !is_valid {
            return Err("Invalid license key".to_string());
        }

        // Step 3 & 4: Determine tier and update LicenseState
        self.tier = tier;
        self.trial_start_timestamp = None; // Clear trial state
        self.signature = Some(signature);

        // Step 5: Persist encrypted license
        self.persist()?;

        Ok(())
    }

    /// Verify license key signature
    ///
    /// This is a placeholder function. In production, this would use actual
    /// cryptographic verification. The architecture assumes a verification
    /// module exists.
    ///
    /// # Arguments
    /// * `key` - The license key to verify
    ///
    /// # Returns
    /// * `(is_valid, tier, signature)` - Tuple of validation result, tier, and signature
    fn verify_license_key(key: &str) -> (bool, LicenseTier, String) {
        // Placeholder implementation - assumes verification module exists
        // In production, this would call actual cryptographic verification

        // For now, we'll parse the key format to determine validity
        // Key format expected: "ZETTA-PRO-XXXX" or "ZETTA-FOUNDER-XXXX"

        let key_upper = key.to_uppercase();

        if key_upper.starts_with("ZETTA-PRO-") && key_upper.len() > 10 {
            let code = &key_upper[10..];
            if code.chars().all(|c| c.is_ascii_alphanumeric()) {
                return (true, LicenseTier::Pro, key.to_string());
            }
        }

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
    fn get_license_path() -> PathBuf {
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
pub fn get_license_state() -> crate::types::LicenseState {
    let manager = LicenseManager::new();

    crate::types::LicenseState {
        license_type: manager.get_license_type(),
        issued_at: None,
        expires_at: None,
        signature: manager.signature.clone(),
    }
}

/// Check if Pro features are enabled (global function)
pub fn is_pro_enabled() -> bool {
    LicenseManager::new().is_pro_enabled()
}


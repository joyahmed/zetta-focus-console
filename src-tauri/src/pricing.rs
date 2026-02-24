//! Pricing Strategy Module - Centralized pricing configuration for Zetta Focus Console
//!
//! This module implements the pricing strategy defined in Distribution/05_PRICING_STRATEGY.md
//!
//! # Philosophy
//! - Premium, Focus-driven, Developer-oriented
//! - Not a mass-market gimmick
//! - Pricing reflects seriousness without creating friction
//!
//! # Model
//! - One-Time Purchase (Primary)
//! - No subscription fatigue
//! - Aligns with developer mindset

use serde::{Deserialize, Serialize};

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

/// Pro license pricing
pub mod pro {
    /// Pro price in USD (within $29-$39 range)
    pub const PRICE_USD: f64 = 29.0;

    /// Pro price in BDT (within 1,999-2,999 BDT range)
    pub const PRICE_BDT: f64 = 2499.0;

    /// Product name
    pub const NAME: &str = "Pro";

    /// Product description
    pub const DESCRIPTION: &str = "Lifetime access to all Pro features";
}

/// Founder license pricing
pub mod founder {
    /// Founder price in USD (within $19-$29 range)
    pub const PRICE_USD: f64 = 19.0;

    /// Founder price in BDT (within 1,499-1,999 BDT range)
    pub const PRICE_BDT: f64 = 1499.0;

    /// Product name
    pub const NAME: &str = "Founder";

    /// Product description
    pub const DESCRIPTION: &str = "Limited edition - Early supporter";

    /// Maximum number of Founder licenses available
    pub const MAX_QUANTITY: u32 = 500;
}

/// Trial configuration
pub mod trial {
    /// Trial duration in days
    pub const DURATION_DAYS: u64 = 14;

    /// Trial duration in seconds (30 days)
    pub const DURATION_SECS: u64 = 30 * 24 * 60 * 60;

    /// Whether trial auto-renews (false)
    pub const AUTO_RENEW: bool = false;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/// Feature categories for license tiers
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FeatureCategory {
    /// Core engine features
    Core,
    /// Profile management
    Profiles,
    /// Ambience system
    Ambience,
    /// Terminal commands
    Terminal,
    /// Developer tools
    Developer,
    /// Strict mode
    StrictMode,
}

/// Feature definition with license tier requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feature {
    /// Feature identifier
    pub id: String,
    /// Feature display name
    pub name: String,
    /// Feature description
    pub description: String,
    /// Category this feature belongs to
    pub category: FeatureCategory,
    /// Whether available in Free tier
    pub free: bool,
    /// Whether available in Trial tier
    pub trial: bool,
    /// Whether available in Pro tier
    pub pro: bool,
    /// Whether available in Founder tier
    pub founder: bool,
}

impl Feature {
    /// Check if feature is available for a given license tier
    pub fn is_available(&self, tier: LicenseTierForFeature) -> bool {
        match tier {
            LicenseTierForFeature::Free => self.free,
            LicenseTierForFeature::Trial => self.trial,
            LicenseTierForFeature::Pro => self.pro,
            LicenseTierForFeature::Founder => self.founder,
        }
    }
}

/// License tier for feature checking
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LicenseTierForFeature {
    Free,
    Trial,
    Pro,
    Founder,
}

/// Get all defined features
pub fn get_all_features() -> Vec<Feature> {
    vec![
        // === CORE ENGINE ===
        Feature {
            id: "work_duration".to_string(),
            name: "Work Duration Configuration".to_string(),
            description: "Configure work session duration".to_string(),
            category: FeatureCategory::Core,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "break_duration".to_string(),
            name: "Break Duration Configuration".to_string(),
            description: "Configure break duration".to_string(),
            category: FeatureCategory::Core,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "session_count".to_string(),
            name: "Session / Loop Count".to_string(),
            description: "Configure number of sessions per cycle".to_string(),
            category: FeatureCategory::Core,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "timer_controls".to_string(),
            name: "Timer Controls".to_string(),
            description: "Start / Pause / Stop timer".to_string(),
            category: FeatureCategory::Core,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "auto_transitions".to_string(),
            name: "Auto Work → Break Transitions".to_string(),
            description: "Automatic transitions between work and break".to_string(),
            category: FeatureCategory::Core,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        // === PROFILES ===
        Feature {
            id: "custom_profile".to_string(),
            name: "Custom Profile".to_string(),
            description: "Create custom profiles".to_string(),
            category: FeatureCategory::Profiles,
            free: true, // 1 profile allowed
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "unlimited_profiles".to_string(),
            name: "Unlimited Profiles".to_string(),
            description: "Create unlimited custom profiles".to_string(),
            category: FeatureCategory::Profiles,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "profile_presets".to_string(),
            name: "Profile Presets".to_string(),
            description: "Save and load profile presets".to_string(),
            category: FeatureCategory::Profiles,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        // === AMBIENCE ===
        Feature {
            id: "basic_ambience".to_string(),
            name: "Basic Ambience".to_string(),
            description: "One ambience profile".to_string(),
            category: FeatureCategory::Ambience,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "multiple_ambience".to_string(),
            name: "Multiple Ambience Profiles".to_string(),
            description: "Multiple ambience profiles".to_string(),
            category: FeatureCategory::Ambience,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "premium_sounds".to_string(),
            name: "Premium Sound Packs".to_string(),
            description: "Premium sound packs".to_string(),
            category: FeatureCategory::Ambience,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "dynamic_visuals".to_string(),
            name: "Dynamic Focus-State Visuals".to_string(),
            description: "Engine-aware ambience transitions".to_string(),
            category: FeatureCategory::Ambience,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        // === TERMINAL ===
        Feature {
            id: "basic_terminal".to_string(),
            name: "Basic Terminal Commands".to_string(),
            description: "help, status, clear commands".to_string(),
            category: FeatureCategory::Terminal,
            free: true,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "advanced_terminal".to_string(),
            name: "Advanced Terminal Commands".to_string(),
            description: "Full terminal command set".to_string(),
            category: FeatureCategory::Terminal,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        // === DEVELOPER ===
        Feature {
            id: "dev_mode".to_string(),
            name: "Developer Mode".to_string(),
            description: "Engine state inspection and diagnostics".to_string(),
            category: FeatureCategory::Developer,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "engine_diagnostics".to_string(),
            name: "Engine Diagnostics".to_string(),
            description: "Session diagnostics and timing metrics".to_string(),
            category: FeatureCategory::Developer,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "reset_engine".to_string(),
            name: "Reset Engine Command".to_string(),
            description: "Reset engine state".to_string(),
            category: FeatureCategory::Developer,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        // === STRICT MODE ===
        Feature {
            id: "strict_mode".to_string(),
            name: "Strict Mode".to_string(),
            description: "Commitment mode - pause and stop disabled".to_string(),
            category: FeatureCategory::StrictMode,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "runtime_overrides".to_string(),
            name: "Runtime Overrides".to_string(),
            description: "Modify active session intentionally".to_string(),
            category: FeatureCategory::StrictMode,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
        Feature {
            id: "session_chaining".to_string(),
            name: "Advanced Session Chaining".to_string(),
            description: "Chain multiple sessions together".to_string(),
            category: FeatureCategory::StrictMode,
            free: false,
            trial: true,
            pro: true,
            founder: true,
        },
    ]
}

/// Check if a feature is available for a license tier
pub fn is_feature_available(feature_id: &str, tier: LicenseTierForFeature) -> bool {
    get_all_features()
        .iter()
        .find(|f| f.id == feature_id)
        .map(|f| f.is_available(tier))
        .unwrap_or(false)
}

/// Get features by category
pub fn get_features_by_category(category: FeatureCategory) -> Vec<Feature> {
    get_all_features()
        .into_iter()
        .filter(|f| f.category == category)
        .collect()
}

/// Get features available for a tier
pub fn get_features_for_tier(tier: LicenseTierForFeature) -> Vec<Feature> {
    get_all_features()
        .into_iter()
        .filter(|f| f.is_available(tier))
        .collect()
}

// ============================================================================
// PRICING INFO STRUCTS
// ============================================================================

/// Complete pricing information for a product
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductPricing {
    /// Product type
    pub product_type: String,
    /// Display name
    pub name: String,
    /// Description
    pub description: String,
    /// Price in USD
    pub price_usd: f64,
    /// Price in BDT
    pub price_bdt: f64,
    /// Currency symbol for USD
    pub currency_symbol_usd: String,
    /// Currency symbol for BDT
    pub currency_symbol_bdt: String,
    /// Whether this is a one-time purchase
    pub is_one_time: bool,
    /// Features included
    pub features: Vec<String>,
    /// Whether this is a limited edition
    pub is_limited: bool,
    /// Maximum quantity (if limited)
    pub max_quantity: Option<u32>,
}

impl ProductPricing {
    /// Get Pro pricing
    pub fn pro() -> Self {
        Self {
            product_type: "pro".to_string(),
            name: pro::NAME.to_string(),
            description: pro::DESCRIPTION.to_string(),
            price_usd: pro::PRICE_USD,
            price_bdt: pro::PRICE_BDT,
            currency_symbol_usd: "$".to_string(),
            currency_symbol_bdt: "৳".to_string(),
            is_one_time: true,
            features: vec![
                "Strict Focus Mode".to_string(),
                "Runtime Overrides".to_string(),
                "Advanced chaining".to_string(),
                "Multiple ambience profiles".to_string(),
                "Premium sound packs".to_string(),
                "Developer diagnostics".to_string(),
                "Engine state inspection".to_string(),
                "Unlimited custom profiles".to_string(),
            ],
            is_limited: false,
            max_quantity: None,
        }
    }

    /// Get Founder pricing
    pub fn founder() -> Self {
        Self {
            product_type: "founder".to_string(),
            name: founder::NAME.to_string(),
            description: founder::DESCRIPTION.to_string(),
            price_usd: founder::PRICE_USD,
            price_bdt: founder::PRICE_BDT,
            currency_symbol_usd: "$".to_string(),
            currency_symbol_bdt: "৳".to_string(),
            is_one_time: true,
            features: vec![
                "Everything in Pro".to_string(),
                "Permanent Pro access".to_string(),
                "Special signed key".to_string(),
                "Early access privileges".to_string(),
                "Recognition as early supporter".to_string(),
                "Limited edition status".to_string(),
            ],
            is_limited: true,
            max_quantity: Some(founder::MAX_QUANTITY),
        }
    }
}

/// Trial information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrialInfo {
    /// Duration in days
    pub duration_days: u64,
    /// Whether auto-renew is enabled
    pub auto_renew: bool,
    /// Description
    pub description: String,
    /// Features available during trial
    pub features: Vec<String>,
}

impl TrialInfo {
    /// Get trial information
    pub fn info() -> Self {
        Self {
            duration_days: trial::DURATION_DAYS,
            auto_renew: trial::AUTO_RENEW,
            description: "Full Pro experience for 14 days".to_string(),
            features: vec![
                "Unlimited custom profiles".to_string(),
                "Strict Focus Mode".to_string(),
                "Runtime Overrides".to_string(),
                "Advanced chaining".to_string(),
                "Multiple ambience profiles".to_string(),
                "Premium sound packs".to_string(),
                "Developer diagnostics".to_string(),
                "Engine state inspection".to_string(),
            ],
        }
    }
}

/// Free tier information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FreeTierInfo {
    /// Description
    pub description: String,
    /// Features available
    pub features: Vec<String>,
    /// Limitations
    pub limitations: Vec<String>,
}

impl FreeTierInfo {
    /// Get free tier information
    pub fn info() -> Self {
        Self {
            description: "Complete core engine - No essential functionality removed".to_string(),
            features: vec![
                "Full core engine".to_string(),
                "Work / Break cycles".to_string(),
                "Loop count".to_string(),
                "Basic ambience".to_string(),
                "Theme switching".to_string(),
                "Basic terminal commands".to_string(),
                "1 custom profile".to_string(),
            ],
            limitations: vec![
                "Limited to 1 custom profile".to_string(),
                "No Strict Mode".to_string(),
                "No Developer Mode".to_string(),
            ],
        }
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pro_pricing_constants() {
        assert_eq!(pro::PRICE_USD, 29.0);
        assert_eq!(pro::PRICE_BDT, 2499.0);
    }

    #[test]
    fn test_founder_pricing_constants() {
        assert_eq!(founder::PRICE_USD, 19.0);
        assert_eq!(founder::PRICE_BDT, 1499.0);
        assert_eq!(founder::MAX_QUANTITY, 500);
    }

    #[test]
    fn test_trial_constants() {
        assert_eq!(trial::DURATION_DAYS, 14);
        assert_eq!(trial::DURATION_SECS, 14 * 24 * 60 * 60);
        assert!(!trial::AUTO_RENEW);
    }

    #[test]
    fn test_feature_availability() {
        // Free tier should have basic features
        assert!(is_feature_available(
            "work_duration",
            LicenseTierForFeature::Free
        ));
        assert!(is_feature_available(
            "timer_controls",
            LicenseTierForFeature::Free
        ));
        assert!(is_feature_available(
            "basic_ambience",
            LicenseTierForFeature::Free
        ));

        // Free tier should NOT have Pro features
        assert!(!is_feature_available(
            "strict_mode",
            LicenseTierForFeature::Free
        ));
        assert!(!is_feature_available(
            "dev_mode",
            LicenseTierForFeature::Free
        ));
        assert!(!is_feature_available(
            "unlimited_profiles",
            LicenseTierForFeature::Free
        ));

        // Trial should have all Pro features
        assert!(is_feature_available(
            "strict_mode",
            LicenseTierForFeature::Trial
        ));
        assert!(is_feature_available(
            "dev_mode",
            LicenseTierForFeature::Trial
        ));
        assert!(is_feature_available(
            "unlimited_profiles",
            LicenseTierForFeature::Trial
        ));

        // Pro should have all Pro features
        assert!(is_feature_available(
            "strict_mode",
            LicenseTierForFeature::Pro
        ));
        assert!(is_feature_available("dev_mode", LicenseTierForFeature::Pro));

        // Founder should have all features
        assert!(is_feature_available(
            "strict_mode",
            LicenseTierForFeature::Founder
        ));
        assert!(is_feature_available(
            "dev_mode",
            LicenseTierForFeature::Founder
        ));
    }

    #[test]
    fn test_product_pricing() {
        let pro = ProductPricing::pro();
        assert_eq!(pro.price_usd, 29.0);
        assert_eq!(pro.price_bdt, 2499.0);
        assert!(pro.is_one_time);
        assert!(!pro.is_limited);

        let founder = ProductPricing::founder();
        assert_eq!(founder.price_usd, 19.0);
        assert_eq!(founder.price_bdt, 1499.0);
        assert!(founder.is_limited);
        assert_eq!(founder.max_quantity, Some(500));
    }

    #[test]
    fn test_trial_info() {
        let trial = TrialInfo::info();
        assert_eq!(trial.duration_days, 14);
        assert!(!trial.auto_renew);
    }

    #[test]
    fn test_free_tier_info() {
        let free = FreeTierInfo::info();
        assert!(!free.features.is_empty());
        assert!(!free.limitations.is_empty());
    }
}

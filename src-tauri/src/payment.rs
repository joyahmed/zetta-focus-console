//! Payment Module - Payment provider integration for Zetta Focus Console
//!
//! This module handles payment-related functionality while keeping license
//! validation authority in Rust. Payment providers only:
//! - Process transactions
//! - Issue license keys (or trigger activation)
//! - Notify successful purchase
//!
//! They DO NOT:
//! - Decide feature access
//! - Control engine logic
//! - Validate license state

use serde::{Deserialize, Serialize};
use crate::pricing::{pro, founder};

// ============================================================================
// PAYMENT CONFIGURATION
// ============================================================================

/// Lemon Squeezy configuration
/// These URLs are used to redirect users to the checkout page
pub struct LemonSqueezyConfig {
    /// Pro license checkout URL
    pub pro_checkout_url: &'static str,
    /// Founder license checkout URL
    pub founder_checkout_url: &'static str,
    /// Store URL (for browsing products)
    pub store_url: &'static str,
}

impl LemonSqueezyConfig {
    /// Get the default Lemon Squeezy configuration
    /// In production, these would be actual Lemon Squeezy checkout URLs
    pub fn default() -> Self {
        Self {
            // TODO: Replace with actual Lemon Squeezy checkout URLs
            pro_checkout_url: "https://zetta-focus.lemonsqueezy.com/checkout/buy/pro",
            founder_checkout_url: "https://zetta-focus.lemonsqueezy.com/checkout/buy/founder",
            store_url: "https://zetta-focus.lemonsqueezy.com",
        }
    }

    /// Get Pro checkout URL with optional discount code
    pub fn get_pro_checkout_url(&self, discount_code: Option<&str>) -> String {
        match discount_code {
            Some(code) => format!("{}?discount={}", self.pro_checkout_url, code),
            None => self.pro_checkout_url.to_string(),
        }
    }

    /// Get Founder checkout URL with optional discount code
    pub fn get_founder_checkout_url(&self, discount_code: Option<&str>) -> String {
        match discount_code {
            Some(code) => format!("{}?discount={}", self.founder_checkout_url, code),
            None => self.founder_checkout_url.to_string(),
        }
    }
}

/// bKash payment configuration for Bangladesh market
pub struct BKashConfig {
    /// bKash merchant number
    pub merchant_number: &'static str,
    /// Payment instructions
    pub payment_instructions: &'static str,
    /// Contact for payment confirmation
    pub contact_email: &'static str,
}

impl BKashConfig {
    /// Get the default bKash configuration
    pub fn default() -> Self {
        Self {
            // TODO: Replace with actual bKash merchant number
            merchant_number: "+880-1XXXXXXXXX",
            payment_instructions: "Send payment to the bKash number above and include your email in the reference. You will receive your license key within 24 hours after payment confirmation.",
            contact_email: "support@zettafocus.com",
        }
    }
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/// Payment provider enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentProvider {
    /// Lemon Squeezy - global payment provider
    LemonSqueezy,
    /// bKash - Bangladesh local payment
    BKash,
    /// Stripe - future alternative (not implemented in Phase 1)
    #[allow(dead_code)]
    Stripe,
}

/// Product type for purchase
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProductType {
    /// Pro license - one-time purchase
    Pro,
    /// Founder license - limited edition
    Founder,
}

/// Pricing information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricingInfo {
    /// Product type
    pub product_type: ProductType,
    /// Price in USD (global)
    pub price_usd: f64,
    /// Price in BDT (Bangladesh)
    pub price_bdt: f64,
    /// Currency symbol for display
    pub currency_symbol: String,
    /// Whether this is a one-time purchase
    pub is_one_time: bool,
    /// Features included
    pub features: Vec<String>,
}

impl PricingInfo {
    /// Get pricing for Pro license
    /// Uses centralized pricing constants from pricing module
    pub fn pro() -> Self {
        Self {
            product_type: ProductType::Pro,
            price_usd: pro::PRICE_USD,
            price_bdt: pro::PRICE_BDT,
            currency_symbol: "$".to_string(),
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
        }
    }

    /// Get pricing for Founder license
    /// Uses centralized pricing constants from pricing module
    pub fn founder() -> Self {
        Self {
            product_type: ProductType::Founder,
            price_usd: founder::PRICE_USD,
            price_bdt: founder::PRICE_BDT,
            currency_symbol: "$".to_string(),
            is_one_time: true,
            features: vec![
                "Everything in Pro".to_string(),
                "Permanent Pro access".to_string(),
                "Special signed key".to_string(),
                "Early access privileges".to_string(),
                "Recognition as early supporter".to_string(),
                "Limited edition status".to_string(),
            ],
        }
    }
}

/// Payment checkout response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckoutInfo {
    /// Provider to use
    pub provider: PaymentProvider,
    /// Product type
    pub product_type: ProductType,
    /// Checkout URL (for Lemon Squeezy)
    pub checkout_url: Option<String>,
    /// bKash payment info (for Bangladesh)
    pub bkash_info: Option<BKashPaymentInfo>,
    /// Pricing information
    pub pricing: PricingInfo,
}

/// bKash payment information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BKashPaymentInfo {
    /// Merchant number to send payment to
    pub merchant_number: String,
    /// Amount to pay in BDT
    pub amount: f64,
    /// Payment instructions
    pub instructions: String,
    /// Contact email for confirmation
    pub contact_email: String,
}

// ============================================================================
// PAYMENT FUNCTIONS
// ============================================================================

/// Get checkout URL for Lemon Squeezy purchase
///
/// # Arguments
/// * `product_type` - The product to purchase (Pro or Founder)
/// * `discount_code` - Optional discount code
///
/// # Returns
/// The checkout URL for the Lemon Squeezy checkout page
pub fn get_lemon_squeezy_checkout_url(
    product_type: ProductType,
    discount_code: Option<&str>,
) -> String {
    let config = LemonSqueezyConfig::default();

    match product_type {
        ProductType::Pro => config.get_pro_checkout_url(discount_code),
        ProductType::Founder => config.get_founder_checkout_url(discount_code),
    }
}

/// Get bKash payment information for Bangladesh users
///
/// # Arguments
/// * `product_type` - The product to purchase (Pro or Founder)
///
/// # Returns
/// Payment information for bKash transaction
pub fn get_bkash_payment_info(product_type: ProductType) -> BKashPaymentInfo {
    let config = BKashConfig::default();
    let pricing = match product_type {
        ProductType::Pro => PricingInfo::pro(),
        ProductType::Founder => PricingInfo::founder(),
    };

    BKashPaymentInfo {
        merchant_number: config.merchant_number.to_string(),
        amount: pricing.price_bdt,
        instructions: config.payment_instructions.to_string(),
        contact_email: config.contact_email.to_string(),
    }
}

/// Get checkout information for a product
///
/// # Arguments
/// * `product_type` - The product to purchase
/// * `provider` - The payment provider to use
/// * `discount_code` - Optional discount code (for Lemon Squeezy)
///
/// # Returns
/// Complete checkout information
pub fn get_checkout_info(
    product_type: ProductType,
    provider: PaymentProvider,
    discount_code: Option<&str>,
) -> CheckoutInfo {
    let pricing = match product_type {
        ProductType::Pro => PricingInfo::pro(),
        ProductType::Founder => PricingInfo::founder(),
    };

    let checkout_url = match provider {
        PaymentProvider::LemonSqueezy => {
            Some(get_lemon_squeezy_checkout_url(product_type, discount_code))
        }
        _ => None,
    };

    let bkash_info = match provider {
        PaymentProvider::BKash => Some(get_bkash_payment_info(product_type)),
        _ => None,
    };

    CheckoutInfo {
        provider,
        product_type,
        checkout_url,
        bkash_info,
        pricing,
    }
}

/// Open checkout page in browser
///
/// # Arguments
/// * `url` - The checkout URL to open
///
/// # Returns
/// Result indicating success or failure
pub fn open_checkout_in_browser(url: &str) -> Result<(), String> {
    // Use the `open` crate or similar to open the URL in the default browser
    // This is a placeholder - actual implementation would use tauri's shell API
    // or the `open` crate

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", url])
            .spawn()
            .map_err(|e| format!("Failed to open browser: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open browser: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open browser: {}", e))?;
    }

    Ok(())
}

/// Get all available payment options
/// Returns a list of available payment providers with their checkout info
pub fn get_available_payment_options() -> Vec<PaymentOption> {
    vec![
        PaymentOption {
            provider: PaymentProvider::LemonSqueezy,
            name: "Lemon Squeezy".to_string(),
            description: "Global payment - Credit card, PayPal, Apple Pay".to_string(),
            is_available: true,
            supports_discount_codes: true,
        },
        PaymentOption {
            provider: PaymentProvider::BKash,
            name: "bKash".to_string(),
            description: "Bangladesh local payment - Manual key issuance".to_string(),
            is_available: true,
            supports_discount_codes: false,
        },
    ]
}

/// Payment option for display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentOption {
    /// Provider identifier
    pub provider: PaymentProvider,
    /// Display name
    pub name: String,
    /// Description of the payment method
    pub description: String,
    /// Whether this option is currently available
    pub is_available: bool,
    /// Whether this provider supports discount codes
    pub supports_discount_codes: bool,
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pricing_info_pro() {
        let pricing = PricingInfo::pro();
        assert_eq!(pricing.product_type, ProductType::Pro);
        assert_eq!(pricing.price_usd, 29.0);
        assert!(pricing.is_one_time);
        assert!(!pricing.features.is_empty());
    }

    #[test]
    fn test_pricing_info_founder() {
        let pricing = PricingInfo::founder();
        assert_eq!(pricing.product_type, ProductType::Founder);
        assert_eq!(pricing.price_usd, 19.0);
        assert!(pricing.is_one_time);
    }

    #[test]
    fn test_checkout_url_generation() {
        let url = get_lemon_squeezy_checkout_url(ProductType::Pro, None);
        assert!(url.contains("pro"));

        let url_with_discount = get_lemon_squeezy_checkout_url(ProductType::Pro, Some("FOUNDER20"));
        assert!(url_with_discount.contains("discount=FOUNDER20"));
    }

    #[test]
    fn test_bkash_payment_info() {
        let info = get_bkash_payment_info(ProductType::Pro);
        assert_eq!(info.amount, 2499.0);
        assert!(!info.merchant_number.is_empty());
    }

    #[test]
    fn test_available_payment_options() {
        let options = get_available_payment_options();
        assert_eq!(options.len(), 2);
        assert!(options.iter().any(|o| o.provider == PaymentProvider::LemonSqueezy));
        assert!(options.iter().any(|o| o.provider == PaymentProvider::BKash));
    }
}

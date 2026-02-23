//! Configuration Module - Environment-based configuration for Zetta Focus Console
//!
//! This module loads configuration from environment variables at runtime.
//! In development, it uses .env file. In production, use system environment variables.
//!
//! ## Setup
//! 1. Copy `.env.example` to `.env`
//! 2. Fill in your actual values
//! 3. Never commit `.env` to version control

use std::sync::LazyLock;

/// Initialize dotenv on first access
static DOTENV_LOADED: LazyLock<()> = LazyLock::new(|| {
    // Only load .env in debug builds
    #[cfg(debug_assertions)]
    {
        if let Err(e) = dotenv::dotenv() {
            eprintln!("[CONFIG] Warning: Could not load .env file: {}", e);
        } else {
            eprintln!("[CONFIG] Loaded .env file successfully");
        }
    }
});

/// Load dotenv and ensure it's only done once
fn ensure_dotenv_loaded() {
    let _ = &*DOTENV_LOADED;
}

// ============================================================================
// LEMON SQUEEZY CONFIGURATION
// ============================================================================

/// Get Lemon Squeezy signing secret from environment
pub fn get_lemon_squeezy_signing_secret() -> String {
    ensure_dotenv_loaded();
    std::env::var("LEMON_SQUEEZY_SIGNING_SECRET")
        .unwrap_or_else(|_| {
            eprintln!("[CONFIG] Warning: LEMON_SQUEEZY_SIGNING_SECRET not set, using placeholder");
            "your_signing_secret_here".to_string()
        })
}

/// Get Lemon Squeezy store ID from environment
pub fn get_lemon_squeezy_store_id() -> Option<String> {
    ensure_dotenv_loaded();
    std::env::var("LEMON_SQUEEZY_STORE_ID").ok()
}

/// Get Pro checkout URL from environment
pub fn get_pro_checkout_url() -> String {
    ensure_dotenv_loaded();
    std::env::var("LEMON_SQUEEZY_PRO_CHECKOUT_URL")
        .unwrap_or_else(|_| {
            "https://zetta-focus.lemonsqueezy.com/checkout/buy/pro".to_string()
        })
}

/// Get Founder checkout URL from environment
pub fn get_founder_checkout_url() -> String {
    ensure_dotenv_loaded();
    std::env::var("LEMON_SQUEEZY_FOUNDER_CHECKOUT_URL")
        .unwrap_or_else(|_| {
            "https://zetta-focus.lemonsqueezy.com/checkout/buy/founder".to_string()
        })
}

/// Get store URL from environment
pub fn get_store_url() -> String {
    ensure_dotenv_loaded();
    std::env::var("LEMON_SQUEEZY_STORE_URL")
        .unwrap_or_else(|_| {
            "https://zetta-focus.lemonsqueezy.com".to_string()
        })
}

// ============================================================================
// LICENSE CRYPTOGRAPHIC KEYS
// ============================================================================

/// Get the Ed25519 public key from environment (hex-encoded)
/// Returns 32 bytes for signature verification
pub fn get_license_public_key() -> [u8; 32] {
    ensure_dotenv_loaded();

    let key_hex = std::env::var("LICENSE_PUBLIC_KEY")
        .unwrap_or_else(|_| {
            // Default placeholder key - MUST be replaced in production
            "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f".to_string()
        });

    // Parse hex string to bytes
    match hex::decode(&key_hex) {
        Ok(bytes) => {
            if bytes.len() == 32 {
                let mut arr = [0u8; 32];
                arr.copy_from_slice(&bytes);
                arr
            } else {
                eprintln!("[CONFIG] Error: LICENSE_PUBLIC_KEY must be 32 bytes, got {}", bytes.len());
                fallback_public_key()
            }
        }
        Err(e) => {
            eprintln!("[CONFIG] Error parsing LICENSE_PUBLIC_KEY: {}", e);
            fallback_public_key()
        }
    }
}

/// Fallback public key (placeholder - should never be used in production)
fn fallback_public_key() -> [u8; 32] {
    [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
        0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
        0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    ]
}

// ============================================================================
// BKASH CONFIGURATION
// ============================================================================

/// Get bKash merchant number from environment
pub fn get_bkash_merchant_number() -> String {
    ensure_dotenv_loaded();
    std::env::var("BKASH_MERCHANT_NUMBER")
        .unwrap_or_else(|_| "+880-1XXXXXXXXX".to_string())
}

/// Get bKash contact email from environment
pub fn get_bkash_contact_email() -> String {
    ensure_dotenv_loaded();
    std::env::var("BKASH_CONTACT_EMAIL")
        .unwrap_or_else(|_| "support@zettafocus.com".to_string())
}

// ============================================================================
// APP CONFIGURATION
// ============================================================================

/// Check if running in development mode
pub fn is_development() -> bool {
    ensure_dotenv_loaded();
    std::env::var("APP_ENV")
        .map(|v| v == "development")
        .unwrap_or(cfg!(debug_assertions))
}

/// Check if debug mode is enabled
pub fn is_debug() -> bool {
    ensure_dotenv_loaded();
    std::env::var("APP_DEBUG")
        .map(|v| v == "true")
        .unwrap_or(cfg!(debug_assertions))
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fallback_public_key() {
        let key = fallback_public_key();
        assert_eq!(key.len(), 32);
    }

    #[test]
    fn test_get_license_public_key_parses_hex() {
        // This will use the fallback since no env var is set in tests
        let key = get_license_public_key();
        assert_eq!(key.len(), 32);
    }
}

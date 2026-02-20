//! License Cryptographic Module - Ed25519 signature verification for license keys
//!
//! This module implements the cryptographic verification of license keys using
//! Ed25519 digital signatures. The public key is embedded in the application,
//! while the private key remains on the backend signing server.
//!
//! Architecture:
//! - Private key: Stored securely on backend (never in client)
//! - Public key: Embedded in Rust (safe to expose)
//! - Offline verification: No server required for validation

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

// ============================================================================
// EMBEDDED PUBLIC KEY
// ============================================================================

/// Embedded Ed25519 public key for license verification.
/// This is safe to include in the client - it can only verify, not sign.
///
/// IMPORTANT: Replace this with your actual public key bytes (32 bytes)
/// generated during the key generation process.
///
/// To generate a new keypair, use the generate_keypair() function in tests
/// or a separate key generation tool.
pub const LICENSE_PUBLIC_KEY_BYTES: [u8; 32] = [
    // Placeholder public key - REPLACE WITH ACTUAL KEY IN PRODUCTION
    // This is a dummy key that will be replaced during deployment
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
    0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
];

// ============================================================================
// LICENSE PAYLOAD STRUCTURE
// ============================================================================

/// License payload structure - the data that gets signed
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LicensePayload {
    /// Product identifier (always "ZFC" for Zetta Focus Console)
    pub product: String,
    /// License tier: "PRO" or "FOUNDER"
    pub tier: String,
    /// Unix timestamp when license was issued
    pub issued_at: u64,
    /// Optional expiry timestamp (null for lifetime licenses)
    pub expiry: Option<u64>,
    /// Unique license identifier
    pub license_id: String,
    /// Whether this is a founder license
    #[serde(default)]
    pub founder: bool,
}

impl LicensePayload {
    /// Create a new license payload
    pub fn new(tier: String, license_id: String) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};
        let issued_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let founder = tier == "FOUNDER";

        Self {
            product: "ZFC".to_string(),
            tier,
            issued_at,
            expiry: None, // Lifetime license
            license_id,
            founder,
        }
    }

    /// Serialize payload to canonical JSON bytes for signing
    /// Uses sorted keys for deterministic serialization
    pub fn to_signing_bytes(&self) -> Vec<u8> {
        // Use canonical JSON serialization
        let mut sorted = serde_json::json!({
            "product": self.product,
            "tier": self.tier,
            "issued_at": self.issued_at,
            "license_id": self.license_id,
        });

        if let Some(expiry) = self.expiry {
            sorted["expiry"] = serde_json::json!(expiry);
        }

        if self.founder {
            sorted["founder"] = serde_json::json!(true);
        }

        // Serialize with sorted keys
        let mut buf = Vec::new();
        let mut serializer = serde_json::Serializer::new(&mut buf);
        serde_json::Value::Object(sorted.as_object().unwrap().clone())
            .serialize(&mut serializer)
            .expect("serialization should not fail");
        buf
    }

    /// Compute SHA-256 hash of payload for integrity checks
    pub fn hash(&self) -> [u8; 32] {
        let signing_bytes = self.to_signing_bytes();
        let mut hasher = Sha256::new();
        hasher.update(&signing_bytes);
        hasher.finalize().into()
    }
}

// ============================================================================
// SIGNED LICENSE KEY
// ============================================================================

/// Signed license key containing payload and signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignedLicense {
    /// The license payload
    pub payload: LicensePayload,
    /// The Ed25519 signature (64 bytes, base64 encoded in transport)
    pub signature: Vec<u8>,
}

impl SignedLicense {
    /// Create a new signed license (used by backend signing service)
    #[cfg(feature = "signing")]
    pub fn sign(payload: LicensePayload, private_key: &ed25519_dalek::SigningKey) -> Self {
        use ed25519_dalek::Signer;

        let signing_bytes = payload.to_signing_bytes();
        let signature = private_key.sign(&signing_bytes).to_bytes().to_vec();

        Self { payload, signature }
    }

    /// Verify the signature against the embedded public key
    pub fn verify(&self) -> Result<(), LicenseError> {
        let public_key = VerifyingKey::from_bytes(&LICENSE_PUBLIC_KEY_BYTES)
            .map_err(|_| LicenseError::InvalidPublicKey)?;

        let signature = Signature::from_slice(&self.signature)
            .map_err(|_| LicenseError::InvalidSignatureFormat)?;

        let signing_bytes = self.payload.to_signing_bytes();

        public_key
            .verify(&signing_bytes, &signature)
            .map_err(|_| LicenseError::SignatureVerificationFailed)?;

        Ok(())
    }

    /// Encode to transport format: BASE64(payload_json).BASE64(signature)
    pub fn encode(&self) -> String {
        let payload_json = serde_json::to_string(&self.payload).unwrap_or_default();
        let payload_b64 = BASE64.encode(payload_json.as_bytes());
        let sig_b64 = BASE64.encode(&self.signature);
        format!("{}.{}", payload_b64, sig_b64)
    }

    /// Decode from transport format
    pub fn decode(encoded: &str) -> Result<Self, LicenseError> {
        let parts: Vec<&str> = encoded.split('.').collect();
        if parts.len() != 2 {
            return Err(LicenseError::InvalidKeyFormat);
        }

        let payload_bytes = BASE64
            .decode(parts[0])
            .map_err(|_| LicenseError::InvalidBase64)?;
        let signature = BASE64
            .decode(parts[1])
            .map_err(|_| LicenseError::InvalidBase64)?;

        let payload: LicensePayload =
            serde_json::from_slice(&payload_bytes).map_err(|_| LicenseError::InvalidPayloadJson)?;

        Ok(Self { payload, signature })
    }
}

// ============================================================================
// LICENSE KEY PARSER
// ============================================================================

/// Parsed license key components
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedLicenseKey {
    /// Key prefix (ZFC)
    pub prefix: String,
    /// License tier (PRO or FOUNDER)
    pub tier: String,
    /// License code (the XXXX-XXXX part)
    pub code: String,
    /// Encoded signed data (if present)
    pub signed_data: Option<String>,
}

impl ParsedLicenseKey {
    /// Parse a license key string
    ///
    /// Supported formats:
    /// - ZFC-PRO-XXXX-XXXX (simple format, for testing)
    /// - ZFC-FOUNDER-XXXX-XXXX (simple format, for testing)
    /// - ZFC-PRO-XXXX-XXXX.ENCODED_DATA (signed format)
    /// - ZETTA-PRO-XXXX (legacy format)
    /// - ZETTA-FOUNDER-XXXX (legacy format)
    pub fn parse(key: &str) -> Result<Self, LicenseError> {
        let key = key.trim().to_uppercase();

        // Check for signed format (contains encoded data after the key)
        let (key_part, signed_data) = if key.contains('.') {
            let parts: Vec<&str> = key.splitn(2, '.').collect();
            (parts[0], Some(parts[1].to_string()))
        } else {
            (key.as_str(), None)
        };

        // Parse new format: ZFC-PRO-XXXX-XXXX
        if key_part.starts_with("ZFC-PRO-") {
            let remaining = &key_part[8..]; // Skip "ZFC-PRO-"
            let parts: Vec<&str> = remaining.split('-').collect();
            if parts.len() >= 2 {
                let code = parts.join("-");
                if code.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
                    return Ok(Self {
                        prefix: "ZFC".to_string(),
                        tier: "PRO".to_string(),
                        code,
                        signed_data,
                    });
                }
            }
        }

        // Parse new format: ZFC-FOUNDER-XXXX-XXXX
        if key_part.starts_with("ZFC-FOUNDER-") {
            let remaining = &key_part[12..]; // Skip "ZFC-FOUNDER-"
            let parts: Vec<&str> = remaining.split('-').collect();
            if parts.len() >= 2 {
                let code = parts.join("-");
                if code.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
                    return Ok(Self {
                        prefix: "ZFC".to_string(),
                        tier: "FOUNDER".to_string(),
                        code,
                        signed_data,
                    });
                }
            }
        }

        // Parse legacy format: ZETTA-PRO-XXXX
        if key_part.starts_with("ZETTA-PRO-") {
            let code = &key_part[10..];
            if code.chars().all(|c| c.is_ascii_alphanumeric()) {
                return Ok(Self {
                    prefix: "ZETTA".to_string(),
                    tier: "PRO".to_string(),
                    code: code.to_string(),
                    signed_data,
                });
            }
        }

        // Parse legacy format: ZETTA-FOUNDER-XXXX
        if key_part.starts_with("ZETTA-FOUNDER-") {
            let code = &key_part[14..];
            if code.chars().all(|c| c.is_ascii_alphanumeric()) {
                return Ok(Self {
                    prefix: "ZETTA".to_string(),
                    tier: "FOUNDER".to_string(),
                    code: code.to_string(),
                    signed_data,
                });
            }
        }

        Err(LicenseError::InvalidKeyFormat)
    }

    /// Check if this key has signed data
    pub fn has_signature(&self) -> bool {
        self.signed_data.is_some()
    }

    /// Verify the signed data if present
    pub fn verify_signed(&self) -> Result<SignedLicense, LicenseError> {
        let signed_data = self
            .signed_data
            .as_ref()
            .ok_or(LicenseError::NoSignedData)?;

        let signed_license = SignedLicense::decode(signed_data)?;

        // Verify the signature
        signed_license.verify()?;

        // Verify the tier matches
        if signed_license.payload.tier != self.tier {
            return Err(LicenseError::TierMismatch);
        }

        // Verify the product
        if signed_license.payload.product != "ZFC" {
            return Err(LicenseError::InvalidProduct);
        }

        Ok(signed_license)
    }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/// License verification errors
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LicenseError {
    /// Invalid key format
    InvalidKeyFormat,
    /// Invalid base64 encoding
    InvalidBase64,
    /// Invalid payload JSON
    InvalidPayloadJson,
    /// Invalid signature format
    InvalidSignatureFormat,
    /// Invalid public key
    InvalidPublicKey,
    /// Signature verification failed
    SignatureVerificationFailed,
    /// No signed data in key
    NoSignedData,
    /// Tier mismatch between key and signed data
    TierMismatch,
    /// Invalid product in license
    InvalidProduct,
    /// License has expired
    LicenseExpired,
    /// Invalid license ID
    InvalidLicenseId,
}

impl std::fmt::Display for LicenseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LicenseError::InvalidKeyFormat => write!(f, "Invalid license key format"),
            LicenseError::InvalidBase64 => write!(f, "Invalid base64 encoding"),
            LicenseError::InvalidPayloadJson => write!(f, "Invalid license payload JSON"),
            LicenseError::InvalidSignatureFormat => write!(f, "Invalid signature format"),
            LicenseError::InvalidPublicKey => write!(f, "Invalid public key"),
            LicenseError::SignatureVerificationFailed => write!(f, "Signature verification failed"),
            LicenseError::NoSignedData => write!(f, "No signed data in license key"),
            LicenseError::TierMismatch => write!(f, "License tier mismatch"),
            LicenseError::InvalidProduct => write!(f, "Invalid product in license"),
            LicenseError::LicenseExpired => write!(f, "License has expired"),
            LicenseError::InvalidLicenseId => write!(f, "Invalid license ID"),
        }
    }
}

impl std::error::Error for LicenseError {}

// ============================================================================
// LICENSE VERIFICATION FUNCTION
// ============================================================================

/// Verify a license key and return the license tier
///
/// This function:
/// 1. Parses the license key format
/// 2. If signed data is present, verifies the cryptographic signature
/// 3. Returns the license tier if valid
///
/// # Arguments
/// * `key` - The license key string
///
/// # Returns
/// * `Ok((tier, license_id))` - The license tier and ID if valid
/// * `Err(LicenseError)` - If verification fails
pub fn verify_license(key: &str) -> Result<(String, Option<String>), LicenseError> {
    // DIAGNOSTIC: Track license verification
    eprintln!("[DIAGNOSTIC] verify_license() called");
    eprintln!("[DIAGNOSTIC] Key (first 20 chars): {}...", &key.chars().take(20).collect::<String>());

    let parsed = ParsedLicenseKey::parse(key)?;
    eprintln!("[DIAGNOSTIC] Parsed key: prefix={}, tier={}, has_signature={}",
        parsed.prefix, parsed.tier, parsed.has_signature());

    // If the key has signed data, verify it
    if parsed.has_signature() {
        eprintln!("[DIAGNOSTIC] Key has signature, verifying...");
        let signed_license = parsed.verify_signed()?;

        // Check expiry if set
        if let Some(expiry) = signed_license.payload.expiry {
            use std::time::{SystemTime, UNIX_EPOCH};
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);

            if now > expiry {
                eprintln!("[DIAGNOSTIC] License expired at {}", expiry);
                return Err(LicenseError::LicenseExpired);
            }
        }

        eprintln!("[DIAGNOSTIC] Signed license verified successfully");

        return Ok((
            signed_license.payload.tier,
            Some(signed_license.payload.license_id),
        ));
    }

    // For keys without signatures (testing/development mode)
    // This allows backward compatibility with simple format keys
    // In production, all keys should be signed
    // DIAGNOSTIC: Warn about unsigned key acceptance
    eprintln!("[DIAGNOSTIC] WARNING: Accepting UNSIGNED key! Tier={}", parsed.tier);
    eprintln!("[DIAGNOSTIC] In production, all keys should be cryptographically signed!");
    Ok((parsed.tier, None))
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    #[test]
    fn test_parse_simple_pro_key() {
        let key = "ZFC-PRO-ABCD-1234";
        let parsed = ParsedLicenseKey::parse(key).unwrap();
        assert_eq!(parsed.prefix, "ZFC");
        assert_eq!(parsed.tier, "PRO");
        assert_eq!(parsed.code, "ABCD-1234");
        assert!(!parsed.has_signature());
    }

    #[test]
    fn test_parse_simple_founder_key() {
        let key = "ZFC-FOUNDER-WXYZ-5678";
        let parsed = ParsedLicenseKey::parse(key).unwrap();
        assert_eq!(parsed.prefix, "ZFC");
        assert_eq!(parsed.tier, "FOUNDER");
        assert_eq!(parsed.code, "WXYZ-5678");
        assert!(!parsed.has_signature());
    }

    #[test]
    fn test_parse_legacy_pro_key() {
        let key = "ZETTA-PRO-ABCD1234";
        let parsed = ParsedLicenseKey::parse(key).unwrap();
        assert_eq!(parsed.prefix, "ZETTA");
        assert_eq!(parsed.tier, "PRO");
        assert_eq!(parsed.code, "ABCD1234");
    }

    #[test]
    fn test_parse_legacy_founder_key() {
        let key = "ZETTA-FOUNDER-WXYZ5678";
        let parsed = ParsedLicenseKey::parse(key).unwrap();
        assert_eq!(parsed.prefix, "ZETTA");
        assert_eq!(parsed.tier, "FOUNDER");
        assert_eq!(parsed.code, "WXYZ5678");
    }

    #[test]
    fn test_parse_invalid_key() {
        let key = "INVALID-KEY";
        let result = ParsedLicenseKey::parse(key);
        assert!(result.is_err());
    }

    #[test]
    fn test_payload_serialization() {
        let payload = LicensePayload::new("PRO".to_string(), "TEST-1234".to_string());
        let bytes = payload.to_signing_bytes();
        assert!(!bytes.is_empty());

        // Should be deterministic
        let bytes2 = payload.to_signing_bytes();
        assert_eq!(bytes, bytes2);
    }

    #[test]
    fn test_verify_simple_key() {
        let key = "ZFC-PRO-ABCD-1234";
        let result = verify_license(key);
        assert!(result.is_ok());
        let (tier, license_id) = result.unwrap();
        assert_eq!(tier, "PRO");
        assert!(license_id.is_none());
    }

    #[test]
    fn test_verify_founder_key() {
        let key = "ZFC-FOUNDER-WXYZ-5678";
        let result = verify_license(key);
        assert!(result.is_ok());
        let (tier, _) = result.unwrap();
        assert_eq!(tier, "FOUNDER");
    }
}

/// Helper for testing: verify with a specific public key
#[cfg(test)]
impl SignedLicense {
    fn verify_with_key(&self, public_key: VerifyingKey) -> Result<(), LicenseError> {
        let signature = Signature::from_slice(&self.signature)
            .map_err(|_| LicenseError::InvalidSignatureFormat)?;

        let signing_bytes = self.payload.to_signing_bytes();

        public_key
            .verify(&signing_bytes, &signature)
            .map_err(|_| LicenseError::SignatureVerificationFailed)?;

        Ok(())
    }
}

// ============================================================================
// SIGNING TESTS (only run with "signing" feature)
// ============================================================================

#[cfg(all(test, feature = "signing"))]
mod signing_tests {
    use super::*;
    use ed25519_dalek::SigningKey;
    use rand::rngs::OsRng;

    #[test]
    fn test_signed_license_encode_decode() {
        let payload = LicensePayload::new("PRO".to_string(), "TEST-5678".to_string());
        let signing_key = SigningKey::generate(&mut OsRng);

        // Sign the payload
        let signed = SignedLicense::sign(payload.clone(), &signing_key);

        // Encode and decode
        let encoded = signed.encode();
        let decoded = SignedLicense::decode(&encoded).unwrap();

        assert_eq!(decoded.payload, payload);
    }

    #[test]
    fn test_signature_verification() {
        let payload = LicensePayload::new("PRO".to_string(), "TEST-9999".to_string());
        let signing_key = SigningKey::generate(&mut OsRng);
        let public_key = signing_key.verifying_key();

        // Sign with private key
        let signed = SignedLicense::sign(payload, &signing_key);

        // Verify should succeed with matching public key
        // Note: This test uses the generated public key, not the embedded one
        assert!(signed.verify_with_key(public_key).is_ok());
    }
}

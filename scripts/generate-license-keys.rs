//! License Key Generation Utility
//!
//! This script generates Ed25519 keypairs and signed license keys for Zetta Focus Console.
//!
//! Usage:
//!   # Generate a new keypair (run once, save the private key securely)
//!   cargo run --example generate-keys -- keypair
//!
//!   # Generate a signed license key
//!   cargo run --example generate-keys -- license --tier PRO --id ABCD-1234
//!   cargo run --example generate-keys -- license --tier FOUNDER --id WXYZ-5678

use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use rand::rngs::OsRng;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// License payload structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicensePayload {
    pub product: String,
    pub tier: String,
    pub issued_at: u64,
    pub expiry: Option<u64>,
    pub license_id: String,
    #[serde(default)]
    pub founder: bool,
}

impl LicensePayload {
    pub fn new(tier: String, license_id: String) -> Self {
        let issued_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let founder = tier == "FOUNDER";

        Self {
            product: "ZFC".to_string(),
            tier,
            issued_at,
            expiry: None,
            license_id,
            founder,
        }
    }

    pub fn to_signing_bytes(&self) -> Vec<u8> {
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

        let mut buf = Vec::new();
        let mut serializer = serde_json::Serializer::new(&mut buf);
        serde_json::Value::Object(sorted.as_object().unwrap().clone())
            .serialize(&mut serializer)
            .expect("serialization should not fail");
        buf
    }
}

/// Signed license structure
pub struct SignedLicense {
    pub payload: LicensePayload,
    pub signature: Vec<u8>,
}

impl SignedLicense {
    pub fn sign(payload: LicensePayload, signing_key: &SigningKey) -> Self {
        let signing_bytes = payload.to_signing_bytes();
        let signature = signing_key.sign(&signing_bytes).to_bytes().to_vec();
        Self { payload, signature }
    }

    pub fn encode(&self) -> String {
        let payload_json = serde_json::to_string(&self.payload).unwrap_or_default();
        let payload_b64 = BASE64.encode(payload_json.as_bytes());
        let sig_b64 = BASE64.encode(&self.signature);
        format!("{}.{}", payload_b64, sig_b64)
    }
}

fn generate_keypair() {
    println!("=== Generating new Ed25519 Keypair ===\n");

    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    let verifying_key = signing_key.verifying_key();

    let private_key_bytes = signing_key.to_bytes();
    let public_key_bytes = verifying_key.to_bytes();

    println!("PRIVATE KEY (keep this secret!):");
    println!("  Hex: {}", hex::encode(private_key_bytes));
    println!("  Base64: {}\n", BASE64.encode(&private_key_bytes));

    println!("PUBLIC KEY (embed this in the app):");
    println!("  Hex: {}", hex::encode(public_key_bytes));
    println!("  Base64: {}\n", BASE64.encode(&public_key_bytes));

    println!("Rust array format for embedding:");
    print!("  pub const LICENSE_PUBLIC_KEY_BYTES: [u8; 32] = [");
    for (i, byte) in public_key_bytes.iter().enumerate() {
        if i > 0 {
            print!(", ");
        }
        print!("0x{:02x}", byte);
    }
    println!("];\n");

    println!("IMPORTANT:");
    println!("  1. Save the PRIVATE KEY securely (e.g., in a password manager)");
    println!("  2. Embed the PUBLIC KEY in src-tauri/src/license_crypto.rs");
    println!("  3. Never commit the private key to version control!");
}

fn generate_license(tier: &str, license_id: &str, private_key_hex: Option<&str>) {
    println!("=== Generating Signed License Key ===\n");

    let private_key_bytes = match private_key_hex {
        Some(hex) => {
            hex::decode(hex).expect("Invalid hex private key")
        }
        None => {
            eprintln!("Error: Private key is required.");
            eprintln!("Usage: --private-key <hex_encoded_private_key>");
            std::process::exit(1);
        }
    };

    let signing_key = SigningKey::from_bytes(
        private_key_bytes.as_slice().try_into().expect("Invalid private key length")
    );

    let payload = LicensePayload::new(tier.to_string(), license_id.to_string());
    let signed = SignedLicense::sign(payload.clone(), &signing_key);
    let encoded = signed.encode();

    // Generate the full license key
    let prefix = if tier == "FOUNDER" {
        "ZFC-FOUNDER"
    } else {
        "ZFC-PRO"
    };

    let full_key = format!("{}-{}.{}", prefix, license_id, encoded);

    println!("License Details:");
    println!("  Tier: {}", tier);
    println!("  ID: {}", license_id);
    println!("  Issued: {}", payload.issued_at);
    println!();

    println!("Full License Key:");
    println!("  {}", full_key);
    println!();

    println!("For testing, you can use this key in the app's license activation.");
}

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        println!("Zetta Focus Console - License Key Generator\n");
        println!("Usage:");
        println!("  {} keypair                    - Generate a new keypair", args[0]);
        println!("  {} license [options]          - Generate a signed license\n", args[0]);
        println!("License options:");
        println!("  --tier <PRO|FOUNDER>          - License tier");
        println!("  --id <XXXX-XXXX>              - License ID");
        println!("  --private-key <hex>           - Private key in hex format");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "keypair" => generate_keypair(),
        "license" => {
            let mut tier = "PRO";
            let mut id = "XXXX-XXXX";
            let mut private_key: Option<&str> = None;

            let mut i = 2;
            while i < args.len() {
                match args[i].as_str() {
                    "--tier" => {
                        tier = args.get(i + 1).expect("--tier requires a value");
                        i += 2;
                    }
                    "--id" => {
                        id = args.get(i + 1).expect("--id requires a value");
                        i += 2;
                    }
                    "--private-key" => {
                        private_key = args.get(i + 1).map(|s| s.as_str());
                        i += 2;
                    }
                    _ => {
                        eprintln!("Unknown option: {}", args[i]);
                        std::process::exit(1);
                    }
                }
            }

            generate_license(tier, id, private_key);
        }
        _ => {
            eprintln!("Unknown command: {}", args[1]);
            std::process::exit(1);
        }
    }
}

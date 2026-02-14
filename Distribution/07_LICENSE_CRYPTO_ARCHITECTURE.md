# 🔐 Zetta Focus Console --- License Cryptographic Architecture

------------------------------------------------------------------------

# 🎯 Objective

Design a secure, offline-verifiable license system where:

-   Rust is the authority
-   License keys are cryptographically signed
-   No runtime server validation is required
-   Tampering is difficult and detectable

This document defines the full cryptographic model.

------------------------------------------------------------------------

# 🏗 Core Model

The system uses:

-   Asymmetric cryptography (Public/Private Key)
-   Private key stored securely on backend
-   Public key embedded in desktop app
-   Offline signature verification in Rust

------------------------------------------------------------------------

# 🔑 Key Generation Model

## 1️⃣ Private Key (Server Only)

-   Stored securely on backend
-   Never included in desktop app
-   Used to sign license payload

Example algorithm:

-   Ed25519 (recommended) OR
-   RSA-2048 (acceptable)

Recommended: Ed25519 for speed and smaller key size.

------------------------------------------------------------------------

## 2️⃣ Public Key (Embedded in App)

-   Hardcoded in Rust
-   Used only for signature verification
-   Safe to expose publicly

------------------------------------------------------------------------

# 🧾 License Payload Structure

Before signing, create structured payload:

Example:

{ "product": "ZFC", "tier": "PRO", "issued_at": 1700000000, "expiry":
null, "license_id": "abc123xyz" }

Founder example:

{ "product": "ZFC", "tier": "FOUNDER", "issued_at": 1700000000,
"expiry": null, "founder": true }

------------------------------------------------------------------------

# 🔏 Signing Process (Backend)

1.  Create payload JSON
2.  Serialize deterministically
3.  Sign payload with private key
4.  Encode:

BASE64(payload).BASE64(signature)

Final license key:

ZFC-PRO-XXXX-XXXX-`<encoded data>`{=html}

------------------------------------------------------------------------

# 🖥 Activation Flow (App Side)

When user enters license:

1️⃣ Parse prefix (PRO / FOUNDER)\
2️⃣ Extract payload + signature\
3️⃣ Verify signature using embedded public key\
4️⃣ If valid → update LicenseState\
5️⃣ Store encrypted locally

------------------------------------------------------------------------

# 🔒 Local Storage Model

Store:

-   Encrypted license blob
-   Activation timestamp
-   LicenseState

Use:

-   OS secure storage if available OR
-   AES encryption with device-bound salt

------------------------------------------------------------------------

# 🛡 Tamper Resistance

Defensive layers:

-   Validate signature every launch
-   Validate product field
-   Validate tier field
-   Optional: check license hash integrity

Optional advanced:

-   Binary obfuscation
-   Anti-debug flags
-   Environment integrity checks

------------------------------------------------------------------------

# 🌐 Optional Future Layer (Online Validation)

Not required for Phase 1.

Possible additions:

-   License revocation list
-   Blacklist endpoint
-   Periodic validation ping
-   Device activation limits

Offline-first remains default model.

------------------------------------------------------------------------

# 🧠 Security Philosophy

Perfect security does not exist.

Goal is:

-   Prevent casual piracy
-   Prevent trivial key generation
-   Maintain offline usability
-   Avoid complex server dependency

------------------------------------------------------------------------

# 🚀 Implementation Order

1️⃣ Generate Ed25519 keypair\
2️⃣ Embed public key in Rust\
3️⃣ Build backend signing endpoint\
4️⃣ Implement Rust signature verification\
5️⃣ Test valid / invalid keys\
6️⃣ Implement encrypted storage

------------------------------------------------------------------------

# 🏁 Authority Principle

Private key = Authority\
Rust = Enforcer\
UI = Viewer

Never move private key into client.

------------------------------------------------------------------------

# 🔥 Final Statement

Zetta Focus Console licensing is:

-   Offline-first
-   Cryptographically signed
-   Provider-agnostic
-   Rust-enforced
-   Architected for longevity

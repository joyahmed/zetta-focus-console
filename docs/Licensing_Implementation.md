# Zetta Focus Console --- Licensing Implementation Plan

## 1. Licensing Philosophy

Licensing must:

-   Be secure
-   Work offline
-   Not annoy legitimate users
-   Be validated in Rust (never trust frontend)
-   Be simple to maintain

Zetta Focus is a desktop app --- offline-first validation is critical.

------------------------------------------------------------------------

## 2. Recommended Model (For Indie Dev)

✔ One-time lifetime license\
✔ Offline validation\
✔ Optional online activation\
✔ Signed license keys (recommended)

Avoid subscription complexity initially.

------------------------------------------------------------------------

## 3. License Architecture Overview

Frontend (React): - Enter license key - Display license status - Never
validate logic here

Rust (Engine): - Verify license - Store license locally - Gate premium
features - Validate signature

Single source of truth = Rust.

------------------------------------------------------------------------

## 4. License State Model (Rust)

struct LicenseState { is_premium: bool, license_key:
Option`<String>`{=html}, activated_at: Option`<u64>`{=html}, }

License stored locally in: - Encrypted local file - Or secure storage
API (recommended)

------------------------------------------------------------------------

## 5. Basic Offline License Strategy (Simple Version)

Generate license keys like:

ZFC-XXXX-XXXX-XXXX

Store hash of valid keys on your server (optional).

Validation flow:

1.  User enters key
2.  Rust verifies format
3.  Rust verifies signature (if signed)
4.  Save locally if valid
5.  Unlock premium features

------------------------------------------------------------------------

## 6. Recommended Secure Version (Signed License)

Use public/private key cryptography.

Server: - Generates license payload (JSON) - Signs it using private key

App (Rust): - Contains public key - Verifies signature - If valid →
activate premium

This prevents fake key generation.

------------------------------------------------------------------------

## 7. Signed License Payload Example

{ "email": "user@email.com", "license_type": "lifetime", "issued_at":
1712345678, "product": "ZettaFocus" }

Server signs payload → returns encoded string.

App verifies signature before activation.

------------------------------------------------------------------------

## 8. Feature Gating

All premium features must check:

if !license.is_premium { return "Premium feature required." }

Do NOT rely on UI hiding only.

Always gate in Rust.

------------------------------------------------------------------------

## 9. UI Strategy

Settings Panel → License Section:

-   Enter License Key
-   Activate Button
-   Show License Status
-   Show Expiration (if any)

Do not spam upgrade messages.

Subtle lock icons are enough.

------------------------------------------------------------------------

## 10. Offline Behavior

Once activated:

-   License stored locally
-   App works without internet
-   No periodic forced validation
-   No aggressive anti-piracy

Keep experience respectful.

------------------------------------------------------------------------

## 11. Optional Advanced Protection

Later you may add:

-   Device fingerprint binding
-   Online activation limit
-   License revocation system
-   Encrypted license storage

Not needed for v1.

------------------------------------------------------------------------

## 12. Development Phases

Phase 1: - Simple offline key validation - Manual license generation

Phase 2: - Signed license system - Public/private key verification

Phase 3: - Online activation dashboard - Customer license management

------------------------------------------------------------------------

## 13. What NOT To Do

-   Never embed secret keys in frontend
-   Never validate license only in React
-   Never hardcode premium flag
-   Never depend entirely on internet

------------------------------------------------------------------------

## 14. Identity Strategy

License should feel:

Professional. Respectful. Invisible.

Users who pay should never feel punished.

------------------------------------------------------------------------

End of Licensing Implementation Plan

# 🔐 FOUNDER_KEY_GENERATION.md

## Zetta Focus Console --- Manual Founder Key System (5--10 Users)

------------------------------------------------------------------------

# 🎯 Purpose

Provide secure Founder licenses for a limited group (5--10 people)
without building a backend system.

This method is:

-   Offline-first
-   Cryptographically signed
-   Manually controlled
-   Production-safe

------------------------------------------------------------------------

# 🧠 System Overview

Uses:

-   Ed25519 asymmetric cryptography
-   Private key (kept offline)
-   Public key (embedded in app)

Only the private key can generate valid Founder licenses.

------------------------------------------------------------------------

# 🔑 Step 1 --- Generate Keypair (One Time Only)

Generate once:

-   Private Key → Store securely offline
-   Public Key → Embed in Rust app

Never regenerate unless you want to invalidate all licenses.

------------------------------------------------------------------------

# 🧾 Step 2 --- Create License Payload

Example payload:

{ "product": "ZFC", "tier": "FOUNDER", "issued_at": 1700000000,
"license_id": "uuid-random" }

------------------------------------------------------------------------

# 🔏 Step 3 --- Sign Payload

Process:

1.  Serialize payload deterministically
2.  Sign with private key
3.  Encode:

BASE64(payload).BASE64(signature)

Final format example:

ZFC-FOUNDER-`<encoded_payload>`{=html}.`<encoded_signature>`{=html}

------------------------------------------------------------------------

# 🖥 Step 4 --- Activation Flow

User:

1.  Opens app
2.  Enters Founder key
3.  App verifies signature using public key
4.  LicenseState = Founder
5.  Encrypted storage locally

------------------------------------------------------------------------

# 🛡 Security Rules

-   Never commit private key to repo
-   Never share private key
-   Never embed private key in app
-   Store private key offline (encrypted if possible)

------------------------------------------------------------------------

# 🚀 Scope

This model is ideal for:

-   5--10 trusted Founder users
-   Early evangelists
-   Friends & family
-   Early developer supporters

# 🟡 Lemon Squeezy Integration Flow

## Zetta Focus Console

------------------------------------------------------------------------

# 🎯 Objective

Implement Lemon Squeezy as the first global payment provider for:

-   Pro license purchases
-   Founder license purchases
-   One-time lifetime access

The licensing engine remains fully controlled by Rust.

------------------------------------------------------------------------

# 🏗 Architecture Overview

User → Lemon Checkout → License Key Issued → App Activation → Rust
Validation

Lemon handles: - Payment processing - VAT & tax compliance - Order
confirmation - License key delivery

Rust handles: - License verification - Signature validation - Feature
gating - Offline enforcement

------------------------------------------------------------------------

# 🔐 License Key Strategy

## Key Format

ZFC-PRO-XXXX-XXXX\
ZFC-FOUNDER-XXXX-XXXX

Keys must be:

-   Cryptographically signed
-   Verifiable offline
-   Tamper-resistant

Rust validates key signature using embedded public key.

------------------------------------------------------------------------

# 🔄 Purchase Flow

## Step 1 --- User Checkout

-   User clicks "Upgrade to Pro"
-   Redirect to Lemon Squeezy checkout
-   User completes payment

------------------------------------------------------------------------

## Step 2 --- License Delivery

Options:

A)  Lemon built-in license key delivery\
B)  Custom webhook → generate signed key

Recommended: Use webhook + custom signing for stronger control.

------------------------------------------------------------------------

## Step 3 --- App Activation

User:

1.  Opens app
2.  Navigates to License Activation
3.  Enters license key
4.  Clicks Activate

------------------------------------------------------------------------

## Step 4 --- Rust Validation

App calls:

``` rust
fn activate_license(key: String)
```

Rust:

-   Verifies signature
-   Validates format
-   Updates LicenseState
-   Persists encrypted license data locally

------------------------------------------------------------------------

# 🧠 Webhook Flow (Recommended)

Lemon → Webhook → Your backend → Generate signed key → Email user

Webhook events:

-   order_created
-   order_paid

Backend:

-   Generates signed license
-   Stores minimal metadata
-   Sends key to user

------------------------------------------------------------------------

# 🔒 Security Model

-   Public key embedded in app
-   Private key never shipped
-   Offline validation
-   No runtime server dependency required

Optional:

-   Online validation endpoint (future)
-   Blacklist mechanism (future)

------------------------------------------------------------------------

# 🚀 Implementation Order

1️⃣ Configure Lemon product\
2️⃣ Enable webhooks\
3️⃣ Build minimal signing service\
4️⃣ Implement Rust key validation\
5️⃣ Build activation UI\
6️⃣ Test full purchase → activation flow

------------------------------------------------------------------------

# 🏁 Final Principle

Lemon processes money.\
Rust controls access.

Never reverse this authority model.

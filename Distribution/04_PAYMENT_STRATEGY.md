# 💳 Zetta Focus Console --- Payment Strategy

## Vision

Zetta Focus Console is built for both:

-   🌍 Global developers and professionals
-   🇧🇩 Bangladesh-based users and founders

From Day One, the product supports international and local payment
pathways.

Licensing logic remains fully independent from payment providers.

Rust is always the authority.

------------------------------------------------------------------------

# 🔐 Core Principle

Payment providers only:

-   Process transactions
-   Issue license keys (or trigger activation)
-   Notify successful purchase

They DO NOT:

-   Decide feature access
-   Control engine logic
-   Validate license state

License validation is handled entirely in Rust.

``` rust
enum LicenseState {
    Free,
    Trial,
    Pro,
    Founder,
}
```

All Pro features are gated by:

``` rust
fn is_pro_enabled() -> bool
```

------------------------------------------------------------------------

# 🌍 Phase 1 --- Primary Global Provider

## 🟡 Lemon Squeezy (Initial Implementation)

### Why Lemon Squeezy?

-   Merchant of Record (handles VAT & global tax)
-   One-time purchase friendly
-   License key support
-   Simple integration for desktop software
-   Reduces legal and compliance overhead

### Status

-   ✅ First provider to be implemented
-   ✅ Used for global Pro purchases
-   ✅ Used for Founder keys (manual distribution supported)

### Role in Architecture

-   Generates or delivers license keys
-   Triggers activation flow
-   Does NOT control feature logic

------------------------------------------------------------------------

# 🌐 Phase 2 --- Alternative Global Provider (Future)

## 🔵 Stripe (Planned)

### Purpose

-   Direct payment processing
-   Greater control over checkout flow
-   Customizable licensing pipeline

### Status

-   ❌ Not implemented in Phase 1
-   🔄 Reserved for future expansion

### Integration Plan

Stripe will integrate into the same Rust-based license activation
system:

``` rust
fn activate_license(key: String)
```

No changes to engine logic required.

------------------------------------------------------------------------

# 🇧🇩 Phase 3 --- Local Market Support

## 🟢 bKash (Bangladesh)

### Purpose

-   Support local developers and professionals
-   Capture Bangladesh market from Day One
-   Provide accessible local payment option

### Initial Implementation Plan

Phase 1: - Manual payment confirmation - Manual license key issuance -
Founder-friendly flow

Phase 2: - Automated integration (if required) - Backend verification
flow

### Important

bKash payments will issue valid signed keys. License validation remains
offline and Rust-controlled.

------------------------------------------------------------------------

# 🎟 Founder Edition Integration

Founder licenses:

-   Permanent Pro access
-   Signed license key
-   Limited quantity
-   Manually curated distribution

Founder purchases may use:

-   Lemon Squeezy (global)
-   bKash (local)

Founder keys follow format:

    ZFC-FOUNDER-XXXX-XXXX

------------------------------------------------------------------------

# 🔄 Payment Flow Overview

## Global Flow (Lemon Squeezy)

1.  User completes purchase
2.  License key delivered
3.  User enters key in app
4.  Rust validates signature
5.  LicenseState updated
6.  UI refreshes automatically

------------------------------------------------------------------------

## Local Flow (bKash Initial Phase)

1.  User completes payment
2.  Payment confirmed manually
3.  Signed license key issued
4.  User activates key in app
5.  Rust validates
6.  LicenseState updated

------------------------------------------------------------------------

# 🧠 Strategic Positioning

-   Product is global-first
-   Bangladesh is first-class market
-   Licensing system is provider-agnostic
-   Payment layer is modular
-   No vendor lock-in

------------------------------------------------------------------------

# 🚀 Implementation Order

1️⃣ Implement Lemon Squeezy\
2️⃣ Activate Pro gating\
3️⃣ Validate real user flow\
4️⃣ Introduce bKash support\
5️⃣ Add Stripe (if needed)

------------------------------------------------------------------------

# 🏁 Conclusion

Zetta Focus Console:

-   Ships Free core engine
-   Offers transparent Trial
-   Supports Pro upgrades
-   Supports Founder edition
-   Accepts global and local payments
-   Keeps engine authority in Rust

Structure first.\
Signal second.\
Revenue third.

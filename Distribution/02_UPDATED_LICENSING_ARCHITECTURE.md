# 🔐 Zetta Focus Console --- Licensing Architecture (v1 Final)

This document defines the final, frozen licensing architecture for v1.

No scalability overengineering. No subscription logic. No activation
counters. No online validation.

Clean. Minimal. Production-ready.

------------------------------------------------------------------------

# 🎯 License States

``` rust
enum LicenseState {
    Free,
    Trial,
    Pro,
    Founder,
}
```

Rust is the authority. UI never decides license validity.

------------------------------------------------------------------------

# 🧠 Authority Model

Only one component manages licensing:

LicenseManager

Responsibilities:

-   Load license from storage
-   Persist license securely
-   Check trial expiration
-   Activate license key
-   Expose license status to the app

Nothing else in the app mutates LicenseState.

------------------------------------------------------------------------

# 📂 Storage Model

License data is stored locally as an encrypted file:

\~/.zetta_focus/license.dat

Stored data includes:

-   LicenseState
-   Trial start timestamp (if applicable)

No database required. No server dependency.

------------------------------------------------------------------------

# ⏳ Trial Logic

On first launch:

If no license file exists:

-   Set LicenseState = Trial
-   Store trial_start_timestamp
-   Trial duration = 14 days

On app launch:

If LicenseState == Trial:

-   If expired → downgrade to Free
-   Else remain Trial

Trial is automatic and deterministic.

------------------------------------------------------------------------

# 🔑 Activation Flow

When user enters a license key:

1.  Parse key
2.  Verify cryptographic signature
3.  Determine tier (Pro or Founder)
4.  Update LicenseState
5.  Persist encrypted license
6.  Refresh UI

If signature verification fails → activation rejected.

------------------------------------------------------------------------

# 🛡 Feature Gating Pattern

All Pro features must call:

``` rust
fn is_pro_enabled() -> bool
```

Definition:

-   Pro → true
-   Founder → true
-   Trial → true (until expired)
-   Free → false

Strict Mode and all Pro-only features must use this check.

------------------------------------------------------------------------

# 🔵 Strict Mode v1 Integration

Strict Mode is Pro-only.

Behavior:

-   Optional per session
-   Requires confirmation before activation
-   Disable pause
-   Disable manual stop
-   Disable mid-session duration editing
-   If force-closed → mark session failed on next launch

Strict Mode does NOT modify LicenseState.

------------------------------------------------------------------------

# 🚫 Explicit Non-Goals (v1)

The following are intentionally NOT implemented:

-   Device activation limits
-   Online validation
-   Revocation list
-   Subscription logic
-   Team licenses
-   Enterprise tiers
-   Anti-debug systems

These may be added in future versions, but are not part of v1.

------------------------------------------------------------------------

# 🏁 Final Principle

License verification happens:

-   On startup
-   On activation
-   Before enabling Pro features

Single authority. Single source of truth. Minimal complexity. Shippable
architecture.

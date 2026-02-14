# 🧪 DEV_LICENSE_STATE_SIMULATOR.md

## Zetta Focus Console --- Development License State Simulator

------------------------------------------------------------------------

# 🎯 Purpose

Provide a safe development-only mechanism to simulate different license
states without modifying real license data.

This allows proper testing of:

-   Free behavior
-   Trial behavior
-   Expired Trial behavior
-   Pro gating
-   Founder access
-   Strict Mode restrictions

This simulator must never exist in production builds.

------------------------------------------------------------------------

# 🔐 Core Rule

All development overrides must be compile-time guarded using:

``` rust
#[cfg(debug_assertions)]
```

Override logic must not compile into release builds.

------------------------------------------------------------------------

# 🧠 Design Model

Inside LicenseManager (debug builds only):

``` rust
#[cfg(debug_assertions)]
pub enum DevLicenseOverride {
    None,
    ForceFree,
    ForceTrial,
    ForcePro,
    ForceFounder,
}
```

Store this override only in memory. Do not persist to disk.

------------------------------------------------------------------------

# 🔄 Effective Tier Resolution

All feature checks must use an `effective_tier()` function.

``` rust
pub fn effective_tier(&self) -> LicenseState {
    #[cfg(debug_assertions)]
    {
        match self.dev_override {
            DevLicenseOverride::ForceFree => return LicenseState::Free,
            DevLicenseOverride::ForceTrial => return LicenseState::Trial,
            DevLicenseOverride::ForcePro => return LicenseState::Pro,
            DevLicenseOverride::ForceFounder => return LicenseState::Founder,
            DevLicenseOverride::None => {}
        }
    }

    self.license_state.clone()
}
```

Important:

-   Do NOT modify stored `license_state`.
-   Do NOT overwrite real licenses.
-   Only mask the effective tier in debug builds.

------------------------------------------------------------------------

# 🖥 Debug UI (Optional)

In debug builds only:

-   Provide a small debug panel
-   Add a dropdown or toggle to select override state
-   Allow quick switching between tiers

Wrap all debug UI in:

``` rust
#[cfg(debug_assertions)]
```

Debug UI must not exist in release builds.

------------------------------------------------------------------------

# 🛡 Safety Requirements

The simulator must:

-   Not persist override flags
-   Not modify encrypted license storage
-   Not introduce environment variable overrides
-   Not introduce hidden shortcuts
-   Not ship in release builds

Release builds must contain zero override logic.

------------------------------------------------------------------------

# 🚫 Non-Goals

This simulator does NOT:

-   Generate licenses
-   Bypass signature validation
-   Alter stored Founder/Pro licenses
-   Replace real activation flow

It is strictly for development testing.

------------------------------------------------------------------------

# 🏁 Final Principle

Development tools must never weaken production authority.

License integrity remains enforced in release builds.

The simulator exists only to accelerate safe testing.

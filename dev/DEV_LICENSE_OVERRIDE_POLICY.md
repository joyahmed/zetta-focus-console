# 🛠 DEV_LICENSE_OVERRIDE_POLICY.md

## Zetta Focus Console --- Development License Override (Safe Implementation)

------------------------------------------------------------------------

# 🎯 Purpose

Allow developers to temporarily test Free and Trial states even when a
valid Founder or Pro license exists.

This override is:

-   Development-only
-   Compile-time guarded
-   Never included in production builds
-   Non-destructive to stored license data

------------------------------------------------------------------------

# 🔐 Core Rule

Dev overrides must only exist in debug builds.

Use:

``` rust
#[cfg(debug_assertions)]
```

Any override logic must NOT compile into release builds.

------------------------------------------------------------------------

# 🧠 Implementation Pattern

Inside LicenseManager:

``` rust
#[cfg(debug_assertions)]
pub struct DevOverrides {
    pub force_free: bool,
}
```

Then modify tier resolution logic:

``` rust
pub fn effective_tier(&self) -> LicenseState {
    #[cfg(debug_assertions)]
    {
        if self.dev_overrides.force_free {
            return LicenseState::Free;
        }
    }

    self.license_state.clone()
}
```

------------------------------------------------------------------------

# ⚠ Important Constraints

-   Do NOT modify stored license state.
-   Do NOT overwrite Founder or Pro license data.
-   Do NOT persist override flags.
-   Do NOT allow runtime environment toggles.
-   Do NOT ship override UI in release builds.

Override must be:

Compile-time stripped in release mode.

------------------------------------------------------------------------

# 🧪 Development Usage

In debug builds only:

-   Add temporary UI button (debug panel)
-   Toggle force_free flag
-   Test Free behavior
-   Test Trial behavior
-   Re-enable real license

In release builds:

-   Override code does not exist
-   No toggle available
-   Real license logic applies

------------------------------------------------------------------------

# 🛡 Security Assurance

Because override logic is wrapped in:

``` rust
#[cfg(debug_assertions)]
```

It is:

-   Not compiled into release binaries
-   Not accessible in production
-   Not reverse-engineerable in shipped builds

------------------------------------------------------------------------

# 🚫 Explicit Non-Goals

Do NOT implement:

-   Hidden keyboard shortcuts
-   Secret passphrases
-   Environment variable overrides
-   Config-file toggles
-   Runtime bypasses

All overrides must be compile-time only.

------------------------------------------------------------------------

# 🏁 Final Principle

Development overrides are testing tools.

They must never weaken production authority.

License integrity remains intact.

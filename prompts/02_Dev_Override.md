Implement development-only license override according to DEV_LICENSE_OVERRIDE_POLICY.md.

Rules:

1. Do NOT modify production licensing behavior.
2. Do NOT alter stored license data.
3. Do NOT introduce runtime bypasses.
4. Override logic must be compile-time only using #[cfg(debug_assertions)].
5. No override logic may exist in release builds.

Scope:

## 1️⃣ Add DevOverrides Struct

Inside LicenseManager (or licensing module):

Wrap all override logic in:

#[cfg(debug_assertions)]

Add:

pub struct DevOverrides {
    pub force_free: bool,
}

Initialize only in debug builds.

Do not compile this struct in release.

---

## 2️⃣ Implement effective_tier()

Modify tier resolution logic so that:

pub fn effective_tier(&self) -> LicenseState {
    #[cfg(debug_assertions)]
    {
        if self.dev_overrides.force_free {
            return LicenseState::Free;
        }
    }

    self.license_state.clone()
}

Do NOT modify stored license_state.

---

## 3️⃣ Debug UI Control (Optional)

In debug builds only:

Add a temporary toggle button in a debug panel to switch force_free on/off.

Wrap UI in:

#[cfg(debug_assertions)]

The debug toggle must NOT appear in release builds.

---

## 4️⃣ Ensure Feature Gating Uses effective_tier()

All feature checks must use:

license_manager.effective_tier()

Do not directly read raw license_state for gating.

---

## 5️⃣ Confirm Release Safety

Verify that:

- cargo build --release does not include DevOverrides
- No debug UI is present in release
- No override flags are persisted to disk
- No environment variable or config file controls override

---

Non-Goals:

- No secret shortcuts
- No hidden key combos
- No runtime config toggles
- No environment variable bypass
- No changes to production authority model

Development override must be fully removed at compile-time in release builds.

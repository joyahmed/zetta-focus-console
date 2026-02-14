Implement licensing according to 02_UPDATED_LICENSING_ARCHITECTURE.md.

Rules:

1. Do NOT refactor existing engine logic.
2. Do NOT change application architecture.
3. Do NOT modify UI structure beyond what is required for activation.
4. Do NOT introduce online validation.
5. Do NOT implement subscriptions, device limits, revocation, or future features.

Scope:

## 1️⃣ LicenseState

Use the existing enum:

enum LicenseState {
    Free,
    Trial,
    Pro,
    Founder,
}

Do not modify this enum.

---

## 2️⃣ Create LicenseManager

Create a single LicenseManager module responsible for:

- Loading license from local storage
- Persisting license securely
- Managing trial start timestamp
- Checking trial expiration
- Activating a license key
- Exposing license status to the app

Only LicenseManager may mutate LicenseState.

All other modules must treat LicenseState as read-only.

---

## 3️⃣ Storage

- Store license locally as an encrypted file:
  ~/.zetta_focus/license.dat

Stored data:
- LicenseState
- Trial start timestamp (if applicable)

No database.
No network calls.

---

## 4️⃣ Trial Logic

On first launch:

If no license file exists:
- Set LicenseState = Trial
- Store trial_start_timestamp
- Trial duration = 14 days

On app launch:
If LicenseState == Trial:
- If expired → downgrade to Free
- Else remain Trial

---

## 5️⃣ Activation Flow

Implement:

activate_key(key: &str) -> Result<(), String>

Activation process:

1. Parse key
2. Verify cryptographic signature (assume verification module exists)
3. If valid:
   - Determine tier (Pro or Founder)
   - Update LicenseState
   - Persist license
4. If invalid:
   - Return error

Do not implement real key signing.
Assume verification function exists and returns true/false.

---

## 6️⃣ Feature Gating

Implement:

fn is_pro_enabled() -> bool

Return true if:
- Pro
- Founder
- Trial (not expired)

Return false if:
- Free

All Pro features and Strict Mode must call is_pro_enabled().

---

## 7️⃣ Strict Mode Integration

Do not modify licensing when Strict Mode activates.

Strict Mode only checks:

if !license_manager.is_pro_enabled() → block

Strict Mode must not mutate LicenseState.

---

## 8️⃣ Non-Goals

Do NOT implement:

- Device activation limits
- Revocation lists
- Online validation
- Subscription logic
- Team tiers
- Enterprise features
- Dev backdoors

Keep implementation minimal and aligned with UPDATED_LICENSING_ARCHITECTURE.md.

Focus on clean layering and stability.

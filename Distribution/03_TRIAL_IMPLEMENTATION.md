# 🔥 Zetta Focus Console --- Trial Flow Implementation (Phase 3)

This document defines the implementation instructions for completing the
Trial Flow system.

Some licensing logic may already exist.\
Audit before modifying.

Architecture must remain minimal and deterministic.

------------------------------------------------------------------------

# 📦 Project Context

Stack: - Tauri - Rust (engine authority) - React (UI only) -
TailwindCSS - Bun

License States:

``` rust
enum LicenseState {
    Free,
    Trial,
    Pro,
    Founder,
}
```

Trial duration: 14 days\
Trial grants full Pro access.

Rust is the authority.\
React never determines license validity.

------------------------------------------------------------------------

# 🎯 Objective

Implement or finalize a deterministic Trial Flow system according to the
existing Licensing Architecture.

Do NOT: - Introduce server validation - Add subscription logic - Add
device activation limits - Refactor architecture

Keep it clean. Minimal. Shippable.

------------------------------------------------------------------------

# 🧠 Step 1 --- Audit Existing Code

Before implementing:

1.  Locate:
    -   `LicenseManager`
    -   `LicenseState`
    -   License load/save logic
    -   Trial timestamp storage
    -   `is_pro_enabled()` implementation
2.  If trial logic exists:
    -   Validate correctness.
    -   Improve safely.
    -   Do not duplicate.
3.  If missing:
    -   Implement cleanly inside Rust.

------------------------------------------------------------------------

# 🧱 Step 2 --- First Launch Trial Initialization

On app startup:

If no license file exists:

-   Create license file
-   Set `LicenseState = Trial`
-   Store:
    -   `trial_start_timestamp` (UTC)
-   Trial duration = 14 days (constant)

This must happen in Rust only.

React must not initialize Trial.

------------------------------------------------------------------------

# ⏳ Step 3 --- Trial Expiration Check

On every app launch:

If `LicenseState == Trial`:

-   Calculate: `now - trial_start_timestamp`

If greater than 14 days: - Set `LicenseState = Free` - Persist change -
Do NOT delete user data - Do NOT crash

Expiration check must run before Pro features load.

------------------------------------------------------------------------

# 🔐 Step 4 --- Trial Resilience (Light Protection)

Prevent simple trial reset by deleting the license file.

Implement ONE lightweight approach:

Option A: - Create secondary hidden file:
`~/.zetta_focus/.trial_marker` - Store hashed timestamp

Option B: - Store hashed device identifier + trial start - If license
file deleted but marker exists: Restore expired Free state

Keep this simple.\
No heavy anti-piracy logic.

------------------------------------------------------------------------

# 🧮 Step 5 --- Days Remaining Calculation

Implement:

``` rust
fn get_trial_days_remaining() -> Option<u32>
```

Returns: - `None` → not Trial - `Some(0)` → expired - `Some(x)` →
remaining days

Expose via Tauri command:

``` rust
get_trial_status()
```

Return JSON:

``` json
{
  "state": "Trial",
  "days_remaining": 7
}
```

React only displays.\
React never calculates expiration.

------------------------------------------------------------------------

# 🧩 Step 6 --- UI Behavior

React should:

-   Display license badge:
    -   "Trial --- X days left"
    -   "Free"
    -   "Pro Activated"
    -   "Founder Edition"

If Trial expires on launch: - Show subtle notification: "Trial expired.
Switched to Free."

No aggressive upgrade modal.

------------------------------------------------------------------------

# 🔒 Step 7 --- Pro Feature Access During Trial

Ensure:

``` rust
fn is_pro_enabled() -> bool
```

Returns true for: - Trial - Pro - Founder

Returns false for: - Free

All Pro-only features must rely on this function: - Strict Mode -
Runtime Overrides - Unlimited Profiles - Dev Diagnostics - Advanced
Ambience

No UI-only gating.

------------------------------------------------------------------------

# 🚨 Step 8 --- Edge Case Handling

Handle safely:

-   Corrupted license file
-   Missing fields
-   Invalid timestamp
-   Basic system clock rollback

If suspicious: - Fail safe → downgrade to Free

Never panic.\
Never crash engine.

------------------------------------------------------------------------

# 🧪 Step 9 --- Test Checklist

Manual test scenarios:

1.  Fresh install → Trial starts.
2.  Restart app → Trial persists.
3.  After 14 days → Downgrades to Free.
4.  Delete license file → Trial does NOT restart.
5.  Activate Pro during Trial → State becomes Pro.
6.  Strict Mode works during Trial.
7.  Strict Mode blocked in Free.

------------------------------------------------------------------------

# 🏁 Final Rules

-   Rust owns license authority.
-   React never decides license validity.
-   No online validation.
-   No device activation counters.
-   No subscription logic.

Single authority.\
Deterministic behavior.\
Shippable architecture.

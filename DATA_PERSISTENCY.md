# 💾 Zetta Focus Console --- Data Persistency Architecture

## Core Principle

Persistence must be:

-   Deterministic
-   Minimal
-   Explicit
-   Rust-controlled
-   Never magical

Zetta Focus is not a cloud app. All state is local. No hidden background
mutation.

------------------------------------------------------------------------

# 🧠 Data Layers

Zetta Focus has three data layers:

1️⃣ Preferences (Persisted)\
2️⃣ License State (Persisted)\
3️⃣ Runtime Engine State (Not Persisted)

------------------------------------------------------------------------

# 1️⃣ Preferences (Persisted)

Preferences represent user configuration --- not execution state.

Persisted fields:

``` json
{
  "theme": "dark",
  "ambience": "winter",
  "volume": 0.3,
  "timer": {
    "work": 50,
    "break": 10,
    "loops": 4
  },
  "devMode": false
}
```

### Rules

-   Persist only base timer configuration
-   Never persist remaining time
-   Never persist running state
-   Never persist runtime overrides

Preferences are loaded on launch. Engine always starts idle.

------------------------------------------------------------------------

# 2️⃣ License State (Persisted)

License state is validated and stored by Rust.

Persisted fields:

``` json
{
  "licenseState": "Pro",
  "issuedAt": "2026-02-01T10:00:00Z",
  "expiresAt": null,
  "signature": "BASE64_SIGNATURE"
}
```

### Rules

-   License signature must be validated on launch
-   Invalid signature → downgrade to Free
-   Trial expiration must be checked on every launch
-   No UI-based bypass

------------------------------------------------------------------------

# 3️⃣ Runtime Engine State (NOT Persisted)

Never persist:

-   Active session progress
-   Remaining time
-   Active override parameters
-   Loop progress
-   Partial break state

If the app closes mid-session:

Engine resets to idle.

Optional future enhancement:

If last session was incomplete → Display subtle message:

"Previous session did not complete."

No auto-resume.

------------------------------------------------------------------------

# 📂 Storage Location

Use OS-appropriate app data directory:

-   Windows: %APPDATA%/ZettaFocus
-   macOS: \~/Library/Application Support/ZettaFocus
-   Linux: \~/.config/ZettaFocus

Rust owns file access.

React never writes directly to disk.

------------------------------------------------------------------------

# 🔁 Write Strategy

Write only when:

-   User updates preferences
-   License state changes
-   Dev mode toggled

Never write on every tick. Never write during timer loop.

Minimize disk IO.

------------------------------------------------------------------------

# 🔐 Integrity Rules

-   Validate JSON structure on load
-   Fallback to defaults if corrupted
-   Never crash due to malformed config
-   Log corruption event in dev mode

------------------------------------------------------------------------

# 🧱 Reset Settings Behavior

Reset should:

-   Restore default preferences
-   Clear custom ambience
-   Keep valid license state

Optional:

Provide "Full Reset" option in Dev mode (which clears license and
preferences).

------------------------------------------------------------------------

# 🎯 Design Goal

Persistence must feel:

-   Predictable
-   Safe
-   Transparent
-   Engine-driven

Zetta Focus restores configuration. It does not restore execution.

Explicit control always.

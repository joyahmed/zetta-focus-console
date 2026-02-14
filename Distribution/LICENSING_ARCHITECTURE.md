# 🔐 Zetta Focus Console --- Licensing Architecture

## License States

``` rust
enum LicenseState {
    Free,
    Trial,
    Pro,
    Founder,
}
```

Rust is the authority.\
React never decides license validity.

------------------------------------------------------------------------

## Key Format Example

ZFC-PRO-XXXX-XXXX\
ZFC-FOUNDER-XXXX-XXXX

Must be: - Signed - Verifiable offline - Tamper resistant

------------------------------------------------------------------------

## Feature Gate Pattern

Every Pro feature calls:

``` rust
fn is_pro_enabled() -> bool
```

------------------------------------------------------------------------

## Upgrade Flow

1.  User enters key
2.  Rust validates
3.  LicenseState updated
4.  UI refresh

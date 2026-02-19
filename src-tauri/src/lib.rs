mod commands;
mod engine;
mod license;
mod payment;
mod sound;
mod storage;
mod types;

use engine::{
    activate_key, can_create_profile, clear_debug_license_override, clear_license_storage,
    execute_command, get_license, get_state, get_theme, get_trial_days_remaining, get_trial_status,
    is_pro, set_debug_license_override, set_theme, set_total_sessions, tick_system_stats,
    tick_timer, EngineState,
};
use payment::{
    get_available_payment_options, get_checkout_info, open_checkout_in_browser, CheckoutInfo,
    PaymentOption, PaymentProvider, ProductType, PricingInfo,
};

// ============================================================================
// TAURI COMMANDS - PAYMENT
// ============================================================================

/// Get available payment options
#[tauri::command]
fn payment_get_options() -> Vec<PaymentOption> {
    get_available_payment_options()
}

/// Get checkout information for a product
#[tauri::command]
fn payment_get_checkout_info(
    product_type: String,
    provider: String,
    discount_code: Option<String>,
) -> Result<CheckoutInfo, String> {
    let product = match product_type.to_lowercase().as_str() {
        "pro" => ProductType::Pro,
        "founder" => ProductType::Founder,
        _ => return Err("Invalid product type. Use 'pro' or 'founder'.".to_string()),
    };

    let payment_provider = match provider.to_lowercase().as_str() {
        "lemonsqueezy" | "lemon_squeezy" => PaymentProvider::LemonSqueezy,
        "bkash" => PaymentProvider::BKash,
        "stripe" => PaymentProvider::Stripe,
        _ => return Err("Invalid payment provider. Use 'lemonsqueezy', 'bkash', or 'stripe'.".to_string()),
    };

    Ok(get_checkout_info(product, payment_provider, discount_code.as_deref()))
}

/// Open checkout page in browser
#[tauri::command]
fn payment_open_checkout(url: String) -> Result<(), String> {
    open_checkout_in_browser(&url)
}

/// Get pricing information for a product
#[tauri::command]
fn payment_get_pricing(product_type: String) -> Result<PricingInfo, String> {
    match product_type.to_lowercase().as_str() {
        "pro" => Ok(PricingInfo::pro()),
        "founder" => Ok(PricingInfo::founder()),
        _ => Err("Invalid product type. Use 'pro' or 'founder'.".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(EngineState::new())
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_theme,
            set_theme,
            set_total_sessions,
            execute_command,
            tick_timer,
            tick_system_stats,
            get_license,
            activate_key,
            is_pro,
            get_trial_days_remaining,
            get_trial_status,
            set_debug_license_override,
            clear_debug_license_override,
            clear_license_storage,
            can_create_profile,
            // Payment commands
            payment_get_options,
            payment_get_checkout_info,
            payment_open_checkout,
            payment_get_pricing,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

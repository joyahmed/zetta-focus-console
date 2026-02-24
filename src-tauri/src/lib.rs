mod commands;
mod config;
mod engine;
mod license;
mod license_crypto;
mod payment;
mod pricing;
mod sound;
mod state;
mod storage;
mod types;
mod webhook;

use engine::{
    activate_key, can_create_profile, clear_debug_license_override, clear_license_storage,
    execute_command, get_debug_license_override, get_license, get_state, get_theme,
    get_trial_days_remaining, get_trial_status, is_pro, set_debug_license_override, set_theme,
    set_total_sessions, tick_system_stats, tick_timer, EngineState,
};
use payment::{
    get_available_payment_options, get_checkout_info, open_checkout_in_browser, CheckoutInfo,
    PaymentOption, PaymentProvider, PricingInfo, ProductType,
};
use pricing::{
    get_all_features, get_features_by_category, get_features_for_tier, is_feature_available,
    Feature, FeatureCategory, FreeTierInfo, LicenseTierForFeature, ProductPricing, TrialInfo,
};
use webhook::{
    process_webhook, verify_webhook_signature, GeneratedLicense, WebhookPayload, WebhookResponse,
};

use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

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
        _ => {
            return Err(
                "Invalid payment provider. Use 'lemonsqueezy', 'bkash', or 'stripe'.".to_string(),
            )
        }
    };

    Ok(get_checkout_info(
        product,
        payment_provider,
        discount_code.as_deref(),
    ))
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

// ============================================================================
// TAURI COMMANDS - PRICING STRATEGY
// ============================================================================

/// Get complete product pricing information
#[tauri::command]
fn pricing_get_product(product_type: String) -> Result<ProductPricing, String> {
    match product_type.to_lowercase().as_str() {
        "pro" => Ok(ProductPricing::pro()),
        "founder" => Ok(ProductPricing::founder()),
        _ => Err("Invalid product type. Use 'pro' or 'founder'.".to_string()),
    }
}

/// Get trial information
#[tauri::command]
fn pricing_get_trial_info() -> TrialInfo {
    TrialInfo::info()
}

/// Get free tier information
#[tauri::command]
fn pricing_get_free_tier_info() -> FreeTierInfo {
    FreeTierInfo::info()
}

/// Get all features
#[tauri::command]
fn pricing_get_all_features() -> Vec<Feature> {
    get_all_features()
}

/// Get features for a specific tier
#[tauri::command]
fn pricing_get_features_for_tier(tier: String) -> Vec<Feature> {
    let license_tier = match tier.to_lowercase().as_str() {
        "free" => LicenseTierForFeature::Free,
        "trial" => LicenseTierForFeature::Trial,
        "pro" => LicenseTierForFeature::Pro,
        "founder" => LicenseTierForFeature::Founder,
        _ => return vec![],
    };
    get_features_for_tier(license_tier)
}

/// Check if a feature is available for a tier
#[tauri::command]
fn pricing_is_feature_available(feature_id: String, tier: String) -> bool {
    let license_tier = match tier.to_lowercase().as_str() {
        "free" => LicenseTierForFeature::Free,
        "trial" => LicenseTierForFeature::Trial,
        "pro" => LicenseTierForFeature::Pro,
        "founder" => LicenseTierForFeature::Founder,
        _ => return false,
    };
    is_feature_available(&feature_id, license_tier)
}

/// Get features by category
#[tauri::command]
fn pricing_get_features_by_category(category: String) -> Vec<Feature> {
    let feature_category = match category.to_lowercase().as_str() {
        "core" => FeatureCategory::Core,
        "profiles" => FeatureCategory::Profiles,
        "ambience" => FeatureCategory::Ambience,
        "terminal" => FeatureCategory::Terminal,
        "developer" => FeatureCategory::Developer,
        "strict_mode" => FeatureCategory::StrictMode,
        _ => return vec![],
    };
    get_features_by_category(feature_category)
}

// ============================================================================
// TAURI COMMANDS - WEBHOOK HANDLING
// ============================================================================

/// Verify a Lemon Squeezy webhook signature
/// This is used by the backend service to validate incoming webhooks
#[tauri::command]
fn webhook_verify_signature(payload: String, signature: String, secret: String) -> bool {
    verify_webhook_signature(payload.as_bytes(), &signature, &secret)
}

/// Process a Lemon Squeezy webhook and generate a license key
/// This is used by the backend service after verifying the webhook
#[tauri::command]
fn webhook_process(payload: WebhookPayload) -> Option<GeneratedLicense> {
    process_webhook(&payload)
}

/// Create a webhook response
#[tauri::command]
fn webhook_response(
    success: bool,
    message: String,
    license_key: Option<String>,
) -> WebhookResponse {
    let response = if success {
        WebhookResponse::success(&message)
    } else {
        WebhookResponse::error(&message)
    };

    match license_key {
        Some(key) => response.with_license_key(&key),
        None => response,
    }
}

// ============================================================================
// GLOBAL SHORTCUTS AND TRAY SETUP
// ============================================================================

/// Setup global shortcuts for the app
fn setup_global_shortcuts(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Global shortcuts
    let toggle_window_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyH);
    let toggle_particles_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyB);

    eprintln!("[DIAGNOSTIC] Registering global shortcuts...");

    // Ctrl+H - Hide/Show window
    app.global_shortcut()
        .on_shortcut(toggle_window_shortcut, move |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })?;

    // Ctrl+B - Toggle background particles
    let app_handle_particles = app.clone();
    app.global_shortcut().on_shortcut(
        toggle_particles_shortcut,
        move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let _ = app_handle_particles.emit("global-shortcut", "toggle_particles");
            }
        },
    )?;

    eprintln!("[DIAGNOSTIC] Global shortcuts registered (Ctrl+H, Ctrl+B)");
    Ok(())
}

/// Setup system tray
fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let start_item = MenuItem::with_id(app, "start", "Start", true, None::<&str>)?;
    let stop_item = MenuItem::with_id(app, "stop", "Stop", true, None::<&str>)?;
    let pause_item = MenuItem::with_id(app, "pause", "Pause", true, None::<&str>)?;
    let resume_item = MenuItem::with_id(app, "resume", "Resume", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &start_item,
            &stop_item,
            &pause_item,
            &resume_item,
            &settings_item,
            &quit_item,
        ],
    )?;

    let app_handle = app.clone();
    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("Zetta Focus Console - Idle")
        .on_menu_event(move |app, event| {
            eprintln!("[TRAY] Menu item clicked: {:?}", event.id.as_ref());
            match event.id.as_ref() {
                "start" => {
                    let _ = app.emit("tray-action", "start");
                }
                "stop" => {
                    let _ = app.emit("tray-action", "stop");
                }
                "pause" => {
                    let _ = app.emit("tray-action", "pause");
                }
                "resume" => {
                    let _ = app.emit("tray-action", "resume");
                }
                "settings" => {
                    let _ = app.emit("tray-action", "settings");
                }
                "quit" => {
                    eprintln!("[TRAY] Quit requested");
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(&app_handle)?;

    eprintln!("[DIAGNOSTIC] System tray initialized successfully");
    Ok(())
}

/// Update tray icon based on timer state
#[tauri::command]
fn update_tray_state(
    app_handle: AppHandle,
    status: String,
    session_type: String,
    strict_mode_active: Option<bool>,
) -> Result<(), String> {
    // eprintln!(
    //     "[TRAY] Updating tray state - status: {}, session_type: {}, strict_mode: {:?}",
    //     status, session_type, strict_mode_active
    // );

    let is_strict = strict_mode_active.unwrap_or(false);

    let tooltip = match (status.as_str(), session_type.as_str(), is_strict) {
        ("running", "focus", true) => "Zetta Focus Console - Strict Mode",
        ("running", "focus", false) => "Zetta Focus Console - Focus",
        ("running", "short_break", _) | ("running", "long_break", _) => {
            "Zetta Focus Console - Break"
        }
        ("paused", _, _) => "Zetta Focus Console - Paused",
        ("completed", _, _) => "Zetta Focus Console - Completed",
        _ => "Zetta Focus Console - Idle",
    };

    if let Some(tray) = app_handle.tray_by_id("main") {
        let _ = tray.set_tooltip(Some(tooltip));

        // Note: Changing the actual tray icon color would require different icon assets
        // For now, we just update the tooltip to reflect strict mode
    }

    Ok(())
}

// ============================================================================
// AUTOSTART COMMANDS
// ============================================================================

/// Get the current autostart status
#[tauri::command]
fn get_autostart_enabled(app_handle: AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;

    let app = app_handle.autolaunch();
    app.is_enabled().unwrap_or(false)
}

/// Enable or disable autostart
#[tauri::command]
fn set_autostart_enabled(app_handle: AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;

    let app = app_handle.autolaunch();
    if enabled {
        app.enable()
            .map_err(|e: tauri_plugin_autostart::Error| e.to_string())?;
    } else {
        app.disable()
            .map_err(|e: tauri_plugin_autostart::Error| e.to_string())?;
    }
    Ok(())
}

/// Get the start minimized preference - checks if app should start minimized
#[tauri::command]
fn get_start_minimized() -> bool {
    // Load preferences and check start_minimized
    let prefs = crate::storage::load_preferences();
    prefs.start_minimized
}

/// Set the start minimized preference
#[tauri::command]
fn set_start_minimized(enabled: bool) -> Result<(), String> {
    let mut prefs = crate::storage::load_preferences();
    prefs.start_minimized = enabled;
    crate::storage::save_preferences(&prefs).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
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
            can_create_profile,
            // Debug license override commands
            set_debug_license_override,
            clear_debug_license_override,
            get_debug_license_override,
            clear_license_storage,
            // Payment commands
            payment_get_options,
            payment_get_checkout_info,
            payment_open_checkout,
            payment_get_pricing,
            // Pricing strategy commands
            pricing_get_product,
            pricing_get_trial_info,
            pricing_get_free_tier_info,
            pricing_get_all_features,
            pricing_get_features_for_tier,
            pricing_is_feature_available,
            pricing_get_features_by_category,
            // Webhook commands
            webhook_verify_signature,
            webhook_process,
            webhook_response,
            // Tray commands
            update_tray_state,
            // Autostart commands
            get_autostart_enabled,
            set_autostart_enabled,
            get_start_minimized,
            set_start_minimized,
        ])
        .setup(|app| {
            eprintln!("[DIAGNOSTIC] Setting up Zetta Focus Console...");

            // Check if app should start minimized based on preference
            let prefs = crate::storage::load_preferences();
            if prefs.start_minimized {
                eprintln!("[DIAGNOSTIC] Starting minimized to tray (preference enabled)");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            // Setup global shortcuts
            if let Err(e) = setup_global_shortcuts(app.handle()) {
                eprintln!("[ERROR] Failed to setup global shortcuts: {}", e);
            }

            // Setup system tray
            if let Err(e) = setup_tray(app.handle()) {
                eprintln!("[ERROR] Failed to setup system tray: {}", e);
            }

            // Handle window close to minimize to tray
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        eprintln!("[DIAGNOSTIC] Window close requested - minimizing to tray");
                        api.prevent_close();
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                });
            }

            eprintln!("[DIAGNOSTIC] Setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

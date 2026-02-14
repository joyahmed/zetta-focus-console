//! Profile module - Profile-related commands

use crate::sound::{get_sound_data, SoundManager};
use crate::types::{AppState, BackgroundType, MotionIntensity, Profile, Season, TimerStatus};

pub fn profile_command(
    args: &[&str],
    app_state: &mut AppState,
    sound_manager: &mut SoundManager,
    is_pro: bool,
) -> String {
    match args.first() {
        Some(&"list") => list_profiles(app_state),
        Some(&"create") => create_profile(args, app_state, is_pro),
        Some(&"delete") => delete_profile(args, app_state),
        Some(&"edit") => edit_profile(args, app_state, is_pro),
        Some(&"duplicate") => duplicate_profile(args, app_state, is_pro),
        Some(&"switch") => switch_profile(args, app_state, sound_manager),
        None => format!(
            "Current profile: {}\nUse \"profile list\" to see all profiles.",
            app_state.active_profile.id
        ),
        Some(profile_id) => switch_profile_internal(profile_id, app_state, sound_manager),
    }
}

fn list_profiles(app_state: &AppState) -> String {
    let profiles_list: Vec<String> = app_state
        .profiles
        .iter()
        .map(|p| {
            let preset_tag = if p.is_preset { " [preset]" } else { " [custom]" };
            format!("  {} - {}{}", p.id, p.name, preset_tag)
        })
        .collect();
    format!("Available profiles:\n{}", profiles_list.join("\n"))
}

fn create_profile(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    // Check if user can create profile based on their tier
    if !app_state.can_create_profile(is_pro) {
        if is_pro {
            return "Error: Cannot create more profiles.".to_string();
        } else {
            return "Error: Free tier is limited to 1 custom profile. Upgrade to Pro for unlimited profiles.".to_string();
        }
    }

    if args.len() < 8 {
        return "Usage: profile create <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>\nExample: profile create \"My Profile\" 25 5 15 winter low fireplace".to_string();
    }

    let name = args[1].to_string();

    if app_state
        .profiles
        .iter()
        .any(|p| p.name.to_lowercase() == name.to_lowercase())
    {
        return format!("Error: A profile with name '{}' already exists.", name);
    }

    let base_id: String = name
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c
            } else if c == ' ' {
                '-'
            } else {
                '-'
            }
        })
        .collect();

    let mut clean_id = String::new();
    let mut prev_hyphen = false;
    for c in base_id.chars() {
        if c == '-' {
            if !prev_hyphen {
                clean_id.push(c);
            }
            prev_hyphen = true;
        } else {
            clean_id.push(c);
            prev_hyphen = false;
        }
    }
    let clean_id = clean_id.trim_matches('-').to_string();

    let mut new_id = clean_id.clone();
    let mut suffix = 1;
    while app_state.profiles.iter().any(|p| p.id == new_id) {
        new_id = format!("{}-{}", clean_id, suffix);
        suffix += 1;
    }

    let focus_min: u32 = match args[2].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 180 => v * 60,
        _ => return "Error: Focus duration must be 1-180 minutes.".to_string(),
    };
    let short_break_min: u32 = match args[3].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 60 => v * 60,
        _ => return "Error: Short break must be 1-60 minutes.".to_string(),
    };
    let long_break_min: u32 = match args[4].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 60 => v * 60,
        _ => return "Error: Long break must be 1-60 minutes.".to_string(),
    };

    let season = match args[5] {
        "spring" => Season::Spring,
        "summer" => Season::Summer,
        "autumn" => Season::Autumn,
        "winter" => Season::Winter,
        _ => return "Error: Season must be spring, summer, autumn, or winter.".to_string(),
    };

    let intensity = match args[6] {
        "low" => MotionIntensity::Low,
        "medium" => MotionIntensity::Medium,
        "high" => MotionIntensity::High,
        _ => return "Error: Intensity must be low, medium, or high.".to_string(),
    };

    let sound_file = args[7].to_string();

    let glow_color = match season {
        Season::Spring => "#34d399".to_string(),
        Season::Summer => "#fbbf24".to_string(),
        Season::Autumn => "#f97316".to_string(),
        Season::Winter => "#60a5fa".to_string(),
    };

    let new_profile = Profile {
        id: new_id.clone(),
        name: name.clone(),
        season,
        motion_intensity: intensity,
        background_type: BackgroundType::Gradient,
        focus_duration: focus_min,
        short_break_duration: short_break_min,
        long_break_duration: long_break_min,
        glow_color,
        sound_file,
        default_volume: 50,
        is_preset: false,
    };

    app_state.profiles.push(new_profile);
    format!("Created custom profile '{}' with ID: {}", name, new_id)
}

fn delete_profile(args: &[&str], app_state: &mut AppState) -> String {
    if args.len() < 2 {
        return "Usage: profile delete <id>".to_string();
    }
    let profile_id = args[1];

    if let Some(profile) = app_state.profiles.iter().find(|p| p.id == profile_id) {
        if profile.is_preset {
            return "Error: Cannot delete preset profiles. Only custom profiles can be deleted.".to_string();
        }

        if app_state.active_profile.id == profile_id {
            return "Error: Cannot delete the active profile. Switch to another profile first.".to_string();
        }

        app_state.profiles.retain(|p| p.id != profile_id);
        format!("Deleted profile: {}", profile_id)
    } else {
        format!("Error: Profile '{}' not found.", profile_id)
    }
}

fn edit_profile(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if args.len() < 9 {
        return "Usage: profile edit <id> <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>".to_string();
    }
    let profile_id = args[1];

    // Check if user can edit this profile based on their tier
    if !app_state.can_edit_profile(is_pro, profile_id) {
        if is_pro {
            return "Error: Cannot edit this profile.".to_string();
        } else {
            return "Error: Free tier can only edit your single custom profile. Upgrade to Pro for unlimited editing.".to_string();
        }
    }
    let new_name = args[2].to_string();

    let profile_ref = app_state.profiles.iter().find(|p| p.id == profile_id);
    if profile_ref.is_none() {
        return format!("Error: Profile '{}' not found.", profile_id);
    }
    if profile_ref.unwrap().is_preset {
        return "Error: Cannot edit preset profiles. Only custom profiles can be edited.".to_string();
    }

    if app_state
        .profiles
        .iter()
        .any(|p| p.id != profile_id && p.name.to_lowercase() == new_name.to_lowercase())
    {
        return format!("Error: A profile with name '{}' already exists.", new_name);
    }

    let focus_min: u32 = match args[3].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 180 => v * 60,
        _ => return "Error: Focus duration must be 1-180 minutes.".to_string(),
    };
    let short_break_min: u32 = match args[4].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 60 => v * 60,
        _ => return "Error: Short break must be 1-60 minutes.".to_string(),
    };
    let long_break_min: u32 = match args[5].parse::<u32>() {
        Ok(v) if v >= 1 && v <= 60 => v * 60,
        _ => return "Error: Long break must be 1-60 minutes.".to_string(),
    };

    let season = match args[6].to_lowercase().as_str() {
        "spring" => Season::Spring,
        "summer" => Season::Summer,
        "autumn" => Season::Autumn,
        "winter" => Season::Winter,
        _ => return "Error: Season must be spring, summer, autumn, or winter.".to_string(),
    };

    let intensity = match args[7].to_lowercase().as_str() {
        "low" => MotionIntensity::Low,
        "medium" => MotionIntensity::Medium,
        "high" => MotionIntensity::High,
        _ => return "Error: Intensity must be low, medium, or high.".to_string(),
    };

    let sound_file = args[8].to_string();

    let glow_color = match season {
        Season::Spring => "#34d399".to_string(),
        Season::Summer => "#fbbf24".to_string(),
        Season::Autumn => "#f97316".to_string(),
        Season::Winter => "#60a5fa".to_string(),
    };

    if let Some(profile) = app_state.profiles.iter_mut().find(|p| p.id == profile_id) {
        profile.name = new_name.clone();
        profile.season = season;
        profile.motion_intensity = intensity;
        profile.focus_duration = focus_min;
        profile.short_break_duration = short_break_min;
        profile.long_break_duration = long_break_min;
        profile.glow_color = glow_color;
        profile.sound_file = sound_file;

        if app_state.active_profile.id == profile_id && app_state.timer.status == TimerStatus::Idle {
            app_state.timer.remaining_seconds = focus_min;
            app_state.timer.total_seconds = focus_min;
        }

        format!("Updated profile: {}", new_name)
    } else {
        format!("Error: Profile '{}' not found.", profile_id)
    }
}

fn duplicate_profile(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    // Check if user can create more profiles based on their tier
    if !app_state.can_create_profile(is_pro) {
        if is_pro {
            return "Error: Cannot duplicate profile.".to_string();
        } else {
            return "Error: Free tier is limited to 1 custom profile. Upgrade to Pro for unlimited profiles.".to_string();
        }
    }

    if args.len() < 3 {
        return "Usage: profile duplicate <source_id> <new_id>".to_string();
    }
    let source_id = args[1];
    let new_id = args[2].to_string();

    if app_state.profiles.iter().any(|p| p.id == new_id) {
        return format!("Error: Profile with id '{}' already exists.", new_id);
    }

    if let Some(source) = app_state.profiles.iter().find(|p| p.id == source_id) {
        let mut new_profile = source.clone();
        new_profile.id = new_id.clone();
        new_profile.name = format!("{} (Copy)", source.name);
        new_profile.is_preset = false;

        app_state.profiles.push(new_profile);
        format!("Duplicated profile '{}' to '{}'", source_id, new_id)
    } else {
        format!("Error: Source profile '{}' not found.", source_id)
    }
}

fn switch_profile(args: &[&str], app_state: &mut AppState, sound_manager: &mut SoundManager) -> String {
    if args.len() < 2 {
        return "Usage: profile switch <id>".to_string();
    }
    switch_profile_internal(args[1], app_state, sound_manager)
}

fn switch_profile_internal(
    profile_id: &str,
    app_state: &mut AppState,
    sound_manager: &mut SoundManager,
) -> String {
    if let Some(profile) = app_state.profiles.iter().find(|p| p.id.as_str() == profile_id) {
        app_state.active_profile = profile.clone();
        if app_state.timer.status == TimerStatus::Idle {
            app_state.timer.remaining_seconds = profile.focus_duration;
            app_state.timer.total_seconds = profile.focus_duration;
        }
        if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
            let sound_data: &[u8] = get_sound_data(&profile.sound_file);
            app_state.sound_state.current_sound = Some(profile.sound_file.clone());
            app_state.sound_state.volume = profile.default_volume;
            let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
        }
        format!("Switched to profile: {}", profile.name)
    } else {
        format!("Error: Profile \"{}\" not found. Use \"profile list\" to see available profiles.", profile_id)
    }
}

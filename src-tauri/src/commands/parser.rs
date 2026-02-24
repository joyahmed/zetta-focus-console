//! Parser module - Command parsing utilities

/// Parse duration string like "1m", "30s", "2m30s" into seconds
pub fn parse_duration(input: &str) -> Result<u32, String> {
    let input = input.to_lowercase();
    let mut total_seconds = 0.0_f64;
    let mut current_number = String::new();
    let mut has_decimal = false;

    for c in input.chars() {
        if c.is_ascii_digit() {
            current_number.push(c);
        } else if c == '.' {
            if has_decimal {
                return Err("Invalid number".to_string());
            }
            current_number.push(c);
            has_decimal = true;
        } else if c == 'm' {
            if current_number.is_empty() {
                return Err("Invalid number".to_string());
            }
            let minutes: f64 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += minutes * 60.0;
            current_number.clear();
            has_decimal = false;
        } else if c == 's' {
            if current_number.is_empty() {
                return Err("Invalid number".to_string());
            }
            let seconds: f64 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += seconds;
            current_number.clear();
            has_decimal = false;
        } else {
            return Err(format!("Invalid character '{}' in duration", c));
        }
    }

    // If there's a number without unit, treat as minutes
    if !current_number.is_empty() {
        let minutes: f64 = current_number.parse().map_err(|_| "Invalid number")?;
        total_seconds += minutes * 60.0;
    }

    if !total_seconds.is_finite() || total_seconds <= 0.0 {
        return Err("Duration cannot be zero".to_string());
    }

    Ok(total_seconds.round() as u32)
}

/// Format seconds into MM:SS display
pub fn format_time(seconds: u32) -> String {
    let mins = seconds / 60;
    let secs = seconds % 60;
    format!("{:02}:{:02}", mins, secs)
}

/// Parse command preserving quoted strings
pub fn parse_command_with_quotes(input: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;

    for c in input.chars() {
        match c {
            '"' => {
                in_quotes = !in_quotes;
            }
            ' ' if !in_quotes => {
                if !current.is_empty() {
                    result.push(current.clone());
                    current.clear();
                }
            }
            _ => {
                current.push(c);
            }
        }
    }
    if !current.is_empty() {
        result.push(current);
    }

    result
}

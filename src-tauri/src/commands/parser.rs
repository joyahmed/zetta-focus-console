//! Parser module - Command parsing utilities

/// Parse duration string like "1m", "30s", "2m30s" into seconds
pub fn parse_duration(input: &str) -> Result<u32, String> {
    let input = input.to_lowercase();
    let mut total_seconds: u32 = 0;
    let mut current_number = String::new();

    for c in input.chars() {
        if c.is_ascii_digit() {
            current_number.push(c);
        } else if c == 'm' {
            let minutes: u32 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += minutes * 60;
            current_number.clear();
        } else if c == 's' {
            let seconds: u32 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += seconds;
            current_number.clear();
        } else {
            return Err(format!("Invalid character '{}' in duration", c));
        }
    }

    // If there's a number without unit, treat as minutes
    if !current_number.is_empty() {
        let minutes: u32 = current_number.parse().map_err(|_| "Invalid number")?;
        total_seconds += minutes * 60;
    }

    if total_seconds == 0 {
        return Err("Duration cannot be zero".to_string());
    }

    Ok(total_seconds)
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

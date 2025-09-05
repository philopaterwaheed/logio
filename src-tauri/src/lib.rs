// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod collector;
mod config;
mod app;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, State, Manager};
use std::path::PathBuf;

use collector::Collector;
use config::Config;
use app::App;



#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: Option<DateTime<Utc>>,
    pub level: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogFilter {
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub levels: Vec<String>,
    pub sources: Vec<String>,
    pub search_text: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogStats {
    pub total_logs: usize,
    pub error_count: usize,
    pub warning_count: usize,
    pub info_count: usize,
    pub debug_count: usize,
    pub sources: HashMap<String, usize>,
    pub recent_errors: Vec<LogEntry>,
}


#[tauri::command]
async fn get_logs(state: State<'_, App>) -> Result<HashMap<String, Vec<LogEntry>>, String> {
    // Convert PathBuf keys to String for JSON serialization
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    let mut result = HashMap::new();
    
    for (path, logs) in sources.iter() {
        result.insert(path.to_string_lossy().to_string(), logs.clone());
    }
    
    Ok(result)
}

#[tauri::command]
async fn start_log_collection(state: State<'_, App>) -> Result<String, String> {
    state.start_collection().await;
    Ok("Log collection started".to_string())
}

#[tauri::command]
async fn get_log_stats(state: State<'_, App>) -> Result<LogStats, String> {
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    
    let mut total_logs = 0;
    let mut error_count = 0;
    let mut warning_count = 0;
    let mut info_count = 0;
    let mut debug_count = 0;
    let mut sources_map = HashMap::new();
    let mut recent_errors = Vec::new();
    
    for (path, logs) in sources.iter() {
        let source_name = path.file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        
        sources_map.insert(source_name, logs.len());
        total_logs += logs.len();
        
        for log in logs {
            if let Some(ref level) = log.level {
                match level.to_lowercase().as_str() {
                    "error" => {
                        error_count += 1;
                        recent_errors.push(log.clone());
                    },
                    "warn" | "warning" => warning_count += 1,
                    "info" => info_count += 1,
                    "debug" => debug_count += 1,
                    _ => {}
                }
            }
        }
    }
    
    // Keep only the 10 most recent errors
    recent_errors.sort_by(|a, b| {
        b.timestamp.cmp(&a.timestamp)
    });
    recent_errors.truncate(10);
    
    Ok(LogStats {
        total_logs,
        error_count,
        warning_count,
        info_count,
        debug_count,
        sources: sources_map,
        recent_errors,
    })
}

#[tauri::command]
async fn filter_logs(state: State<'_, App>, filter: LogFilter) -> Result<HashMap<String, Vec<LogEntry>>, String> {
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    let mut result = HashMap::new();
    
    for (path, logs) in sources.iter() {
        let filtered_logs: Vec<LogEntry> = logs.iter()
            .filter(|log| {
                // Filter by time range
                if let (Some(start), Some(timestamp)) = (&filter.start_time, &log.timestamp) {
                    if timestamp < start {
                        return false;
                    }
                }
                if let (Some(end), Some(timestamp)) = (&filter.end_time, &log.timestamp) {
                    if timestamp > end {
                        return false;
                    }
                }
                
                // Filter by log levels
                if !filter.levels.is_empty() {
                    if let Some(ref level) = log.level {
                        if !filter.levels.contains(level) {
                            return false;
                        }
                    }
                }
                
                // Filter by search text
                if let Some(ref search_text) = filter.search_text {
                    if let Some(ref message) = log.message {
                        if !message.to_lowercase().contains(&search_text.to_lowercase()) {
                            return false;
                        }
                    }
                }
                
                true
            })
            .cloned()
            .collect();
        
        if !filtered_logs.is_empty() {
            result.insert(path.to_string_lossy().to_string(), filtered_logs);
        }
    }
    
    Ok(result)
}

#[tauri::command]
async fn clear_logs(state: State<'_, App>) -> Result<String, String> {
    let mut sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    sources.clear();
    Ok("Logs cleared".to_string())
}

#[tauri::command]
async fn open_log_file(app_handle: tauri::AppHandle, state: State<'_, App>) -> Result<String, String> {
    // For Tauri v2, we'll use a simpler approach or external dialog
    // This is a placeholder - you might want to use tauri-plugin-dialog
    Ok("File dialog functionality needs tauri-plugin-dialog".to_string())
}

#[tauri::command]
async fn open_log_directory(app_handle: tauri::AppHandle, state: State<'_, App>) -> Result<String, String> {
    // For Tauri v2, we'll use a simpler approach or external dialog
    // This is a placeholder - you might want to use tauri-plugin-dialog
    Ok("Directory dialog functionality needs tauri-plugin-dialog".to_string())
}

#[tauri::command]
async fn export_logs(state: State<'_, App>, format: String, file_path: String) -> Result<String, String> {
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    
    match format.as_str() {
        "json" => {
            let json = serde_json::to_string_pretty(&*sources)
                .map_err(|e| format!("Failed to serialize to JSON: {}", e))?;
            
            tokio::fs::write(&file_path, json).await
                .map_err(|e| format!("Failed to write file: {}", e))?;
        },
        "csv" => {
            // Simple CSV export
            let mut csv_content = String::from("timestamp,level,message,source\n");
            
            for (source_path, logs) in sources.iter() {
                let source_name = source_path.file_name()
                    .unwrap_or_default()
                    .to_string_lossy();
                
                for log in logs {
                    let timestamp = log.timestamp
                        .map(|t| t.to_rfc3339())
                        .unwrap_or_default();
                    let level = log.level.as_deref().unwrap_or("");
                    let message = log.message.as_deref().unwrap_or("");
                    
                    csv_content.push_str(&format!("{},{},{},{}\n", 
                        timestamp, level, message, source_name));
                }
            }
            
            tokio::fs::write(&file_path, csv_content).await
                .map_err(|e| format!("Failed to write file: {}", e))?;
        },
        _ => return Err("Unsupported format".to_string()),
    }
    
    Ok(format!("Exported to {}", file_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app::App::default())
        .invoke_handler(tauri::generate_handler![
            get_logs,
            start_log_collection,
            get_log_stats,
            filter_logs,
            clear_logs,
            open_log_file,
            open_log_directory,
            export_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

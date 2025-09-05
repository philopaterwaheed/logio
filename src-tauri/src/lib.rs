// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod collector;
mod config;
mod app;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;
use std::path::PathBuf;

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
async fn get_logs(state: State<'_, App>) -> Result<HashMap<PathBuf, Vec<LogEntry>>, String> {
    state.start_collection().await;
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    Ok(sources.clone())
}

#[tauri::command]
async fn add_sample_logs(state: State<'_, App>) -> Result<HashMap<PathBuf, Vec<LogEntry>>, String> {
    // Add some sample log entries for testing
    let sample_logs = vec![
        LogEntry {
            timestamp: Some(Utc::now()),
            level: Some("INFO".to_string()),
            message: Some("Application started successfully".to_string()),
        },
        LogEntry {
            timestamp: Some(Utc::now()),
            level: Some("ERROR".to_string()),
            message: Some("Failed to connect to database".to_string()),
        },
        LogEntry {
            timestamp: Some(Utc::now()),
            level: Some("WARN".to_string()),
            message: Some("Low disk space warning".to_string()),
        },
        LogEntry {
            timestamp: Some(Utc::now()),
            level: Some("DEBUG".to_string()),
            message: Some("Processing user request".to_string()),
        },
    ];
    
    let sample_path = PathBuf::from("sample.log");
    {
        let mut sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
        sources.insert(sample_path, sample_logs);
    }
    
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    Ok(sources.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app::App::default())
        .invoke_handler(tauri::generate_handler![get_logs, add_sample_logs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

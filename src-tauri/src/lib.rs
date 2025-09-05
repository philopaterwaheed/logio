// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod collector;
mod config;
mod app;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, State};
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
async fn get_logs(state: State<'_, App>) -> HashMap<PathBuf, Vec<LogEntry>> {
    // Start collection to ensure we have fresh data
    state.start_collection().await;
    
    // Return the collected logs
    let sources = state.sources.lock().unwrap();
    sources.clone()
}

#[tauri::command]
async fn add_sample_logs(state: State<'_, App>) -> HashMap<PathBuf, Vec<LogEntry>> {
    // Add some sample logs for testing
    let mut sources = state.sources.lock().unwrap();
    
    // Sample log entries
    let sample_logs = vec![
        LogEntry {
            timestamp: Some(chrono::Utc::now()),
            level: Some("INFO".to_string()),
            message: Some("Application started successfully".to_string()),
        },
        LogEntry {
            timestamp: Some(chrono::Utc::now() - chrono::Duration::minutes(5)),
            level: Some("WARN".to_string()),
            message: Some("Memory usage is getting high".to_string()),
        },
        LogEntry {
            timestamp: Some(chrono::Utc::now() - chrono::Duration::minutes(10)),
            level: Some("ERROR".to_string()),
            message: Some("Failed to connect to database".to_string()),
        },
        LogEntry {
            timestamp: Some(chrono::Utc::now() - chrono::Duration::minutes(15)),
            level: Some("DEBUG".to_string()),
            message: Some("Processing user request".to_string()),
        },
    ];
    
    // Add sample log files
    sources.insert(PathBuf::from("/var/log/app.log"), sample_logs.clone());
    sources.insert(PathBuf::from("/var/log/error.log"), sample_logs[2..3].to_vec());
    sources.insert(PathBuf::from("/var/log/access.log"), sample_logs.clone());
    
    sources.clone()
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

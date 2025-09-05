// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod app;
mod collector;
mod config;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::{command, Manager, State};

use app::App;
use collector::Collector;
use config::Config;

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
    let sources = state
        .sources
        .lock()
        .map_err(|e| format!("Failed to lock sources: {}", e))?;
    let mut result = HashMap::new();
    for (path, logs) in sources.iter() {
        result.insert(path.to_string_lossy().to_string(), logs.clone());
    }
    println!("get_logs: Retrieved logs from {} sources", result.len());

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app::App::default())
        .invoke_handler(tauri::generate_handler![get_logs,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

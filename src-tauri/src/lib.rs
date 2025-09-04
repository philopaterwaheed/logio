// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: DateTime<Utc>,
    pub source: String,
    pub level: String,
    pub message: String,
    pub file_path: Option<String>,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

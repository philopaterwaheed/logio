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
fn get_logs(state: State<App>) -> HashMap<PathBuf, Vec<LogEntry>> {
    let sources = state.sources.lock().unwrap();
    sources.clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app::App::default())
        .invoke_handler(tauri::generate_handler![get_logs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

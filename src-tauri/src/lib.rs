// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod collector;
mod config;
mod app;
mod types;

use tauri::State;
use types::{LogEntry, LogSource};
use app::App;


#[tauri::command]
async fn get_logs(state: State<'_, App>) -> Result<Vec<(LogSource, Vec<LogEntry>)>, String> {
    state.start_collection().await;
    let sources = state.sources.lock().map_err(|e| format!("Failed to lock sources: {}", e))?;
    Ok(sources.clone())
}

#[tauri::command]
async fn refresh_source(state: State<'_, App>, path: String) -> Result<(LogSource, Vec<LogEntry>), String> {
    let path_buf = std::path::PathBuf::from(path);
    state.update_source_entries(&path_buf)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app::App::default())
        .invoke_handler(tauri::generate_handler![get_logs , refresh_source])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

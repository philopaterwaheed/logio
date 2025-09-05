use serde::{Deserialize, Serialize};
use tauri::Result;
use std::path::{ PathBuf};
use std::fs;

use crate::config::load_config;
use crate::{LogEntry, LogSource};

#[derive(Debug, Serialize, Deserialize)]
pub struct Collector {
    pub paths: Vec<PathBuf>,
    pub max_size: u64,
}

impl Default for Collector {
    fn default() -> Self {
        let mut config = match load_config() {
            Ok(config_res) => config_res,
            Err(e) => {
                panic!("Failed to load config: {:?}", e);
            }
        };
        let mut paths = vec![
            PathBuf::from("/var/log"),
            PathBuf::from("/var/log/syslog"),
            PathBuf::from("/var/log/messages"),
            PathBuf::from("/var/log/kern.log"),
            PathBuf::from("/var/log/auth.log"),
            PathBuf::from("/var/log/daemon.log"),
            PathBuf::from("/var/log/user.log"),
            PathBuf::from("/var/log/mail.log"),
            PathBuf::from("/var/log/cron.log"),
            PathBuf::from("/var/log/apache2"),
            PathBuf::from("/var/log/nginx"),
            PathBuf::from("/var/log/mysql"),
            PathBuf::from("/var/log/postgresql"),
            PathBuf::from("/var/log/docker"),
            PathBuf::from("/var/log/systemd"),
            // macOS paths
            PathBuf::from("/var/log/system.log"),
            PathBuf::from("/var/log/install.log"),
            // Windows paths
            PathBuf::from("C:\\Windows\\Logs"),
        ]; // common log file paths
        paths.append(&mut config.log_paths); // add user files
        Self {
            paths: paths,
            max_size: if let Some(max) = config.max_log_size.checked_mul(1024 * 1024) {
                max
            } else {
                10 * 1024 * 1024 // default to 10 MB if overflow or not set
            },
        }
    }
}

impl Collector {
    pub fn add_path(&mut self, path: PathBuf) {
        if !self.paths.contains(&path) {
            self.paths.push(path);
        }
    }
    pub fn remove_path(&mut self, path: &PathBuf) {
        self.paths.retain(|p| p != path);
    }
    pub fn list_paths(&self) -> &Vec<PathBuf> {
        &self.paths
    }
    pub async fn collect_logs(&self) -> Result<Vec<(LogSource, Vec<LogEntry>)> >{
        let mut sources = Vec::new();
        for path in &self.paths {
            if path.is_file() {
                let mut logs: Vec<LogEntry> = Vec::new();
                if let Ok(content) = tokio::fs::read_to_string(path).await {
                    for line in content.lines() {
                        // todo : parse line
                        let log = LogEntry {
                            timestamp: None,
                            level: None,
                            message: Some(line.to_string()),
                        };
                        logs.push(log);
                    }
                    let metadata = fs::metadata(path)?;
                    sources.push((LogSource{path:path.clone() , size:metadata.len()}, logs));
                }
            } else if path.is_dir() {
                if let Ok(mut entries) = tokio::fs::read_dir(path).await {
                    while let Ok(Some(entry)) = entries.next_entry().await {
                        let file_path = entry.path();
                        if file_path.is_file() {
                            if let Ok(metadata) = entry.metadata().await {
                                if metadata.len() <= self.max_size {
                                    if let Ok(content) = tokio::fs::read_to_string(&file_path).await
                                    {
                                        let mut logs: Vec<LogEntry> = Vec::new();
                                        for line in content.lines() {
                                            // todo : parse line
                                            let log = LogEntry {
                                                timestamp: None,
                                                level: None,
                                                message: Some(line.to_string()),
                                            };
                                            logs.push(log);
                                        }
                                        let metadata = fs::metadata(&file_path)?;
                                        sources.push((LogSource{path:file_path.clone() , size:metadata.len()}, logs));
                                    }
                                } else {
                                    // this will change in future when being lazy
                                    let mut logs: Vec<LogEntry> = Vec::new();
                                    let empty_log = LogEntry {
                                        timestamp: None,
                                        level: Some("warning".to_string()),
                                        message: Some(format!(
                                            "File too large ({} bytes), skipping",
                                            metadata.len()
                                        )),
                                    };
                                    logs.push(empty_log);
                                    let metadata = fs::metadata(&file_path)?;
                                    sources.push((LogSource{path:file_path.clone() , size:metadata.len()}, logs));
                                }
                            }
                        }
                    }
                }
            }
        }
        Ok(sources)
    }
}

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: Option<DateTime<Utc>>,
    pub level: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogSource {
    pub path: PathBuf,
    pub size: u64,
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



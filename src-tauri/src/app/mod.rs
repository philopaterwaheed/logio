use std::path::PathBuf;
use std::sync::Mutex;

use crate::collector::Collector;
use crate::LogEntry;
use crate::LogSource;

#[derive(Debug)]
pub struct App {
    pub  sources:  Mutex<Vec<(LogSource, Vec<LogEntry>)>>, // source -> log lines
    collector: Collector,
}

impl Default for App {
    fn default() -> Self {
        Self {
            sources: Mutex::new(Vec::new()),
            collector: Collector::default(),
        }
    }
}
impl App {
    pub async fn start_collection(&self) {
        if let Ok(sources_map) = self.collector.collect_logs().await {
            let mut sources = self.sources.lock().unwrap();
            *sources = sources_map;
            println!("Log collection completed. Collected {} sources.", sources.len());
            return;
        }
    }
    pub fn get_logs(&self) -> Vec<(LogSource, Vec<LogEntry>)> {
        let sources = self.sources.lock().unwrap();
        sources.clone()
    }
}

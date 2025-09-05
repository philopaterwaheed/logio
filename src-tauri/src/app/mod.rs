use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::collector::Collector;
use crate::LogEntry;

#[derive(Debug)]
pub struct App {
    pub  sources:  Mutex<HashMap<PathBuf, Vec<LogEntry>>>, // source -> log lines
    collector: Collector,
}

impl Default for App {
    fn default() -> Self {
        Self {
            sources: Mutex::new(HashMap::new()),
            collector: Collector::default(),
        }
    }
}
impl App {
    pub async fn start_collection(&self) {
        if let Ok(sources_vec) = self.collector.collect_logs().await {
            let mut sources = self.sources.lock().unwrap();
            *sources = sources_vec;
            
            return;
        }
    }
    pub fn get_logs(&self) -> HashMap<PathBuf, Vec<LogEntry>> {
        let sources = self.sources.lock().unwrap();
        sources.clone()
    }
}

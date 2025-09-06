use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::collector::Collector;
use crate::LogEntry;
use crate::LogSource;

#[derive(Debug)]
pub struct App {
    pub sources: Mutex<Vec<(LogSource, Vec<LogEntry>)>>, // source -> log lines
    pub source_indexes: Mutex<HashMap<PathBuf, usize>>,  // source name -> index in sources
    collector: Collector,
}

impl Default for App {
    fn default() -> Self {
        Self {
            sources: Mutex::new(Vec::new()),
            collector: Collector::default(),
            source_indexes: Mutex::new(HashMap::new()),
        }
    }
}
impl App {
    pub async fn start_collection(&self) {
        if let Ok(output) = self.collector.collect_all_logs().await {
            let mut sources = self.sources.lock().unwrap();
            let mut source_indexes = self.source_indexes.lock().unwrap();
            (*sources, *source_indexes) = output;
            println!(
                "Log collection completed. Collected {} sources.",
                sources.len()
            );
            return;
        }
    }
    pub fn update_source_entries(&self, path: &PathBuf) {
        let mut sources = self.sources.lock().unwrap();
        let mut source_indexes = self.source_indexes.lock().unwrap();
        if let Some(&index) = source_indexes.get(path) {
            if let Some((log_source, log_entries)) = sources.get_mut(index) {
                if let Ok((output_source, output_entries)) =
                    self.collector.collect_logs_for_path(path)
                {
                    *log_source = output_source;
                    *log_entries = output_entries;
                }
            }
        } else {
            if let Ok((output_source, output_entries)) = self.collector.collect_logs_for_path(path)
            {
                let log_source = output_source;
                let log_entries = output_entries;
                sources.push((log_source, log_entries));
                source_indexes.insert(path.clone(), sources.len() - 1);
            }
        }
    }
}

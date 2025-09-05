use serde::{Deserialize, Serialize};
use std::path::{PathBuf};
use std::{fs, io};
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub log_paths: Vec<PathBuf>,
    pub dark_mode: bool,
    pub max_log_size: u64,
    
}

impl Default for Config {
    fn default() -> Self {
        Self {
            log_paths: vec![],
            dark_mode: false,
            max_log_size: 10, // in MB
        }
    }
}
pub fn get_config_path() -> PathBuf {
    let base_dir = dirs::config_dir().expect("Could not find config directory");
    base_dir.join("Logio").join("config.json")
}

pub fn load_config() -> io::Result<Config> {
    let path = get_config_path();
    match fs::read_to_string(&path) {
        Ok(data) => {
            let config: Config = serde_json::from_str(&data)
                .unwrap_or_else(|_| Config::default());
            Ok(config)
        }
        Err(err) if err.kind() == io::ErrorKind::NotFound => {
            let config = Config::default();
            let json = serde_json::to_string_pretty(&config).unwrap();
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&path, json)?;
            Ok(config)
        }
        Err(err) => Err(err),
    }
}

pub fn save_config(config: &Config) -> io::Result<()> {
    let path = get_config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let data = serde_json::to_string_pretty(config).unwrap();
    fs::write(path, data)?;
    Ok(())
}



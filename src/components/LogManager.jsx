import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useLogManager = () => {
  const [logs, setLogs] = useState({});
  const [logEntries, setLogEntries] = useState([]);
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const fetchLogs = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    let result;
    try {
      result = await invoke('get_logs');
    } catch (err) {
      console.warn('No real logs found, adding sample logs:', err);
      result = [];
    }

    if (result.length > 0) {
    }

    setLogs(result);

    const files = result.map(([logSource, logEntries]) => ({
      id: logSource.path,
      name: logSource.path.split('/').pop(),
      path: logSource.path,
      size: Math.floor(logSource.size / 1024) > 0
	? `${Math.floor(logSource.size / 1024)} KB`
	: `${logSource.size} B`,
      modified: new Date().toLocaleDateString(),
      entryCount: logEntries.length,
      logSourceKey: logSource
    }));
    setLogFiles(files);

    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0]);
    }
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    setError(err.message || 'Failed to fetch logs');
  } finally {
    setLoading(false);
  }
}, [selectedFile]);  // Update log entries when selected file changes


useEffect(() => {
  if (selectedFile) {
    // logs is an array of [logSource, logEntries]
    const tuple = logs.find(([logSource]) => logSource.path === selectedFile.path);
    if (tuple) {
      const [, logEntriesRaw] = tuple;
      const entries = logEntriesRaw.map((entry, index) => ({
        id: index + 1,
        timestamp: entry.timestamp || new Date().toISOString(),
        level: entry.level || 'INFO',
        message: entry.message || 'No message',
        source: selectedFile.name
      }));
      setLogEntries(entries);
    } else {
      setLogEntries([]);
    }
  } else {
    setLogEntries([]);
  }
}, [selectedFile, logs]);


  // Select a log file
  const selectLogFile = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  // Refresh logs
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);


  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    logEntries,
    logFiles,
    selectedFile,
    loading,
    error,
    selectLogFile,
    refreshLogs,
  };
};

export default useLogManager;

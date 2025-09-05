import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useLogManager = () => {
  const [logs, setLogs] = useState({});
  const [logEntries, setLogEntries] = useState([]);
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logs from Tauri backend
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to call the get_logs command from Tauri
      let result;
      try {
        result = await invoke('get_logs');
      } catch (err) {
        // If no real logs found, try to add sample logs for testing
        console.warn('No real logs found, adding sample logs:', err);
        result = await invoke('add_sample_logs');
      }
      
      setLogs(result);
      
      // Convert the logs object to arrays for display
      const files = Object.keys(result).map(filePath => ({
        id: filePath,
        name: filePath.split('/').pop() || filePath,
        path: filePath,
        size: `${Math.floor(result[filePath].length / 10)} KB`, // Rough estimate
        modified: new Date().toLocaleDateString(),
        entryCount: result[filePath].length
      }));
      
      setLogFiles(files);
      
      // If no file is selected and we have files, select the first one
      if (!selectedFile && files.length > 0) {
        setSelectedFile(files[0]);
      }
      
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  // Update log entries when selected file changes
  useEffect(() => {
    if (selectedFile && logs[selectedFile.path]) {
      const entries = logs[selectedFile.path].map((entry, index) => ({
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
  }, [selectedFile, logs]);

  // Select a log file
  const selectLogFile = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  // Refresh logs
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Add sample logs for testing
  const addSampleLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await invoke('add_sample_logs');
      setLogs(result);
      
      // Convert the logs object to arrays for display
      const files = Object.keys(result).map(filePath => ({
        id: filePath,
        name: filePath.split('/').pop() || filePath,
        path: filePath,
        size: `${Math.floor(result[filePath].length / 10)} KB`,
        modified: new Date().toLocaleDateString(),
        entryCount: result[filePath].length
      }));
      
      setLogFiles(files);
      
      if (!selectedFile && files.length > 0) {
        setSelectedFile(files[0]);
      }
      
    } catch (err) {
      console.error('Failed to add sample logs:', err);
      setError(err.message || 'Failed to add sample logs');
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

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
    addSampleLogs
  };
};

export default useLogManager;

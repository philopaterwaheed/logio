import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * Custom hook for interacting with Tauri backend
 */
export const useTauri = () => {
  const [logs, setLogs] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all logs
  const getLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('get_logs');
      setLogs(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start log collection
  const startLogCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('start_log_collection');
      console.log(result);
      // Refresh logs after starting collection
      await getLogs();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to start log collection:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get log statistics
  const getLogStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('get_log_stats');
      setStats(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get log stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs
  const filterLogs = async (filter) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('filter_logs', { filter });
      setLogs(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to filter logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all logs
  const clearLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('clear_logs');
      setLogs({});
      setStats(null);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to clear logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open log file
  const openLogFile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('open_log_file');
      console.log(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to open log file:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open log directory
  const openLogDirectory = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('open_log_directory');
      console.log(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to open log directory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export logs
  const exportLogs = async (format, filePath) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke('export_logs', { format, filePath });
      console.log(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to export logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    logs,
    stats,
    loading,
    error,
    
    // Actions
    getLogs,
    startLogCollection,
    getLogStats,
    filterLogs,
    clearLogs,
    openLogFile,
    openLogDirectory,
    exportLogs,
  };
};

export default useTauri;

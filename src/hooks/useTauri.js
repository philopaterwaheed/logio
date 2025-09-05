import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useTauri = () => {
  const [logs, setLogs] = useState({});
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

   return {
    logs,
    loading,
    error,
    getLogs
  };
};

export default useTauri;

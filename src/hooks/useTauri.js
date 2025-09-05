import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useTauri = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test connection by trying to invoke a simple command
    const testConnection = async () => {
      try {
        await invoke('get_logs');
        setIsConnected(true);
      } catch (error) {
        console.warn('Tauri connection test failed:', error);
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  const invokeCommand = async (command, args = {}) => {
    try {
      const result = await invoke(command, args);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Tauri command '${command}' failed:`, error);
      return { success: false, error: error.message };
    }
  };

  return {
    isConnected,
    invoke: invokeCommand
  };
};

export default useTauri;

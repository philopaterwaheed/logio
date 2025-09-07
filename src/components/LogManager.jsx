import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useLogManager = () => {
  const [logSourcesMap, setLogSourcesMap] = useState({});
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

    const sourcesMap = {};
    const files = result.map(([logSource, logEntries]) => {
      sourcesMap[logSource.path] = {
        logSource,
        entries: logEntries
      };
      
      return {
        id: logSource.path,
        name: logSource.path.split('/').pop(),
        path: logSource.path,
        size: Math.floor(logSource.size / 1024) > 0
          ? `${Math.floor(logSource.size / 1024)} KB`
          : `${logSource.size} B`,
        modified: new Date().toLocaleDateString(),
        entryCount: logEntries.length,
        logSourceKey: logSource
      };
    });
    
    setLogSourcesMap(sourcesMap);
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
}, []);  // Update log entries when selected file changes


useEffect(() => {
  if (selectedFile) {
    const sourceData = logSourcesMap[selectedFile.path];
    if (sourceData) {
      const entries = sourceData.entries.map((entry, index) => ({
        id: index + 1,
        timestamp: entry.timestamp || new Date().toISOString(),
        level: entry.level || 'INFO',
        message: entry.message || 'No message',
      }));
      setLogEntries(entries);
    } else {
      setLogEntries([]);
    }
  } else {
    setLogEntries([]);
  }
}, [selectedFile, logSourcesMap]);


  const selectLogFile = useCallback(async (file) => {
    setSelectedFile(file);
    
    if (file && file.path) {
      try {
        setLoading(true);
        setError(null);
        
        const [updatedLogSource, updatedLogEntries] = await invoke('refresh_source', { path: file.path });
        
        setLogSourcesMap(prevMap => ({
          ...prevMap,
          [file.path]: {
            logSource: updatedLogSource,
            entries: updatedLogEntries
          }
        }));
        
        // Update the file metadata for this specific file
        setLogFiles(prevFiles => 
          prevFiles.map(f => 
            f.path === file.path 
              ? { 
                  ...f, 
                  entryCount: updatedLogEntries.length, 
                  modified: new Date().toLocaleDateString(),
                  size: Math.floor(updatedLogSource.size / 1024) > 0
                    ? `${Math.floor(updatedLogSource.size / 1024)} KB`
                    : `${updatedLogSource.size} B`
                }
              : f
          )
        );
      } catch (err) {
        console.error('Failed to refresh selected file:', err);
        setError(err.message || 'Failed to refresh selected file');
      } finally {
        setLoading(false);
      }
    }
  }, []);

    // Refresh a specific log source
  const refreshLogSource = useCallback(async (filePath) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the refresh_source command from Rust which now returns the updated data
      const [updatedLogSource, updatedLogEntries] = await invoke('refresh_source', { path: filePath });
      
      // Update only the corresponding value in the dictionary, not the whole dictionary
      setLogSourcesMap(prevMap => ({
        ...prevMap,
        [filePath]: {
          logSource: updatedLogSource,
          entries: updatedLogEntries
        }
      }));
      
      // Update the file metadata for this specific file
      setLogFiles(prevFiles => 
        prevFiles.map(f => 
          f.path === filePath 
            ? { 
                ...f, 
                entryCount: updatedLogEntries.length, 
                modified: new Date().toLocaleDateString(),
                size: Math.floor(updatedLogSource.size / 1024) > 0
                  ? `${Math.floor(updatedLogSource.size / 1024)} KB`
                  : `${updatedLogSource.size} B`
              }
            : f
        )
      );
      
    } catch (err) {
      console.error('Failed to refresh log source:', err);
      setError(err.message || 'Failed to refresh log source');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all logs
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);


  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logSourcesMap,
    logEntries,
    logFiles,
    selectedFile,
    loading,
    error,
    selectLogFile,
    refreshLogs,
    refreshLogSource,
  };
};

export default useLogManager;

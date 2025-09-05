import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import useTauri from '../hooks/useTauri';

const LogManager = () => {
  const {
    logs,
    stats,
    loading,
    error,
    getLogs,
    startLogCollection,
    getLogStats,
    clearLogs,
    openLogFile,
    openLogDirectory
  } = useTauri();

  useEffect(() => {
    // Initialize by getting current logs and stats
    getLogs();
    getLogStats();
  }, []);

  const handleStartCollection = async () => {
    await startLogCollection();
    // Refresh stats after collection
    await getLogStats();
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Card title="Log Statistics" className="mb-3">
        <div className="grid">
          <div className="col-12 md:col-3">
            <div className="text-center">
              <h3 className="text-blue-500">{stats.total_logs}</h3>
              <p>Total Logs</p>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div className="text-center">
              <h3 className="text-red-500">{stats.error_count}</h3>
              <p>Errors</p>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div className="text-center">
              <h3 className="text-yellow-500">{stats.warning_count}</h3>
              <p>Warnings</p>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div className="text-center">
              <h3 className="text-green-500">{stats.info_count}</h3>
              <p>Info</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderLogs = () => {
    if (!logs || Object.keys(logs).length === 0) {
      return (
        <Card title="Log Sources">
          <p>No logs available. Start log collection or open a log file.</p>
        </Card>
      );
    }

    return (
      <div>
        {Object.entries(logs).map(([source, logEntries]) => (
          <Card key={source} title={`Source: ${source}`} className="mb-3">
            <div className="max-h-20rem overflow-auto">
              {logEntries.slice(0, 10).map((log, index) => (
                <div key={index} className="border-bottom-1 border-200 py-2">
                  <div className="flex align-items-center gap-2">
                    <span className={`badge ${
                      log.level === 'error' ? 'bg-red-500' :
                      log.level === 'warning' || log.level === 'warn' ? 'bg-yellow-500' :
                      log.level === 'info' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {log.level || 'unknown'}
                    </span>
                    <small className="text-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}
                    </small>
                  </div>
                  <p className="mt-1 mb-0">{log.message || 'No message'}</p>
                </div>
              ))}
              {logEntries.length > 10 && (
                <p className="text-center text-500 mt-2">
                  ... and {logEntries.length - 10} more logs
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="log-manager p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Log Manager</h2>
        {loading && <ProgressSpinner style={{ width: '30px', height: '30px' }} />}
      </div>

      {error && (
        <Message 
          severity="error" 
          text={error} 
          className="mb-3"
        />
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button 
          label="Start Collection" 
          icon="pi pi-play"
          onClick={handleStartCollection}
          disabled={loading}
          className="p-button-success"
        />
        <Button 
          label="Refresh" 
          icon="pi pi-refresh"
          onClick={() => {
            getLogs();
            getLogStats();
          }}
          disabled={loading}
        />
        <Button 
          label="Open File" 
          icon="pi pi-folder-open"
          onClick={openLogFile}
          disabled={loading}
        />
        <Button 
          label="Open Directory" 
          icon="pi pi-folder"
          onClick={openLogDirectory}
          disabled={loading}
        />
        <Button 
          label="Clear Logs" 
          icon="pi pi-trash"
          onClick={clearLogs}
          disabled={loading}
          className="p-button-danger"
        />
      </div>

      {renderStats()}
      {renderLogs()}
    </div>
  );
};

export default LogManager;

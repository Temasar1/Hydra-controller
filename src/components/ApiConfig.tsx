import React, { useState } from 'react';
import { HydraApiConfig } from '../types/hydra';

interface ApiConfigProps {
  config: HydraApiConfig;
  onConfigChange: (config: HydraApiConfig) => void;
  onTestConnection: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

export const ApiConfig: React.FC<ApiConfigProps> = ({
  config,
  onConfigChange,
  onTestConnection,
  isConnected,
  isLoading
}) => {
  const [url, setUrl] = useState(config.url);
  const [timeout, setTimeout] = useState(config.timeout || 5000);

  const handleSave = () => {
    onConfigChange({
      url,
      timeout
    });
  };

  const handleTest = async () => {
    await onTestConnection();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Mesh Hydra API Configuration</h3>
        <p>Configure the connection to your Mesh Hydra node</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="form-group">
          <label className="form-label">API URL</label>
          <input
            type="url"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:4001"
          />
          <small className="text-muted">
            Enter the URL of your Mesh Hydra node API endpoint
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Timeout (ms)</label>
          <input
            type="number"
            className="form-input"
            value={timeout}
            onChange={(e) => setTimeout(parseInt(e.target.value) || 5000)}
            placeholder="5000"
          />
          <small className="text-muted">
            Request timeout in milliseconds
          </small>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading || !url}
          >
            Save Configuration
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={isLoading || !url}
          >
            Test Connection
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="text-muted">Status:</span>
          <span className={`status ${isConnected ? 'status-success' : 'status-error'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Current Configuration Display */}
        <div className="p-2 rounded" style={{backgroundColor: 'var(--bg-secondary)'}}>
          <h5 className="mb-1">Current Configuration</h5>
          <div className="font-mono text-sm">
            <div>URL: {config.url || 'Not set'}</div>
            <div>Timeout: {config.timeout || 5000}ms</div>
          </div>
        </div>
      </div>
    </div>
  );
};

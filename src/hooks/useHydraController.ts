import { useState, useEffect, useCallback } from 'react';
import { HydraApiClient, defaultHydraConfig } from '../services/hydraApi';
import { HydraApiConfig, HydraNodeState, ClientInput } from '../types/hydra';

export const useHydraController = () => {
  const [apiClient] = useState(() => new HydraApiClient(defaultHydraConfig));
  const [config, setConfig] = useState<HydraApiConfig>(defaultHydraConfig);
  const [nodeState, setNodeState] = useState<HydraNodeState>({
    headId: undefined,
    contestationDeadline: undefined,
    contestationPeriod: undefined,
    parties: [],
    utxo: [],
    snapshotNumber: 0,
    isInitialized: false,
    isOpen: false,
    isClosed: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update API client configuration
  const updateConfig = useCallback((newConfig: HydraApiConfig) => {
    setConfig(newConfig);
    apiClient.updateConfig(newConfig);
  }, [apiClient]);

  // Test connection to Hydra node
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.testConnection();
      setIsConnected(response.success);
      if (!response.success) {
        setError(response.error || 'Connection failed');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  // Fetch current node state
  const fetchNodeState = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getNodeState();
      if (response.success && response.data) {
        setNodeState(response.data);
      } else {
        setError(response.error || 'Failed to fetch node state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch node state');
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, isConnected]);

  // Send command to Hydra node
  const sendCommand = useCallback(async (command: ClientInput) => {
    if (!isConnected) {
      setError('Not connected to Hydra node');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.sendCommand(command);
      if (response.success) {
        // Refresh node state after successful command
        await fetchNodeState();
      } else {
        setError(response.error || 'Command failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Command failed');
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, isConnected, fetchNodeState]);

  // Auto-refresh node state periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchNodeState();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isConnected, fetchNodeState]);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return {
    config,
    nodeState,
    isConnected,
    isLoading,
    error,
    updateConfig,
    testConnection,
    fetchNodeState,
    sendCommand,
    setError,
  };
};

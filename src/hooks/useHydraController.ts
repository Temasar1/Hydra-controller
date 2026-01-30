import { useState, useEffect, useCallback } from 'react';
import { HydraApiClient } from '../services/hydraApi';
import { HydraNodeConfig, HydraNodeData, HydraNodeState, ClientInput } from '../types/hydra';

export const useHydraController = () => {
  const [nodes, setNodes] = useState<Map<string, HydraNodeData>>(new Map());
  const [apiClients] = useState<Map<string, HydraApiClient>>(new Map());

  // Get or create API client for a node
  const getApiClient = useCallback((nodeId: string, url: string) => {
    if (!apiClients.has(nodeId)) {
      const client = new HydraApiClient({ url, timeout: 5000 });
      apiClients.set(nodeId, client);
      return client;
    }
    const client = apiClients.get(nodeId)!;
    client.updateConfig({ url, timeout: 5000 });
    return client;
  }, [apiClients]);

  // Initialize a new node
  const addNode = useCallback((config: HydraNodeConfig) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(config.id)) {
        newMap.set(config.id, {
          config,
          state: {
            headId: undefined,
            contestationDeadline: undefined,
            contestationPeriod: undefined,
            parties: [],
            utxo: [],
            snapshotNumber: 0,
            isInitialized: false,
            isOpen: false,
            isClosed: false,
          },
          isConnected: false,
          isLoading: false,
          error: null,
        });
      }
      return newMap;
    });
  }, []);

  // Remove a node
  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
    apiClients.delete(nodeId);
  }, [apiClients]);

  // Update node configuration
  const updateNodeConfig = useCallback((nodeId: string, updates: Partial<HydraNodeConfig>) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      const nodeData = newMap.get(nodeId);
      if (nodeData) {
        const newConfig = { ...nodeData.config, ...updates };
        newMap.set(nodeId, {
          ...nodeData,
          config: newConfig,
        });
        // Update API client if URL changed
        if (updates.url) {
          getApiClient(nodeId, updates.url);
        }
      }
      return newMap;
    });
  }, [getApiClient]);

  // Update node URL
  const updateNodeUrl = useCallback((nodeId: string, url: string) => {
    updateNodeConfig(nodeId, { url });
  }, [updateNodeConfig]);

  // Update node BOS
  const updateNodeBos = useCallback((nodeId: string, bos: string) => {
    updateNodeConfig(nodeId, { bos });
  }, [updateNodeConfig]);

  // Test connection to a specific node
  const testConnection = useCallback(async (nodeId: string) => {
    let nodeUrl: string | undefined;
    
    setNodes(prev => {
      const newMap = new Map(prev);
      const nodeData = newMap.get(nodeId);
      if (!nodeData) return newMap;
      
      nodeUrl = nodeData.config.url;
      newMap.set(nodeId, { ...nodeData, isLoading: true, error: null });
      return newMap;
    });

    if (!nodeUrl) return;

    try {
      const apiClient = getApiClient(nodeId, nodeUrl);
      const response = await apiClient.testConnection();
      
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            isConnected: response.success,
            isLoading: false,
            error: response.success ? null : (response.error || 'Connection failed'),
          });
        }
        return newMap;
      });
    } catch (err) {
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            isConnected: false,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Connection test failed',
          });
        }
        return newMap;
      });
    }
  }, [getApiClient]);

  // Fetch node state
  const fetchNodeState = useCallback(async (nodeId: string) => {
    const nodeData = nodes.get(nodeId);
    if (!nodeData || !nodeData.isConnected) return;

    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(nodeId);
      if (node) {
        newMap.set(nodeId, { ...node, isLoading: true, error: null });
      }
      return newMap;
    });

    try {
      const apiClient = apiClients.get(nodeId)!;
      const response = await apiClient.getNodeState();
      
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            state: response.success && response.data ? response.data : node.state,
            isLoading: false,
            error: response.success ? null : (response.error || 'Failed to fetch node state'),
          });
        }
        return newMap;
      });
    } catch (err) {
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch node state',
          });
        }
        return newMap;
      });
    }
  }, [nodes, apiClients]);

  // Send command to a specific node
  const sendCommand = useCallback(async (nodeId: string, command: ClientInput) => {
    const nodeData = nodes.get(nodeId);
    if (!nodeData || !nodeData.isConnected) {
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, { ...node, error: 'Not connected to Hydra node' });
        }
        return newMap;
      });
      return;
    }

    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(nodeId);
      if (node) {
        newMap.set(nodeId, { ...node, isLoading: true, error: null });
      }
      return newMap;
    });

    try {
      const apiClient = apiClients.get(nodeId)!;
      const response = await apiClient.sendCommand(command);
      
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            isLoading: false,
            error: response.success ? null : (response.error || 'Command failed'),
          });
        }
        return newMap;
      });

      if (response.success) {
        await fetchNodeState(nodeId);
      }
    } catch (err) {
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Command failed',
          });
        }
        return newMap;
      });
    }
  }, [nodes, apiClients, fetchNodeState]);

  // Set error for a specific node
  const setError = useCallback((nodeId: string, error: string | null) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(nodeId);
      if (node) {
        newMap.set(nodeId, { ...node, error });
      }
      return newMap;
    });
  }, []);

  // Auto-refresh connected nodes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      nodes.forEach((nodeData, nodeId) => {
        if (nodeData.isConnected) {
          fetchNodeState(nodeId);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [nodes, fetchNodeState]);

  // Initialize with a default node
  useEffect(() => {
    const defaultNodeId = `node-${Date.now()}`;
    addNode({
      id: defaultNodeId,
      url: 'http://localhost:4001',
      timeout: 5000,
    });
  }, [addNode]);

  return {
    nodes: Array.from(nodes.values()),
    addNode,
    removeNode,
    updateNodeUrl,
    updateNodeBos,
    testConnection,
    fetchNodeState,
    sendCommand,
    setError,
  };
};

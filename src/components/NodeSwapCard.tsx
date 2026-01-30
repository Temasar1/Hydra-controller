import React, { useState } from 'react';
import { ClientInput, HydraTransaction, HydraNodeConfig, HydraNodeState } from '../types/hydra';

interface NodeSwapCardProps {
  nodeId: string;
  config: HydraNodeConfig;
  nodeState: HydraNodeState;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  onUrlChange: (nodeId: string, url: string) => void;
  onTestConnection: (nodeId: string) => Promise<void>;
  onSendCommand: (nodeId: string, command: ClientInput) => void;
  onBosChange?: (nodeId: string, bos: string) => void;
}

export const NodeSwapCard: React.FC<NodeSwapCardProps> = ({
  nodeId,
  config,
  nodeState,
  isConnected,
  isLoading,
  error,
  onUrlChange,
  onTestConnection,
  onSendCommand,
  onBosChange,
}) => {
  const [url, setUrl] = useState(config.url);
  const [transactionData, setTransactionData] = useState<Partial<HydraTransaction>>({
    id: '',
    inputs: [],
    outputs: [],
    fee: 0,
  });
  const [recoverTxId, setRecoverTxId] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const handleUrlSave = () => {
    onUrlChange(nodeId, url);
  };

  const handleInit = () => onSendCommand(nodeId, { tag: "Init" });
  const handleAbort = () => onSendCommand(nodeId, { tag: "Abort" });
  const handleClose = () => onSendCommand(nodeId, { tag: "Close" });
  const handleContest = () => onSendCommand(nodeId, { tag: "Contest" });
  const handleFanout = () => onSendCommand(nodeId, { tag: "Fanout" });

  const handleNewTx = () => {
    if (transactionData.id && transactionData.inputs && transactionData.outputs) {
      onSendCommand(nodeId, {
        tag: "NewTx",
        transaction: transactionData as HydraTransaction,
      });
      setShowTransactionForm(false);
      setTransactionData({ id: '', inputs: [], outputs: [], fee: 0 });
    }
  };

  const handleRecover = () => {
    if (recoverTxId) {
      onSendCommand(nodeId, { tag: "Recover", recoverTxId });
      setRecoverTxId('');
    }
  };

  const handleDecommit = () => {
    if (transactionData.id && transactionData.inputs && transactionData.outputs) {
      onSendCommand(nodeId, {
        tag: "Decommit",
        transaction: transactionData as HydraTransaction,
      });
      setShowTransactionForm(false);
      setTransactionData({ id: '', inputs: [], outputs: [], fee: 0 });
    }
  };

  const getNodeStatus = () => {
    if (!isConnected) return { text: 'Disconnected', class: 'status-error' };
    if (!nodeState.isInitialized) return { text: 'Not Initialized', class: 'status-error' };
    if (nodeState.isOpen) return { text: 'Open', class: 'status-success' };
    if (nodeState.isClosed) return { text: 'Closed', class: 'status-warning' };
    return { text: 'Initialized', class: 'status-info' };
  };

  const status = getNodeStatus();

  return (
    <div className="swap-card">
      {/* Card Header */}
      <div className="swap-card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="swap-card-title">
              {config.name || `Node ${nodeId.slice(0, 8)}`}
            </h3>
            {config.bos && (
              <div className="swap-card-bos">
                <span className="text-muted">BOS:</span>
                <span className="font-mono">{config.bos}</span>
              </div>
            )}
          </div>
          <span className={`status ${status.class}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* URL Configuration */}
      <div className="swap-card-section">
        <label className="swap-label">Node URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            className="swap-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:4001"
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleUrlSave}
            disabled={isLoading || !url}
          >
            Connect
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="swap-card-error">
          <span className="text-error">{error}</span>
        </div>
      )}

      {/* Node Stats */}
      {isConnected && (
        <div className="swap-card-stats">
          <div className="swap-stat">
            <div className="swap-stat-value">{nodeState.utxo.length}</div>
            <div className="swap-stat-label">UTXOs</div>
          </div>
          <div className="swap-stat">
            <div className="swap-stat-value">{nodeState.parties.length}</div>
            <div className="swap-stat-label">Parties</div>
          </div>
          <div className="swap-stat">
            <div className="swap-stat-value">{nodeState.snapshotNumber}</div>
            <div className="swap-stat-label">Snapshot</div>
          </div>
          {nodeState.headId && (
            <div className="swap-stat">
              <div className="swap-stat-value font-mono text-xs">
                {nodeState.headId.slice(0, 8)}...
              </div>
              <div className="swap-stat-label">Head ID</div>
            </div>
          )}
        </div>
      )}

      {/* Client Input Section */}
      {isConnected && (
        <div className="swap-card-section">
          <label className="swap-label">Client Commands</label>
          
          {/* Quick Actions */}
          <div className="swap-actions-grid">
            <button
              className="swap-action-btn"
              onClick={handleInit}
              disabled={isLoading || nodeState.isInitialized}
            >
              Init
            </button>
            <button
              className="swap-action-btn"
              onClick={handleAbort}
              disabled={isLoading || !nodeState.isInitialized}
            >
              Abort
            </button>
            <button
              className="swap-action-btn"
              onClick={handleClose}
              disabled={isLoading || !nodeState.isOpen}
            >
              Close
            </button>
            <button
              className="swap-action-btn"
              onClick={handleContest}
              disabled={isLoading || !nodeState.isClosed}
            >
              Contest
            </button>
            <button
              className="swap-action-btn"
              onClick={handleFanout}
              disabled={isLoading || !nodeState.isClosed}
            >
              Fanout
            </button>
            <button
              className="swap-action-btn"
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              disabled={isLoading}
            >
              {showTransactionForm ? 'Hide Tx' : 'New Tx'}
            </button>
          </div>

          {/* Transaction Form */}
          {showTransactionForm && (
            <div className="swap-transaction-form">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  className="swap-input"
                  value={transactionData.id || ''}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Transaction ID"
                />
                <input
                  type="number"
                  className="swap-input"
                  value={transactionData.fee || 0}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, fee: parseInt(e.target.value) || 0 }))}
                  placeholder="Fee (Lovelace)"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleNewTx}
                  disabled={isLoading || !transactionData.id}
                >
                  Submit Tx
                </button>
                <button
                  className="btn btn-warning btn-sm flex-1"
                  onClick={handleDecommit}
                  disabled={isLoading || !transactionData.id}
                >
                  Decommit
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="swap-input flex-1"
                  value={recoverTxId}
                  onChange={(e) => setRecoverTxId(e.target.value)}
                  placeholder="Recover Transaction ID"
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleRecover}
                  disabled={isLoading || !recoverTxId}
                >
                  Recover
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


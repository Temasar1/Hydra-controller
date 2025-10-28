import React, { useState } from 'react';
import { ClientInput, HydraTransaction, HydraNodeState } from '../types/hydra';

interface HydraControllerProps {
  onSendCommand: (command: ClientInput) => void;
  nodeState: HydraNodeState;
  isLoading: boolean;
}

export const HydraController: React.FC<HydraControllerProps> = ({
  onSendCommand,
  nodeState,
  isLoading
}) => {
  const [transactionData, setTransactionData] = useState<Partial<HydraTransaction>>({
    id: '',
    inputs: [],
    outputs: [],
    fee: 0
  });
  const [recoverTxId, setRecoverTxId] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const handleInit = () => onSendCommand({ tag: "Init" });
  const handleAbort = () => onSendCommand({ tag: "Abort" });
  const handleClose = () => onSendCommand({ tag: "Close" });
  const handleContest = () => onSendCommand({ tag: "Contest" });
  const handleFanout = () => onSendCommand({ tag: "Fanout" });

  const handleNewTx = () => {
    if (transactionData.id && transactionData.inputs && transactionData.outputs) {
      onSendCommand({
        tag: "NewTx",
        transaction: transactionData as HydraTransaction
      });
      setShowTransactionForm(false);
      setTransactionData({ id: '', inputs: [], outputs: [], fee: 0 });
    }
  };

  const handleRecover = () => {
    if (recoverTxId) {
      onSendCommand({ tag: "Recover", recoverTxId });
      setRecoverTxId('');
    }
  };

  const handleDecommit = () => {
    if (transactionData.id && transactionData.inputs && transactionData.outputs) {
      onSendCommand({
        tag: "Decommit",
        transaction: transactionData as HydraTransaction
      });
      setShowTransactionForm(false);
      setTransactionData({ id: '', inputs: [], outputs: [], fee: 0 });
    }
  };

  const getNodeStatus = () => {
    if (!nodeState.isInitialized) return { text: 'Not Initialized', class: 'status-error' };
    if (nodeState.isOpen) return { text: 'Open', class: 'status-success' };
    if (nodeState.isClosed) return { text: 'Closed', class: 'status-warning' };
    return { text: 'Initialized', class: 'status-info' };
  };

  const status = getNodeStatus();

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-3">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <h1>Mesh Hydra Controller</h1>
            <p>Manage your Mesh Hydra head operations</p>
          </div>
          
          {/* Node Status */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-muted">Status:</span>
            <span className={`status ${status.class}`}>
              {status.text}
            </span>
            {nodeState.headId && (
              <span className="text-muted font-mono text-sm">
                Head ID: {nodeState.headId.slice(0, 8)}...
              </span>
            )}
          </div>

          {/* UTXO Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{nodeState.utxo.length}</div>
              <div className="text-sm text-muted">UTXOs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{nodeState.parties.length}</div>
              <div className="text-sm text-muted">Parties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{nodeState.snapshotNumber}</div>
              <div className="text-sm text-muted">Snapshot</div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="card">
          <div className="card-header">
            <h3>Head Operations</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              className="btn btn-primary"
              onClick={handleInit}
              disabled={isLoading || nodeState.isInitialized}
            >
              Initialize Head
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={handleAbort}
              disabled={isLoading || !nodeState.isInitialized}
            >
              Abort Head
            </button>
            
            <button
              className="btn btn-success"
              onClick={handleClose}
              disabled={isLoading || !nodeState.isOpen}
            >
              Close Head
            </button>
            
            <button
              className="btn btn-warning"
              onClick={handleContest}
              disabled={isLoading || !nodeState.isClosed}
            >
              Contest Close
            </button>
            
            <button
              className="btn btn-primary"
              onClick={handleFanout}
              disabled={isLoading || !nodeState.isClosed}
            >
              Fanout
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              disabled={isLoading}
            >
              {showTransactionForm ? 'Hide' : 'Show'} Transaction Form
            </button>
          </div>
        </div>

        {/* Transaction Form */}
        {showTransactionForm && (
          <div className="card">
            <div className="card-header">
              <h3>Transaction Operations</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={transactionData.id || ''}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Enter transaction ID"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Fee (Lovelace)</label>
                <input
                  type="number"
                  className="form-input"
                  value={transactionData.fee || 0}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, fee: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter fee"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                className="btn btn-primary"
                onClick={handleNewTx}
                disabled={isLoading || !transactionData.id}
              >
                Submit New Transaction
              </button>
              
              <button
                className="btn btn-warning"
                onClick={handleDecommit}
                disabled={isLoading || !transactionData.id}
              >
                Decommit Transaction
              </button>
            </div>

            {/* Recovery Section */}
            <div className="border-t pt-3">
              <h4 className="mb-2">Transaction Recovery</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={recoverTxId}
                  onChange={(e) => setRecoverTxId(e.target.value)}
                  placeholder="Enter transaction ID to recover"
                />
                <button
                  className="btn btn-secondary"
                  onClick={handleRecover}
                  disabled={isLoading || !recoverTxId}
                >
                  Recover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UTXO List */}
        {nodeState.utxo.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>Current UTXOs</h3>
            </div>
            <div className="space-y-2">
              {nodeState.utxo.slice(0, 5).map((utxo, index) => (
                <div key={index} className="p-2 border rounded font-mono text-sm" style={{backgroundColor: 'var(--bg-secondary)'}}>
                  <div className="flex justify-between">
                    <span>ID: {utxo.id.slice(0, 16)}...</span>
                    <span className="text-muted">{utxo.outputs.length} outputs</span>
                  </div>
                </div>
              ))}
              {nodeState.utxo.length > 5 && (
                <div className="text-center text-muted">
                  ... and {nodeState.utxo.length - 5} more UTXOs
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

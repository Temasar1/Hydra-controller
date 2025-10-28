import React from 'react';
import { HydraNodeState } from '../types/hydra';

interface NodeStatusProps {
  nodeState: HydraNodeState;
}

export const NodeStatus: React.FC<NodeStatusProps> = ({ nodeState }) => {
  const getStatusColor = () => {
    if (!nodeState.isInitialized) return 'status-error';
    if (nodeState.isOpen) return 'status-success';
    if (nodeState.isClosed) return 'status-warning';
    return 'status-info';
  };

  const getStatusText = () => {
    if (!nodeState.isInitialized) return 'Not Initialized';
    if (nodeState.isOpen) return 'Head Open';
    if (nodeState.isClosed) return 'Head Closed';
    return 'Initialized';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Node Status</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Status */}
        <div className="text-center">
          <div className={`status ${getStatusColor()} mb-2`}>
            {getStatusText()}
          </div>
          <div className="text-sm text-muted">Current State</div>
        </div>

        {/* Head ID */}
        <div className="text-center">
          <div className="font-mono text-sm mb-2">
            {nodeState.headId ? `${nodeState.headId.slice(0, 8)}...` : 'N/A'}
          </div>
          <div className="text-sm text-muted">Head ID</div>
        </div>

        {/* Parties */}
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{nodeState.parties.length}</div>
          <div className="text-sm text-muted">Parties</div>
        </div>

        {/* UTXOs */}
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{nodeState.utxo.length}</div>
          <div className="text-sm text-muted">UTXOs</div>
        </div>

        {/* Snapshot Number */}
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">{nodeState.snapshotNumber}</div>
          <div className="text-sm text-muted">Snapshot</div>
        </div>

        {/* Contestation Deadline */}
        {nodeState.contestationDeadline && (
          <div className="text-center">
            <div className="font-mono text-sm mb-2">
              {new Date(nodeState.contestationDeadline).toLocaleTimeString()}
            </div>
            <div className="text-sm text-muted">Contestation Deadline</div>
          </div>
        )}
      </div>

      {/* Parties List */}
      {nodeState.parties.length > 0 && (
        <div className="mt-3">
          <h5 className="mb-2">Parties</h5>
          <div className="space-y-1">
            {nodeState.parties.map((party, index) => (
              <div key={index} className="font-mono text-sm p-2 rounded" style={{backgroundColor: 'var(--bg-secondary)'}}>
                {party.slice(0, 20)}...
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import Head from 'next/head';
import { ThemeToggle } from '../components/ThemeToggle';
import { NodeSwapCard } from '../components/NodeSwapCard';
import { useHydraController } from '../hooks/useHydraController';

export default function Home() {
  const {
    nodes,
    addNode,
    removeNode,
    updateNodeUrl,
    updateNodeBos,
    testConnection,
    sendCommand,
    setError,
  } = useHydraController();

  const handleAddNode = () => {
    const newNodeId = `node-${Date.now()}`;
    addNode({
      id: newNodeId,
      url: 'http://localhost:4001',
      timeout: 5000,
    });
  };

  return (
    <>
      <Head>
        <title>Hydra Controller - DEX Style</title>
        <meta name="description" content="A DEX-style interface for managing multiple Mesh Hydra nodes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="swap-container">
        <div className="swap-wrapper">
          {/* Header */}
          <div className="swap-header">
            <div className="swap-header-content">
              <h1 className="swap-title">Hydra Controller</h1>
              <p className="swap-subtitle">Manage multiple Hydra nodes with a clean DEX-style interface</p>
            </div>
            <div className="swap-header-actions">
              <ThemeToggle />
            </div>
          </div>

          <div className="swap-nodes-grid">
            {nodes.map((nodeData) => (
              <NodeSwapCard
                key={nodeData.config.id}
                nodeId={nodeData.config.id}
                config={nodeData.config}
                nodeState={nodeData.state}
                isConnected={nodeData.isConnected}
                isLoading={nodeData.isLoading}
                error={nodeData.error}
                onUrlChange={updateNodeUrl}
                onTestConnection={testConnection}
                onSendCommand={sendCommand}
                onBosChange={updateNodeBos}
              />
            ))}
          </div>

          {/* Add Node Button */}
          <div className="swap-add-node">
            <button
              className="swap-add-btn"
              onClick={handleAddNode}
            >
              + Add New Node
            </button>
          </div>

          {/* Footer */}
          <footer className="swap-footer">
            <p className="text-muted">
          
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

import React from 'react';
import Head from 'next/head';
import { HydraController } from '../components/HydraController';
import { ApiConfig } from '../components/ApiConfig';
import { NodeStatus } from '../components/NodeStatus';
import { ThemeToggle } from '../components/ThemeToggle';
import { useHydraController } from '../hooks/useHydraController';

export default function Home() {
  const {
    config,
    nodeState,
    isConnected,
    isLoading,
    error,
    updateConfig,
    testConnection,
    sendCommand,
    setError,
  } = useHydraController();

  return (
    <>
      <Head>
        <title>Mesh Hydra Controller</title>
        <meta name="description" content="A clean UI for managing Mesh Hydra head operations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        <div className="container py-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-between items-center mb-2">
              <div></div>
              <h1>Mesh Hydra Controller</h1>
              <ThemeToggle />
            </div>
            <p className="text-muted">
              A clean and simple interface for managing Mesh Hydra head operations
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="card mb-3">
              <div className="flex items-center gap-2">
                <span className="status status-error">Error</span>
                <span>{error}</span>
                <button
                  className="btn btn-secondary ml-auto"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* API Configuration */}
          <div className="mb-4">
            <ApiConfig
              config={config}
              onConfigChange={updateConfig}
              onTestConnection={testConnection}
              isConnected={isConnected}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          {isConnected ? (
            <div className="grid grid-cols-1 gap-4">
              {/* Node Status */}
              <NodeStatus nodeState={nodeState} />
              
              {/* Hydra Controller */}
              <HydraController
                onSendCommand={sendCommand}
                nodeState={nodeState}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="card text-center">
              <h3>Connect to Mesh Hydra Node</h3>
              <p className="text-muted mb-3">
                Configure the API connection above to start managing your Mesh Hydra head.
              </p>
              <button
                className="btn btn-primary"
                onClick={testConnection}
                disabled={isLoading}
              >
                Test Connection
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center mt-4 text-muted">
            <p>
              Built with Next.js and inspired by{' '}
              <a href="https://simplecss.org/" target="_blank" rel="noopener noreferrer">
                Simple.css
              </a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ClientInput } from "@/types/hydra";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Label } from "@/components/label";
import { ScrollArea } from "@/components/scroll-area";

export default function Home() {
  const [nodeCount, setNodeCount] = useState(2);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectedNodes, setConnectedNodes] = useState(0);

  const handleNodeAction = (nodeId: number, action: ClientInput) => {
    const logMessage = `[Node ${nodeId}] ${action.tag}${
      "transaction" in action
        ? ` tx:${action.transaction.substring(0, 16)}...`
        : "recoverTxId" in action
        ? ` txId:${action.recoverTxId}`
        : "snapshot" in action
        ? ` snapshot loaded`
        : ""
    }`;
    setLogs((prev) => [logMessage, ...prev].slice(0, 50));
  };

  const handleBroadcastAction = (action: string) => {
    toast.info(`Broadcasting ${action} to all nodes`);
    setLogs((prev) => [`[Broadcast] ${action} sent to all nodes`, ...prev].slice(0, 50));
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success("Terminal cleared");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar nodeCount={nodeCount} onNodeCountChange={setNodeCount} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header connectedNodes={connectedNodes} totalNodes={nodeCount} />
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-4 pl-6 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
                {Array.from({ length: nodeCount }, (_, i) => (
                  <NodeCard
                    key={i + 1}
                    nodeId={i + 1}
                    onAction={handleNodeAction}
                  />
                ))}
              </div>
            </div>
            <ControlPanel onBroadcastAction={handleBroadcastAction} />
          </div>
        </div>
      </div>
      <Terminal logs={logs} onClear={clearLogs} />
    </div>
  );
}

interface HeaderProps {
  connectedNodes: number;
  totalNodes: number;
}

function Header({ connectedNodes, totalNodes }: HeaderProps) {
  return (
    <header className="header-slant h-14 bg-card border-b border-border flex items-center justify-between px-8 ml-[-1px]">
      <div className="flex items-center gap-3 pl-4">
        <h1 className="text-lg font-bold text-foreground">Hydra Controller</h1>
        <Badge variant="outline" className="font-mono text-xs">
          v0.1.0
        </Badge>
      </div>
      <div className="flex items-center gap-4 pr-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Connected:</span>
          <span className="font-mono text-foreground">
            {connectedNodes}/{totalNodes}
          </span>
        </div>
        <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
      </div>
    </header>
  );
}

interface SidebarProps {
  nodeCount: number;
  onNodeCountChange: (count: number) => void;
}

function Sidebar({ nodeCount, onNodeCountChange }: SidebarProps) {
  const navLabels = ["Nodes", "Activity", "State", "Settings"];

  return (
    <aside className="w-16 bg-sidebar-dark border-r border-border flex flex-col items-center py-4 gap-2 sidebar-slant">
      <div className="p-2 rounded-lg bg-muted border border-border mb-4 text-center text-xs font-semibold text-foreground">
        HC
      </div>
      {navLabels.map((label, i) => (
        <button
          key={i}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xs transition-all",
            i === 0
              ? "bg-muted text-foreground border border-border"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          title={label}
        >
          {label.slice(0, 1)}
        </button>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1 pb-8">
        <span className="text-xs text-muted-foreground">Nodes</span>
        <div className="flex flex-col gap-1">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => onNodeCountChange(count)}
              className={cn(
                "w-8 h-6 rounded text-xs font-mono transition-all",
                nodeCount === count
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface ControlPanelProps {
  onBroadcastAction: (action: string) => void;
}

function ControlPanel({ onBroadcastAction }: ControlPanelProps) {
  const actions = [
    { tag: "Init", variant: "default" as const },
    { tag: "Abort", variant: "destructive" as const },
    { tag: "Close", variant: "secondary" as const },
    { tag: "Contest", variant: "secondary" as const },
    { tag: "Fanout", variant: "secondary" as const },
  ];

  return (
    <aside className="w-48 bg-card border-l border-border p-4 flex flex-col gap-3 panel-slant-right pl-6 pr-5">
      <h3 className="text-sm font-semibold text-foreground mb-2 pl-2">Broadcast</h3>
      <p className="text-xs text-muted-foreground mb-2 pl-2">
        Send to all connected nodes
      </p>
      {actions.map((action) => (
        <Button
          key={action.tag}
          onClick={() => onBroadcastAction(action.tag)}
          variant={action.variant}
          size="sm"
          className="w-full justify-start"
        >
          {action.tag}
        </Button>
      ))}
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          onClick={() => onBroadcastAction("Reconnect")}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Reconnect All
        </Button>
      </div>
    </aside>
  );
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface NodeCardProps {
  nodeId: number;
  onAction: (nodeId: number, action: ClientInput) => void;
}

function NodeCard({ nodeId, onAction }: NodeCardProps) {
  const [transaction, setTransaction] = useState("");
  const [recoverTxId, setRecoverTxId] = useState("");
  const [decommitTx, setDecommitTx] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wsUrl, setWsUrl] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [balance, setBalance] = useState<string>("0");
  const [transactionCount, setTransactionCount] = useState(0);
  const [utxoCount, setUtxoCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (!wsUrl) {
      toast.error("Please enter a WebSocket URL");
      return;
    }
    try {
      setConnectionStatus("connecting");
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setConnectionStatus("connected");
        toast.success(`Node ${nodeId} connected`);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.balance !== "undefined") setBalance(String(data.balance));
          if (typeof data.transactionCount === "number") setTransactionCount(data.transactionCount);
          if (typeof data.txCount === "number") setTransactionCount(data.txCount);
          if (typeof data.utxoCount === "number") setUtxoCount(data.utxoCount);
          if (Array.isArray(data.utxos)) setUtxoCount(data.utxos.length);
          toast.info(`Node ${nodeId}: ${data.tag || "Message received"}`);
        } catch (e) {
          console.log(`Node ${nodeId} raw message:`, event.data);
        }
      };
      ws.onerror = () => {
        setConnectionStatus("error");
        toast.error(`Node ${nodeId} connection error`);
      };
      ws.onclose = () => {
        setConnectionStatus("disconnected");
      };
      wsRef.current = ws;
    } catch (error) {
      setConnectionStatus("error");
      toast.error(`Failed to connect Node ${nodeId}`);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnectionStatus("disconnected");
    }
  };

  const sendAction = (action: ClientInput, actionName: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action));
      if (action.tag === "NewTx") setTransactionCount((n) => n + 1);
      toast.success(`${actionName} sent`);
    } else {
      toast.error(`Node ${nodeId} not connected`);
    }
    onAction(nodeId, action);
  };

  const getStatusDotColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-foreground";
      case "connecting":
        return "bg-muted-foreground animate-pulse";
      case "error":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground/50";
    }
  };

  return (
    <div className="node-card bg-card border border-border flex flex-col h-full pl-5 pr-5">
      <div className="node-card-header h-10 bg-secondary/50 border-b border-border flex items-center justify-between px-6 -mx-5 mb-0">
        <span className="font-semibold text-sm pl-3">Node {nodeId}</span>
        <div className="flex items-center gap-2 pr-3">
          <span className={cn("w-2 h-2 rounded-full shrink-0", getStatusDotColor())} />
          <span className="text-xs text-muted-foreground capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 px-6 -mx-5 py-2 bg-secondary/30 border-b border-border/50 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Balance</span>
          <span className="font-mono text-foreground tabular-nums">{balance}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Tx</span>
          <span className="font-mono text-foreground tabular-nums">{transactionCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">UTXOs</span>
          <span className="font-mono text-foreground tabular-nums">{utxoCount}</span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">WebSocket URL</Label>
          <div className="flex gap-2">
            <Input
              placeholder="ws://localhost:4001"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              disabled={connectionStatus === "connected"}
              className="h-8 text-xs font-mono"
            />
            {connectionStatus === "connected" ? (
              <Button onClick={disconnectWebSocket} variant="destructive" size="sm" className="h-8 px-2">
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectWebSocket}
                size="sm"
                className="h-8 px-2"
                disabled={!wsUrl || connectionStatus === "connecting"}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Button onClick={() => sendAction({ tag: "Init" }, "Init")} size="sm" className="h-7 text-xs">
            Init
          </Button>
          <Button onClick={() => sendAction({ tag: "Abort" }, "Abort")} variant="destructive" size="sm" className="h-7 text-xs">
            Abort
          </Button>
          <Button onClick={() => sendAction({ tag: "Close" }, "Close")} variant="secondary" size="sm" className="h-7 text-xs">
            Close
          </Button>
          <Button onClick={() => sendAction({ tag: "Contest" }, "Contest")} variant="secondary" size="sm" className="h-7 text-xs">
            Contest
          </Button>
          <Button onClick={() => sendAction({ tag: "Fanout" }, "Fanout")} variant="secondary" size="sm" className="h-7 text-xs col-span-2">
            Fanout
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">New Transaction</Label>
          <div className="flex gap-1.5">
            <Input
              placeholder="Transaction data"
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              onClick={() => {
                if (transaction) {
                  sendAction({ tag: "NewTx", transaction }, "NewTx");
                  setTransaction("");
                }
              }}
              size="sm"
              className="h-8 px-2"
              disabled={!transaction}
            >
              Send
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Recover</Label>
          <div className="flex gap-1.5">
            <Input
              placeholder="Transaction hash"
              value={recoverTxId}
              onChange={(e) => setRecoverTxId(e.target.value)}
              className="h-8 text-xs font-mono"
            />
            <Button
              onClick={() => {
                if (recoverTxId) {
                  sendAction({ tag: "Recover", recoverTxId }, "Recover");
                  setRecoverTxId("");
                }
              }}
              variant="secondary"
              size="sm"
              className="h-8 px-2"
              disabled={!recoverTxId}
            >
              Recover
            </Button>
          </div>
        </div>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground hover:bg-foreground hover:text-background"
        >
          {showAdvanced ? "▲" : "▼"} Advanced
        </Button>
        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Decommit</Label>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Decommit transaction"
                  value={decommitTx}
                  onChange={(e) => setDecommitTx(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  onClick={() => {
                    if (decommitTx) {
                      sendAction({ tag: "Decommit", transaction: decommitTx }, "Decommit");
                      setDecommitTx("");
                    }
                  }}
                  variant="secondary"
                  size="sm"
                  className="h-8 px-2"
                  disabled={!decommitTx}
                >
                  Decommit
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">SideLoad Snapshot</Label>
              <Textarea
                placeholder="Snapshot JSON"
                value={snapshot}
                onChange={(e) => setSnapshot(e.target.value)}
                className="min-h-[60px] text-xs font-mono"
              />
              <Button
                onClick={() => {
                  if (snapshot) {
                    sendAction({ tag: "SideLoadSnapshot", snapshot }, "SideLoadSnapshot");
                    setSnapshot("");
                  }
                }}
                variant="secondary"
                size="sm"
                className="w-full h-7 text-xs"
                disabled={!snapshot}
              >
                Load Snapshot
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TerminalProps {
  logs: string[];
  onClear: () => void;
}

function Terminal({ logs, onClear }: TerminalProps) {
  return (
    <div className="h-40 bg-terminal border-t border-border flex flex-col terminal-slant">
      <div className="h-8 border-b border-border/50 flex items-center justify-between px-6 bg-card/50">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-medium text-foreground">Terminal</span>
          <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
        </div>
        <Button onClick={onClear} variant="ghost" size="sm" className="h-6 px-2 text-xs">
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2 px-4">
        <div className="space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center">
              No activity yet. Connect to a node to begin.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-terminal-text px-2 py-0.5 hover:bg-secondary/30 rounded">
                <span className="text-muted-foreground mr-2">{new Date().toLocaleTimeString()}</span>
                {log}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

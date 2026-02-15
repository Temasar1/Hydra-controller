"use client";

import { useEffect, useRef, useState } from "react";
import { ClientInput } from "@/types/hydra";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface NodeCardProps {
  nodeId: number;
  onAction: (nodeId: number, action: ClientInput) => void;
}

export default function NodeCard({ nodeId, onAction }: NodeCardProps) {
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
          if (typeof data.transactionCount === "number")
            setTransactionCount(data.transactionCount);
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
          <span
            className={cn("w-2 h-2 rounded-full shrink-0", getStatusDotColor())}
          />
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
          <span className="font-mono text-foreground tabular-nums">
            {transactionCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">UTXOs</span>
          <span className="font-mono text-foreground tabular-nums">
            {utxoCount}
          </span>
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
              <Button
                onClick={disconnectWebSocket}
                variant="destructive"
                size="sm"
                className="h-8 px-2"
              >
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
          <Button
            onClick={() => sendAction({ tag: "Init" }, "Init")}
            size="sm"
            className="h-7 text-xs"
          >
            Init
          </Button>
          <Button
            onClick={() => sendAction({ tag: "Abort" }, "Abort")}
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
          >
            Abort
          </Button>
          <Button
            onClick={() => sendAction({ tag: "Close" }, "Close")}
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
          >
            Close
          </Button>
          <Button
            onClick={() => sendAction({ tag: "Contest" }, "Contest")}
            variant="secondary"
            size="sm"
            className="h-7 text-xs"
          >
            Contest
          </Button>
          <Button
            onClick={() => sendAction({ tag: "Fanout" }, "Fanout")}
            variant="secondary"
            size="sm"
            className="h-7 text-xs col-span-2"
          >
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
                      sendAction(
                        { tag: "Decommit", transaction: decommitTx },
                        "Decommit"
                      );
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
              <Label className="text-xs text-muted-foreground">
                SideLoad Snapshot
              </Label>
              <Textarea
                placeholder="Snapshot JSON"
                value={snapshot}
                onChange={(e) => setSnapshot(e.target.value)}
                className="min-h-[60px] text-xs font-mono"
              />
              <Button
                onClick={() => {
                  if (snapshot) {
                    sendAction(
                      { tag: "SideLoadSnapshot", snapshot },
                      "SideLoadSnapshot"
                    );
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

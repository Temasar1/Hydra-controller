"use client";

import { useEffect, useRef, useState } from "react";
import { ClientInput } from "@/types/hydra";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ControlPanel from "@/components/control-panel";
import NodeCard from "@/components/node-card";
import { Terminal } from "@/components/terminal";

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [nodeCount, setNodeCount] = useState(2);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectedNodes, setConnectedNodes] = useState(0);
  const [broadcastOpen, setBroadcastOpen] = useState(true);
  const hasInitializedMobile = useRef(false);

  useEffect(() => {
    if (isMobile && !hasInitializedMobile.current) {
      hasInitializedMobile.current = true;
      setBroadcastOpen(false);
    }
  }, [isMobile]);

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
          <div className="flex-1 flex min-h-0 relative">
            <div className="flex-1 p-4 pl-6 overflow-auto min-w-0">
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
            <ControlPanel
              isOpen={broadcastOpen}
              onOpen={() => setBroadcastOpen(true)}
              onClose={() => setBroadcastOpen(false)}
              onBroadcastAction={handleBroadcastAction}
            />
          </div>
        </div>
      </div>
      <Terminal logs={logs} onClear={clearLogs} />
    </div>
  );
}

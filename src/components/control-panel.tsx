"use client";

import { Button } from "./button";

interface ControlPanelProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onBroadcastAction: (action: string) => void;
}

export default function ControlPanel({
  isOpen,
  onOpen,
  onClose,
  onBroadcastAction,
}: ControlPanelProps) {
  const actions = [
    { tag: "Init", variant: "default" as const },
    { tag: "Abort", variant: "destructive" as const },
    { tag: "Close", variant: "secondary" as const },
    { tag: "Contest", variant: "secondary" as const },
    { tag: "Fanout", variant: "secondary" as const },
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-10 shrink-0 bg-card border-l border-border flex flex-col items-center justify-center gap-1 py-4 hover:bg-foreground hover:text-background transition-colors"
        aria-label="Open Broadcast panel"
      >
        <span
          className="text-xs font-medium text-muted-foreground"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Broadcast
        </span>
      </button>
    );
  }

  return (
    <aside className="w-48 shrink-0 bg-card border-l border-border p-4 flex flex-col gap-3 panel-slant-right pl-6 pr-5">
      <div className="flex items-center justify-between gap-2 mb-1 pl-2 -mr-1">
        <h3 className="text-sm font-semibold text-foreground">Broadcast</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Broadcast panel"
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-foreground hover:text-background font-medium text-lg leading-none"
        >
          ×
        </button>
      </div>
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

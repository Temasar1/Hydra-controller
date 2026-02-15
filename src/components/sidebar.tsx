"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  nodeCount: number;
  onNodeCountChange: (count: number) => void;
}

export default function Sidebar({ nodeCount, onNodeCountChange }: SidebarProps) {
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
              : "text-muted-foreground hover:bg-foreground hover:text-background"
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
                  : "bg-secondary text-muted-foreground hover:bg-foreground hover:text-background"
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

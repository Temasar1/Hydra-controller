import { Badge } from "./badge";

interface HeaderProps {
  connectedNodes: number;
  totalNodes: number;
}

export default function Header({ connectedNodes, totalNodes }: HeaderProps) {
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
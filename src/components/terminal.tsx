import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "./button";

interface TerminalProps {
    logs: string[];
    onClear: () => void;
  }
  
 export function Terminal({ logs, onClear }: TerminalProps) {
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
                <div key={i} className="text-terminal-text px-2 py-0.5 hover:bg-foreground hover:text-background rounded">
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
  
import { useState, useEffect } from "react";
import { Bug, ChevronDown, ChevronUp, Copy, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getDebugLog, clearDebugLog, ApiDebugEntry } from "@/hooks/useApiDebug";
import { toast } from "sonner";

function DebugEntryCard({ entry }: { entry: ApiDebugEntry }) {
  const [open, setOpen] = useState(false);

  const copyToClipboard = () => {
    const text = `
=== API Debug Entry ===
Timestamp: ${entry.timestamp.toISOString()}
Path: ${entry.path}
Method: ${entry.method}
Success: ${entry.success}

--- Primary ---
URL: ${entry.primary.url}
Status: ${entry.primary.status ?? "N/A"} ${entry.primary.statusText ?? ""}
Error: ${entry.primary.error ?? "None"}
Body: ${entry.primary.body ?? "None"}

--- Fallback ---
${entry.fallback ? `URL: ${entry.fallback.url}
Status: ${entry.fallback.status ?? "N/A"} ${entry.fallback.statusText ?? ""}
Error: ${entry.fallback.error ?? "None"}
Body: ${entry.fallback.body ?? "None"}` : "Not attempted"}
`.trim();
    navigator.clipboard.writeText(text);
    toast.success("Debug info copied to clipboard");
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg bg-card">
      <CollapsibleTrigger asChild>
        <button className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Badge variant={entry.success ? "default" : "destructive"} className="text-xs">
              {entry.method}
            </Badge>
            <span className="text-sm font-mono truncate max-w-[180px]">{entry.path}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {entry.timestamp.toLocaleTimeString()}
            </span>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {/* Primary */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">PRIMARY</span>
            {entry.primary.status && (
              <Badge variant={entry.primary.status < 400 ? "default" : "destructive"} className="text-xs">
                {entry.primary.status}
              </Badge>
            )}
            {entry.primary.error && (
              <Badge variant="destructive" className="text-xs">Error</Badge>
            )}
          </div>
          <p className="text-xs font-mono break-all text-muted-foreground">{entry.primary.url}</p>
          {entry.primary.error && (
            <p className="text-xs text-destructive">{entry.primary.error}</p>
          )}
          {entry.primary.body && (
            <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-24">
              {entry.primary.body.slice(0, 500)}{entry.primary.body.length > 500 ? "..." : ""}
            </pre>
          )}
        </div>

        {/* Fallback */}
        {entry.fallback && (
          <div className="space-y-1 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">FALLBACK</span>
              {entry.fallback.status && (
                <Badge variant={entry.fallback.status < 400 ? "default" : "destructive"} className="text-xs">
                  {entry.fallback.status}
                </Badge>
              )}
              {entry.fallback.error && (
                <Badge variant="destructive" className="text-xs">Error</Badge>
              )}
            </div>
            <p className="text-xs font-mono break-all text-muted-foreground">{entry.fallback.url}</p>
            {entry.fallback.error && (
              <p className="text-xs text-destructive">{entry.fallback.error}</p>
            )}
            {entry.fallback.body && (
              <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-24">
                {entry.fallback.body.slice(0, 500)}{entry.fallback.body.length > 500 ? "..." : ""}
              </pre>
            )}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={copyToClipboard}>
          <Copy className="w-3 h-3 mr-2" />
          Copy Debug Info
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ApiDebugDrawer() {
  const [entries, setEntries] = useState<ApiDebugEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntries([...getDebugLog()]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    clearDebugLog();
    setEntries([]);
    toast.success("Debug log cleared");
  };

  const copyAll = () => {
    const text = entries.map((entry) => `
=== ${entry.method} ${entry.path} ===
Timestamp: ${entry.timestamp.toISOString()}
Success: ${entry.success}

Primary: ${entry.primary.url}
  Status: ${entry.primary.status ?? "N/A"}
  Error: ${entry.primary.error ?? "None"}
  Body: ${entry.primary.body ?? "None"}

Fallback: ${entry.fallback?.url ?? "N/A"}
  Status: ${entry.fallback?.status ?? "N/A"}
  Error: ${entry.fallback?.error ?? "None"}
  Body: ${entry.fallback?.body ?? "None"}
`).join("\n---\n");
    navigator.clipboard.writeText(text);
    toast.success("All debug entries copied");
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-background border-2"
        >
          <Bug className="w-4 h-4 mr-1" />
          <span className="text-xs">Debug</span>
          {entries.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center text-[10px]">
              {entries.length}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            API Debug Log
          </DrawerTitle>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={copyAll}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <ScrollArea className="h-[60vh] px-4 pb-4">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bug className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No API calls recorded yet</p>
              <p className="text-xs mt-1">Perform an action to see debug info</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <DebugEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

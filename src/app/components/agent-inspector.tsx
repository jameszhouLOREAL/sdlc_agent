import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import type { AgentNode } from "../lib/store";
import { Brain, Zap, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

const logTypeConfig = {
  thinking: { icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
  action: { icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  result: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
};

interface Props {
  agent: AgentNode;
}

export function AgentInspector({ agent }: Props) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.logs.length]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-zinc-800">{agent.name}</h3>
          <Badge variant="outline" className="text-[11px] border-zinc-200 text-zinc-500">
            {agent.integration}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Badge>
        </div>
        <p className="text-[13px] text-zinc-500">{agent.description}</p>
      </div>

      <Tabs defaultValue="logs" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 bg-zinc-100 border border-zinc-200">
          <TabsTrigger value="logs" className="text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Live Thinking Logs
          </TabsTrigger>
          <TabsTrigger value="input" className="text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Input Schema
          </TabsTrigger>
          <TabsTrigger value="output" className="text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Output Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="flex-1 min-h-0 px-4 pb-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pt-2">
              {agent.logs.length === 0 && (
                <div className="text-zinc-600 text-[13px] text-center py-8">
                  No logs yet. Start the pipeline to see agent activity.
                </div>
              )}
              {agent.logs.map((log, i) => {
                const cfg = logTypeConfig[log.type];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={cn("flex gap-3 p-2.5 rounded-lg", cfg.bg)}>
                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
                    <div className="min-w-0">
                      <span className="text-zinc-400 text-[11px] mr-2">[{log.timestamp}]</span>
                      <span className={cn("text-[13px]", cfg.color)}>{log.message}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="input" className="flex-1 min-h-0 px-4 pb-4">
          <ScrollArea className="h-[400px]">
            <pre className="text-[12px] text-zinc-600 bg-zinc-50 p-4 rounded-lg border border-zinc-200 mt-2 overflow-x-auto">
              {JSON.stringify(agent.inputSchema, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="output" className="flex-1 min-h-0 px-4 pb-4">
          <ScrollArea className="h-[400px]">
            {agent.outputPreview ? (
              <pre className="text-[12px] text-emerald-700 bg-zinc-50 p-4 rounded-lg border border-zinc-200 mt-2 overflow-x-auto">
                {JSON.stringify(agent.outputPreview, null, 2)}
              </pre>
            ) : (
              <div className="text-zinc-400 text-[13px] text-center py-8">
                No output yet. Agent must complete processing first.
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { PipelineVisualizer } from "./pipeline-visualizer";
import { AgentInspector } from "./agent-inspector";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { useProjectStore } from "../lib/store";
import {
  Play,
  Pause,
  CheckCircle,
  RotateCcw,
  Pencil,
  Zap,
  Eye,
  Activity,
  Clock,
  GitBranch,
} from "lucide-react";

export function DashboardPage() {
  const {
    run,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    startRun,
    approveAndProceed,
    editAndRetry,
    toggleMode,
    pauseRun,
  } = useProjectStore();

  const completedCount = run.agents.filter((a) => a.status === "complete").length;

  return (
    <div className="flex flex-col gap-5 p-6 h-full min-h-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-zinc-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              {run.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(run.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> {run.id}
              </span>
              <Badge
                variant="outline"
                className={
                  run.status === "running"
                    ? "text-[10px] border-blue-200 text-blue-600 bg-blue-50"
                    : run.status === "complete"
                    ? "text-[10px] border-emerald-200 text-emerald-600 bg-emerald-50"
                    : "text-[10px] border-zinc-200 text-zinc-500"
                }
              >
                {run.status.toUpperCase()}
              </Badge>
              <span className="text-[11px] text-zinc-500">
                {completedCount}/{run.agents.length} agents complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] text-zinc-500">Auto</span>
            <Switch
              checked={run.mode === "supervised"}
              onCheckedChange={toggleMode}
            />
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] text-zinc-500">Supervised</span>
          </div>

          {/* Action Buttons */}
          {run.status !== "running" && (
            <button
              onClick={startRun}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-[13px]"
            >
              <Play className="w-4 h-4" />
              {completedCount > 0 ? "Restart" : "Start Pipeline"}
            </button>
          )}

          {run.status === "running" && (
            <button
              onClick={pauseRun}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-[13px]"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="flex-shrink-0 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
        <PipelineVisualizer
          agents={run.agents}
          selectedAgentId={selectedAgentId}
          onSelect={setSelectedAgentId}
        />
      </div>

      {/* Main Content: Inspector + Actions */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-h-0">
          <AgentInspector agent={selectedAgent} />
        </div>

        {/* Right Panel: HITL Controls */}
        <div className="flex flex-col gap-4">
          {/* Approval Panel */}
          {selectedAgent.status === "pending_approval" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500" />
                <span className="text-[13px] text-amber-700">Human Review Required</span>
              </div>
              <p className="text-[12px] text-zinc-500">
                {selectedAgent.name} has completed. Review the output and decide to proceed or retry with edits.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={approveAndProceed}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-[12px]"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve & Proceed
                </button>
                <button
                  onClick={editAndRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg transition-colors text-[12px]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit & Retry
                </button>
              </div>
            </div>
          )}

          {/* Run Summary */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-3">
            <span className="text-[13px] text-zinc-700">Pipeline Progress</span>
            <div className="space-y-2">
              {run.agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">{agent.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      agent.status === "complete"
                        ? "text-[9px] border-emerald-200 text-emerald-600"
                        : agent.status === "processing"
                        ? "text-[9px] border-blue-200 text-blue-600"
                        : agent.status === "pending_approval"
                        ? "text-[9px] border-amber-200 text-amber-600"
                        : "text-[9px] border-zinc-200 text-zinc-400"
                    }
                  >
                    {agent.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* MCP Activity */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm space-y-2">
            <span className="text-[13px] text-zinc-700">MCP Tool Calls</span>
            <div className="space-y-1.5">
              {run.agents
                .flatMap((a) => a.logs.filter((l) => l.type === "action").map((l) => ({ agent: a.name, ...l })))
                .slice(-5)
                .map((log, i) => (
                  <div key={i} className="p-2 rounded-md bg-zinc-50 border border-zinc-200">
                    <div className="text-[10px] text-indigo-600">{log.agent}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{log.message.replace("MCP Call: ", "")}</div>
                  </div>
                ))}
              {run.agents.every((a) => a.logs.length === 0) && (
                <div className="text-[12px] text-zinc-600 text-center py-3">No MCP calls yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
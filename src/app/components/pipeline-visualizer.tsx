import {
  ClipboardList,
  Network,
  Palette,
  Code,
  Container,
  LifeBuoy,
  Check,
  Loader2,
  Clock,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "./ui/utils";
import type { AgentNode, AgentStatus } from "../lib/store";

const ICONS: Record<string, React.ElementType> = {
  ClipboardList,
  Network,
  Palette,
  Code,
  Container,
  LifeBuoy,
};

const statusConfig: Record<AgentStatus, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  idle: { color: "text-zinc-400", bg: "bg-zinc-100", border: "border-zinc-200", icon: Clock, label: "Idle" },
  processing: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", icon: Loader2, label: "Processing" },
  pending_approval: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", icon: AlertCircle, label: "Pending Approval" },
  complete: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", icon: Check, label: "Complete" },
  error: { color: "text-red-600", bg: "bg-red-50", border: "border-red-300", icon: AlertCircle, label: "Error" },
};

interface Props {
  agents: AgentNode[];
  selectedAgentId: string;
  onSelect: (id: string) => void;
}

export function PipelineVisualizer({ agents, selectedAgentId, onSelect }: Props) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-2 min-w-max px-2">
        {agents.map((agent, i) => {
          const Icon = ICONS[agent.icon] || ClipboardList;
          const sc = statusConfig[agent.status];
          const StatusIcon = sc.icon;
          const isSelected = agent.id === selectedAgentId;
          const isLoop = agent.id === "support";

          return (
            <div key={agent.id} className="flex items-center gap-2">
              <button
                onClick={() => onSelect(agent.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[140px] cursor-pointer",
                  sc.bg,
                  sc.border,
                  isSelected && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white"
                )}
              >
                {/* Status badge */}
                <div className={cn("absolute -top-2 -right-2 p-1 rounded-full", sc.bg, "border", sc.border)}>
                  <StatusIcon className={cn("w-3.5 h-3.5", sc.color, agent.status === "processing" && "animate-spin")} />
                </div>

                <div className={cn("p-2.5 rounded-lg", sc.bg)}>
                  <Icon className={cn("w-5 h-5", sc.color)} />
                </div>

                <div className="text-center">
                  <div className="text-zinc-800 text-[13px]">{agent.name}</div>
                  <div className="text-zinc-400 text-[11px]">{agent.integration}</div>
                </div>

                {/* Progress bar */}
                {agent.status === "processing" && (
                  <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                )}

                <div className={cn("text-[10px] px-2 py-0.5 rounded-full", sc.bg, sc.color)}>
                  {sc.label}
                </div>
              </button>

              {/* Arrow connector */}
              {i < agents.length - 1 && (
                <div className="flex items-center">
                  {isLoop && i === agents.length - 1 ? (
                    <RotateCcw className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loop-back arrow from Support to Developer */}
        <div className="flex items-center gap-1 text-zinc-400">
          <RotateCcw className="w-4 h-4" />
          <span className="text-[10px]">Loop</span>
        </div>
      </div>
    </div>
  );
}
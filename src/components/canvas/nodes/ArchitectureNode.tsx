"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  Layout,
  Server,
  Database,
  Shield,
  Route,
  MessageSquare,
  Zap,
  HardDrive,
  Globe,
  Box,
} from "lucide-react";
import type { ArchitectureNodeType } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ArchitectureFlowNode = Node<
  {
    label: string;
    nodeType: ArchitectureNodeType;
    configuration: Record<string, unknown>;
  },
  "architecture"
>;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Server,
  Database,
  Shield,
  Route,
  MessageSquare,
  Zap,
  HardDrive,
  Globe,
  Box,
};

const colorMap: Record<string, string> = {
  frontend: "border-indigo-500 bg-indigo-500/10",
  backend: "border-emerald-500 bg-emerald-500/10",
  database: "border-amber-500 bg-amber-500/10",
  auth: "border-red-500 bg-red-500/10",
  "api-gateway": "border-violet-500 bg-violet-500/10",
  queue: "border-cyan-500 bg-cyan-500/10",
  cache: "border-yellow-500 bg-yellow-500/10",
  storage: "border-teal-500 bg-teal-500/10",
  "external-service": "border-slate-500 bg-slate-500/10",
  container: "border-blue-500 bg-blue-500/10",
};

const iconColorMap: Record<string, string> = {
  frontend: "text-indigo-500",
  backend: "text-emerald-500",
  database: "text-amber-500",
  auth: "text-red-500",
  "api-gateway": "text-violet-500",
  queue: "text-cyan-500",
  cache: "text-yellow-500",
  storage: "text-teal-500",
  "external-service": "text-slate-500",
  container: "text-blue-500",
};

const descriptionMap: Record<string, string> = {
  frontend: "Client Application",
  backend: "API Service",
  database: "Data Store",
  auth: "Authentication",
  "api-gateway": "Entry Point",
  queue: "Message Queue",
  cache: "Cache Layer",
  storage: "File Storage",
  "external-service": "External API",
  container: "Container",
};

function ArchitectureNode({ data }: NodeProps<ArchitectureFlowNode>) {
  const Icon = iconMap[data.nodeType] || Box;
  const borderClass = colorMap[data.nodeType] || "border-zinc-500 bg-zinc-500/10";
  const iconColor = iconColorMap[data.nodeType] || "text-zinc-500";

  return (
    <div
      className={cn(
        "relative min-w-[180px] rounded-xl border-2 backdrop-blur-sm px-4 py-3 shadow-lg transition-shadow hover:shadow-xl cursor-grab active:cursor-grabbing",
        borderClass,
        "bg-white/90 dark:bg-zinc-950/90"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-zinc-400 !bg-white dark:!bg-zinc-900"
      />
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {data.label}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {descriptionMap[data.nodeType] || data.nodeType}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-zinc-400 !bg-white dark:!bg-zinc-900"
      />
    </div>
  );
}

export default memo(ArchitectureNode);

"use client";

import { useCallback } from "react";
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
  GripVertical,
} from "lucide-react";
import { NODE_DEFINITIONS } from "@/lib/node-definitions";
import type { ArchitectureNodeType } from "@/lib/types";
import { cn } from "@/lib/utils";

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

const colorMap: Record<string, { dot: string; bg: string; text: string }> = {
  frontend: { dot: "bg-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400" },
  backend: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  database: { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400" },
  auth: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-600 dark:text-red-400" },
  "api-gateway": { dot: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  queue: { dot: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400" },
  cache: { dot: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/40", text: "text-yellow-600 dark:text-yellow-400" },
  storage: { dot: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400" },
  "external-service": { dot: "bg-slate-500", bg: "bg-slate-50 dark:bg-slate-950/40", text: "text-slate-600 dark:text-slate-400" },
  container: { dot: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
};

export default function NodePalette() {
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: ArchitectureNodeType) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Component Library</h3>
        <p className="text-xs text-zinc-500 mt-1">Drag components onto the canvas</p>
      </div>
      <div className="p-3 space-y-1.5">
        {NODE_DEFINITIONS.map((def) => {
          const Icon = iconMap[def.type] || Box;
          const colors = colorMap[def.type] || { dot: "bg-zinc-500", bg: "bg-zinc-50", text: "text-zinc-600" };
          return (
            <div
              key={def.type}
              draggable
              onDragStart={(e) => onDragStart(e, def.type)}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150",
                "hover:shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700",
                "group select-none",
                colors.bg
              )}
            >
              <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                <Icon className={cn("w-4 h-4", colors.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                  {def.label}
                </div>
                <div className="text-xs text-zinc-500 truncate">{def.description}</div>
              </div>
              <GripVertical className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import type { Node } from "@xyflow/react";
import { X, Trash2, Edit3 } from "lucide-react";
import type { ArchitectureNodeType } from "@/lib/types";
import { getNodeDefinition } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PropertyPanelProps {
  node: Node;
  onUpdate: (updates: Record<string, unknown>) => void;
  onUpdateLabel: (label: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function PropertyPanel({
  node,
  onUpdate,
  onUpdateLabel,
  onDelete,
  onClose,
}: PropertyPanelProps) {
  const def = getNodeDefinition(node.data?.nodeType as string);
  const config = (node.data?.configuration as Record<string, unknown>) || {};
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(node.data?.label as string || "");

  if (!def) return null;

  return (
    <div className="absolute right-4 top-4 w-80 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-10 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              def.type === "frontend" && "bg-indigo-500",
              def.type === "backend" && "bg-emerald-500",
              def.type === "database" && "bg-amber-500",
              def.type === "auth" && "bg-red-500",
              def.type === "api-gateway" && "bg-violet-500",
              def.type === "queue" && "bg-cyan-500",
              def.type === "cache" && "bg-yellow-500",
              def.type === "storage" && "bg-teal-500",
              def.type === "external-service" && "bg-slate-500"
            )}
          />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {def.label}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Name</label>
          {isEditingLabel ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={() => {
                  onUpdateLabel(labelValue);
                  setIsEditingLabel(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateLabel(labelValue);
                    setIsEditingLabel(false);
                  }
                }}
                className="flex-1 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => {
                setLabelValue(node.data?.label as string);
                setIsEditingLabel(true);
              }}
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {node.data?.label as string}
              </span>
              <Edit3 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Configuration fields */}
        {def.configFields.map((field) => {
          const value = (config[field.key] as string) ?? field.defaultValue ?? "";

          if (field.type === "select" && field.options) {
            return (
              <div key={field.key}>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  {field.label}
                </label>
                <Select
                  value={String(value)}
                  onValueChange={(newValue) => onUpdate({ [field.key]: newValue })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field.type === "boolean") {
            return (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-500">{field.label}</label>
                <button
                  onClick={() => onUpdate({ [field.key]: !value })}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    value ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                      value ? "translate-x-4.5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            );
          }

          return (
            <div key={field.key}>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={String(value)}
                  onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px] resize-none"
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={String(value)}
                  onChange={(e) =>
                    onUpdate({
                      [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Trash2, Download, Eye, EyeOff, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import ArchitectureNode from "./nodes/ArchitectureNode";
import { useProjectStore } from "@/lib/store/project-store";
import { getNodeDefinition } from "@/lib/node-definitions";
import NodePalette from "./NodePalette";
import PropertyPanel from "./PropertyPanel";
import CodePreviewPanel from "./CodePreviewPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = {
  architecture: ArchitectureNode,
};

function FlowInner() {
  const reactFlowInstance = useReactFlow();
  const {
    currentProject,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    moveNode,
  } = useProjectStore();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  const flowNodes: Node[] = (currentProject?.nodes || []).map((n) => ({
    id: n.id,
    type: "architecture",
    position: n.position,
    data: {
      label: n.label,
      nodeType: n.type,
      configuration: n.configuration,
    },
  }));

  const flowEdges: Edge[] = (currentProject?.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#64748b", fontSize: 11, fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255,255,255,0.9)", rx: 4 },
    labelBgPadding: [8, 4] as [number, number],
    type: "smoothstep",
    animated: e.type === "event" || e.type === "data-flow",
  }));

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      addEdge({
        source: connection.source,
        target: connection.target,
        type: "api-call",
      });
    },
    [addEdge]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodesChange = useCallback(
    (changes: any[]) => {
      const positionChanges = changes.filter(
        (c: any) => c.type === "position" && c.position
      );
      for (const change of positionChanges) {
        moveNode(change.id, change.position);
      }
    },
    [moveNode]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const def = getNodeDefinition(type);
      if (!def) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode({
        type: def.type,
        label: def.label,
        configuration: { ...def.defaultConfig },
        position,
      });
    },
    [reactFlowInstance, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedNode) {
      removeNode(selectedNode.id);
      setSelectedNode(null);
    }
  }, [selectedNode, removeNode]);

  const handleUpdateNode = useCallback(
    (updates: Record<string, unknown>) => {
      if (selectedNode) {
        const data = selectedNode.data as { configuration?: Record<string, unknown> };
        updateNode(selectedNode.id, {
          configuration: { ...(data.configuration || {}), ...updates },
        } as any);
      }
    },
    [selectedNode, updateNode]
  );

  const handleUpdateLabel = useCallback(
    (label: string) => {
      if (selectedNode) {
        updateNode(selectedNode.id, { label } as any);
        const data = selectedNode.data as Record<string, unknown>;
        setSelectedNode({ ...selectedNode, data: { ...data, label } });
      }
    },
    [selectedNode, updateNode]
  );

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p className="text-sm">Create or select a project to start designing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <NodePalette />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          selectionMode={SelectionMode.Partial}
          fitView
          className="bg-zinc-50 dark:bg-zinc-900"
        >
          <Background
            gap={20}
            size={1}
            color="rgba(0,0,0,0.06)"
            className="dark:opacity-30"
          />
          {showMinimap && (
            <MiniMap
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  frontend: "#6366f1",
                  backend: "#22c55e",
                  database: "#f59e0b",
                  auth: "#ef4444",
                  "api-gateway": "#8b5cf6",
                  queue: "#06b6d4",
                  cache: "#eab308",
                  storage: "#14b8a6",
                  "external-service": "#64748b",
                };
                const d = node.data as { nodeType?: string } | undefined;
                return colors[d?.nodeType || ""] || "#64748b";
              }}
              maskColor="rgba(0,0,0,0.08)"
              className="!shadow-lg !rounded-xl !border !border-zinc-200 dark:!border-zinc-800"
              style={{ width: 180, height: 120 }}
            />
          )}
          <Controls className="!rounded-xl !border !border-zinc-200 dark:!border-zinc-800 !shadow-lg" />
          <Panel position="top-right" className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMinimap(!showMinimap)}
              className="h-8 px-2 text-xs"
            >
              {showMinimap ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant={showCodePreview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCodePreview(!showCodePreview)}
              className="h-8 px-3 text-xs"
            >
              {showCodePreview ? "Hide Code" : "View Code"}
            </Button>
          </Panel>
        </ReactFlow>

        {selectedNode && (
          <PropertyPanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onUpdateLabel={handleUpdateLabel}
            onDelete={handleDelete}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
      {showCodePreview && <CodePreviewPanel onClose={() => setShowCodePreview(false)} />}
    </div>
  );
}

export default function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}

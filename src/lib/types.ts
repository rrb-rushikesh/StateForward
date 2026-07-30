export type ArchitectureNodeType =
  | "frontend"
  | "backend"
  | "database"
  | "auth"
  | "api-gateway"
  | "queue"
  | "cache"
  | "storage"
  | "external-service"
  | "container";

export type FrameworkType =
  | "nextjs"
  | "react"
  | "vue"
  | "express"
  | "fastify"
  | "nestjs"
  | "django"
  | "flask"
  | "go"
  | "rust";

export type DatabaseType =
  | "postgresql"
  | "mongodb"
  | "mysql"
  | "sqlite"
  | "redis"
  | "dynamodb";

export interface ArchitectureNode {
  id: string;
  type: ArchitectureNodeType;
  label: string;
  configuration: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: "data-flow" | "api-call" | "database-query" | "event" | "auth";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stack: {
    frontend?: FrameworkType;
    backend?: FrameworkType;
    database?: DatabaseType;
  };
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface NodeDefinition {
  type: ArchitectureNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  canConnectTo: ArchitectureNodeType[];
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "textarea";
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

export type ArchitectureViewLevel = "system" | "container" | "component" | "code";

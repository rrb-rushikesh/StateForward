import type { NodeDefinition } from "@/lib/types";

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: "frontend",
    label: "Frontend App",
    description: "Client-side web application",
    icon: "Layout",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    canConnectTo: ["backend", "api-gateway", "auth", "cache"],
    defaultConfig: {
      framework: "nextjs",
      port: 3000,
      ssr: true,
    },
    configFields: [
      {
        key: "framework",
        label: "Framework",
        type: "select",
        options: [
          { label: "Next.js", value: "nextjs" },
          { label: "React (Vite)", value: "react" },
          { label: "Vue (Nuxt)", value: "vue" },
        ],
        defaultValue: "nextjs",
      },
      { key: "port", label: "Port", type: "number", placeholder: "3000", defaultValue: 3000 },
      { key: "ssr", label: "Server-Side Rendering", type: "boolean", defaultValue: true },
      { key: "routePrefix", label: "Route Prefix", type: "text", placeholder: "/app" },
    ],
  },
  {
    type: "backend",
    label: "Backend Service",
    description: "API server with business logic",
    icon: "Server",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.08)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    canConnectTo: ["database", "auth", "queue", "cache", "storage", "external-service", "frontend", "api-gateway"],
    defaultConfig: {
      framework: "express",
      port: 4000,
    },
    configFields: [
      {
        key: "framework",
        label: "Framework",
        type: "select",
        options: [
          { label: "Express.js", value: "express" },
          { label: "Fastify", value: "fastify" },
          { label: "NestJS", value: "nestjs" },
          { label: "Django", value: "django" },
          { label: "Flask", value: "flask" },
          { label: "Go (Gin)", value: "go" },
        ],
        defaultValue: "express",
      },
      { key: "port", label: "Port", type: "number", placeholder: "4000", defaultValue: 4000 },
      { key: "healthEndpoint", label: "Health Endpoint", type: "text", placeholder: "/health", defaultValue: "/health" },
    ],
  },
  {
    type: "database",
    label: "Database",
    description: "Data storage and retrieval",
    icon: "Database",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.08)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    canConnectTo: [],
    defaultConfig: {
      type: "postgresql",
      port: 5432,
    },
    configFields: [
      {
        key: "type",
        label: "Database Type",
        type: "select",
        options: [
          { label: "PostgreSQL", value: "postgresql" },
          { label: "MongoDB", value: "mongodb" },
          { label: "MySQL", value: "mysql" },
          { label: "SQLite", value: "sqlite" },
          { label: "DynamoDB", value: "dynamodb" },
        ],
        defaultValue: "postgresql",
      },
      { key: "port", label: "Port", type: "number", placeholder: "5432", defaultValue: 5432 },
      { key: "databaseName", label: "Database Name", type: "text", placeholder: "myapp_db", defaultValue: "myapp_db" },
    ],
  },
  {
    type: "auth",
    label: "Auth Service",
    description: "Authentication and authorization",
    icon: "Shield",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    canConnectTo: ["database", "backend", "api-gateway"],
    defaultConfig: {
      provider: "jwt",
      sessionDuration: 3600,
    },
    configFields: [
      {
        key: "provider",
        label: "Auth Provider",
        type: "select",
        options: [
          { label: "JWT", value: "jwt" },
          { label: "OAuth 2.0", value: "oauth" },
          { label: "NextAuth.js", value: "nextauth" },
          { label: "Clerk", value: "clerk" },
        ],
        defaultValue: "jwt",
      },
      { key: "sessionDuration", label: "Session Duration (s)", type: "number", placeholder: "3600", defaultValue: 3600 },
    ],
  },
  {
    type: "api-gateway",
    label: "API Gateway",
    description: "Central entry point for API requests",
    icon: "Route",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    canConnectTo: ["backend", "auth", "frontend", "external-service"],
    defaultConfig: {
      rateLimiting: true,
      cors: true,
    },
    configFields: [
      { key: "rateLimiting", label: "Rate Limiting", type: "boolean", defaultValue: true },
      { key: "cors", label: "CORS Enabled", type: "boolean", defaultValue: true },
      { key: "rateLimit", label: "Rate Limit (req/min)", type: "number", placeholder: "100", defaultValue: 100 },
    ],
  },
  {
    type: "queue",
    label: "Message Queue",
    description: "Async message processing",
    icon: "MessageSquare",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.08)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    canConnectTo: ["backend", "database"],
    defaultConfig: {
      provider: "redis",
    },
    configFields: [
      {
        key: "provider",
        label: "Queue Provider",
        type: "select",
        options: [
          { label: "Redis", value: "redis" },
          { label: "RabbitMQ", value: "rabbitmq" },
          { label: "BullMQ", value: "bullmq" },
        ],
        defaultValue: "redis",
      },
    ],
  },
  {
    type: "cache",
    label: "Cache Layer",
    description: "In-memory data caching",
    icon: "Zap",
    color: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.08)",
    borderColor: "rgba(234, 179, 8, 0.3)",
    canConnectTo: ["backend", "database"],
    defaultConfig: {
      provider: "redis",
      ttl: 300,
    },
    configFields: [
      {
        key: "provider",
        label: "Cache Provider",
        type: "select",
        options: [
          { label: "Redis", value: "redis" },
          { label: "In-Memory", value: "memory" },
        ],
        defaultValue: "redis",
      },
      { key: "ttl", label: "Default TTL (s)", type: "number", placeholder: "300", defaultValue: 300 },
    ],
  },
  {
    type: "storage",
    label: "File Storage",
    description: "Object/file storage service",
    icon: "HardDrive",
    color: "#14b8a6",
    bgColor: "rgba(20, 184, 166, 0.08)",
    borderColor: "rgba(20, 184, 166, 0.3)",
    canConnectTo: ["backend"],
    defaultConfig: {
      provider: "s3",
      region: "us-east-1",
    },
    configFields: [
      {
        key: "provider",
        label: "Storage Provider",
        type: "select",
        options: [
          { label: "AWS S3", value: "s3" },
          { label: "Google Cloud Storage", value: "gcs" },
          { label: "Local", value: "local" },
        ],
        defaultValue: "s3",
      },
      { key: "region", label: "Region", type: "text", placeholder: "us-east-1", defaultValue: "us-east-1" },
    ],
  },
  {
    type: "external-service",
    label: "External Service",
    description: "Third-party API or service",
    icon: "Globe",
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.08)",
    borderColor: "rgba(100, 116, 139, 0.3)",
    canConnectTo: ["backend", "api-gateway"],
    defaultConfig: {
      baseUrl: "",
    },
    configFields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://api.example.com" },
      { key: "apiKey", label: "API Key (env var)", type: "text", placeholder: "MY_EXTERNAL_API_KEY" },
    ],
  },
];

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find((n) => n.type === type);
}

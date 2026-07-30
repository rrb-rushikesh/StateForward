import type { ArchitectureNode, ArchitectureEdge, Project } from "@/lib/types";
import { getNodeDefinition } from "@/lib/node-definitions";

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GeneratedProject {
  name: string;
  files: GeneratedFile[];
  readme: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getNodeVarName(node: ArchitectureNode): string {
  return node.label.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// ── Frontend Generators ──────────────────────────────────────────

function generateNextJsConfig(project: Project): GeneratedFile {
  return {
    path: "next.config.ts",
    content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config generated from ${project.name} architecture */
  output: "standalone",
};

export default nextConfig;
`,
    language: "typescript",
  };
}

function generatePackageJson(project: Project): GeneratedFile {
  const deps: Record<string, string> = {
    next: "^14.2.0",
    react: "^18.3.0",
    "react-dom": "^18.3.0",
  };

  const devDeps: Record<string, string> = {
    typescript: "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    tailwindcss: "^3.4.0",
    eslint: "^8.0.0",
  };

  const backend = project.nodes.find((n) => n.type === "backend");
  if (backend) {
    deps["@tanstack/react-query"] = "^5.0.0";
  }

  const auth = project.nodes.find((n) => n.type === "auth");
  if (auth) {
    const provider = auth.configuration?.provider as string;
    if (provider === "nextauth") {
      deps["next-auth"] = "^5.0.0-beta.0";
    }
  }

  return {
    path: "package.json",
    content: JSON.stringify(
      {
        name: project.name.toLowerCase().replace(/\s+/g, "-"),
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "eslint .",
        },
        dependencies: deps,
        devDependencies: devDeps,
      },
      null,
      2
    ),
    language: "json",
  };
}

function generateApiClient(project: Project): GeneratedFile | null {
  const backend = project.nodes.find((n) => n.type === "backend");
  if (!backend) return null;

  const backendVar = getNodeVarName(backend);
  const port = (backend.configuration?.port as number) || 4000;

  return {
    path: "src/lib/api-client.ts",
    content: `/**
 * API client generated from StateForward architecture.
 * Connects to "${backend.label}" service.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:${port}";

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = \`\${API_BASE_URL}\${endpoint}\`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += \`?\${searchParams.toString()}\`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export default api;
`,
    language: "typescript",
  };
}

function generateAuthConfig(project: Project): GeneratedFile | null {
  const auth = project.nodes.find((n) => n.type === "auth");
  if (!auth) return null;

  const provider = (auth.configuration?.provider as string) || "jwt";
  const sessionDuration = (auth.configuration?.sessionDuration as number) || 3600;

  if (provider === "nextauth") {
    return {
      path: "src/lib/auth.ts",
      content: `import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Implement your auth logic here
        // This is a scaffold — replace with real validation
        if (credentials?.email && credentials?.password) {
          return { id: "1", email: credentials.email, name: "User" };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: ${sessionDuration},
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
`,
      language: "typescript",
    };
  }

  return {
    path: "src/lib/auth.ts",
    content: `/**
 * Auth configuration generated from StateForward architecture.
 * Provider: ${provider}
 * Session duration: ${sessionDuration}s
 */

export interface AuthConfig {
  provider: "${provider}";
  sessionDuration: ${sessionDuration};
}

export const authConfig: AuthConfig = {
  provider: "${provider}",
  sessionDuration: ${sessionDuration},
};

export type { AuthConfig };
`,
    language: "typescript",
  };
}

function generateDatabaseClient(project: Project): GeneratedFile | null {
  const db = project.nodes.find((n) => n.type === "database");
  if (!db) return null;

  const dbType = (db.configuration?.type as string) || "postgresql";
  const dbName = (db.configuration?.databaseName as string) || "myapp";

  if (dbType === "mongodb") {
    return {
      path: "src/lib/database.ts",
      content: `import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "${dbName}";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export default getDb;
`,
      language: "typescript",
    };
  }

  return {
    path: "src/lib/database.ts",
    content: `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
`,
    language: "typescript",
  };
}

function generateEnvFile(project: Project): GeneratedFile {
  const lines: string[] = [
    `# Environment generated from ${project.name} architecture`,
    "",
  ];

  const backend = project.nodes.find((n) => n.type === "backend");
  if (backend) {
    const port = (backend.configuration?.port as number) || 4000;
    lines.push(`NEXT_PUBLIC_API_URL=http://localhost:${port}`);
  }

  const db = project.nodes.find((n) => n.type === "database");
  if (db) {
    const dbType = (db.configuration?.type as string) || "postgresql";
    if (dbType === "postgresql") {
      lines.push(`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${(db.configuration?.databaseName as string) || "myapp"}"`);
    } else if (dbType === "mongodb") {
      lines.push(`MONGODB_URI="mongodb://localhost:27017"`);
      lines.push(`DB_NAME="${(db.configuration?.databaseName as string) || "myapp"}"`);
    }
  }

  const auth = project.nodes.find((n) => n.type === "auth");
  if (auth) {
    lines.push(`AUTH_SECRET="your-secret-key-here"`);
  }

  return {
    path: ".env.local",
    content: lines.join("\n") + "\n",
    language: "text",
  };
}

// ── Backend Generators ───────────────────────────────────────────

function generateExpressServer(project: Project): GeneratedFile | null {
  const backend = project.nodes.find((n) => n.type === "backend");
  if (!backend) return null;

  const framework = (backend.configuration?.framework as string) || "express";
  if (framework !== "express" && framework !== "fastify") return null;

  const port = (backend.configuration?.port as number) || 4000;
  const healthEndpoint = (backend.configuration?.healthEndpoint as string) || "/health";

  const deps = project.nodes.filter((n) => {
    const edges = project.edges.filter((e) => e.source === backend.id && e.target === n.id);
    return edges.length > 0;
  });

  const dbImport = deps.some((d) => d.type === "database")
    ? `import { prisma } from "./lib/database";\n`
    : "";

  const authImport = deps.some((d) => d.type === "auth")
    ? `import { authMiddleware } from "./lib/auth";\n`
    : "";

  return {
    path: "server/index.ts",
    content: `import express from "express";
import cors from "cors";
${dbImport}${authImport}
const app = express();
const PORT = process.env.PORT || ${port};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("${healthEndpoint}", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});

export default app;
`,
    language: "typescript",
  };
}

function generateDockerCompose(project: Project): GeneratedFile | null {
  const services: string[] = [];
  const db = project.nodes.find((n) => n.type === "database");
  const cache = project.nodes.find((n) => n.type === "cache");
  const queue = project.nodes.find((n) => n.type === "queue");

  if (db) {
    const dbType = (db.configuration?.type as string) || "postgresql";
    const dbName = (db.configuration?.databaseName as string) || "myapp";
    const port = (db.configuration?.port as number) || 5432;

    if (dbType === "postgresql") {
      services.push(`  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${dbName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "${port}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data`);
    }
  }

  if (cache || queue) {
    services.push(`  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data`);
  }

  if (services.length === 0) return null;

  return {
    path: "docker-compose.yml",
    content: `version: "3.8"

services:
${services.join("\n\n")}

volumes:
${db ? "  postgres_data:\n" : ""}${cache || queue ? "  redis_data:\n" : ""}
`,
    language: "yaml",
  };
}

function generatePrismaSchema(project: Project): GeneratedFile | null {
  const db = project.nodes.find((n) => n.type === "database");
  if (!db) return null;

  const dbType = (db.configuration?.type as string) || "postgresql";
  if (dbType === "mongodb" || dbType === "dynamodb") return null;

  const provider = dbType === "mysql" ? "mysql" : "postgresql";

  return {
    path: "prisma/schema.prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

// ── Models ────────────────────────────────────────────────────
// Generated from ${db.label}
// Add your models below

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
`,
    language: "prisma",
  };
}

// ── Main Generator ──────────────────────────────────────────────

export function generateProject(project: Project): GeneratedProject {
  const files: GeneratedFile[] = [];

  // Frontend files
  files.push(generatePackageJson(project));
  files.push(generateNextJsConfig(project));

  const apiClient = generateApiClient(project);
  if (apiClient) files.push(apiClient);

  const authConfig = generateAuthConfig(project);
  if (authConfig) files.push(authConfig);

  const dbClient = generateDatabaseClient(project);
  if (dbClient) files.push(dbClient);

  files.push(generateEnvFile(project));

  // Backend files
  const expressServer = generateExpressServer(project);
  if (expressServer) files.push(expressServer);

  // Infrastructure
  const dockerCompose = generateDockerCompose(project);
  if (dockerCompose) files.push(dockerCompose);

  const prismaSchema = generatePrismaSchema(project);
  if (prismaSchema) files.push(prismaSchema);

  // Generate README
  const readme = generateReadme(project);

  return {
    name: project.name,
    files,
    readme,
  };
}

function generateReadme(project: Project): string {
  const frontend = project.nodes.find((n) => n.type === "frontend");
  const backend = project.nodes.find((n) => n.type === "backend");
  const db = project.nodes.find((n) => n.type === "database");

  return `# ${project.name}

${project.description || "Generated by StateForward — Architecture-first development."}

## Architecture

${project.nodes.map((n) => `- **${n.label}** — ${n.type}`).join("\n")}

## Stack

${project.stack.frontend ? `- Frontend: ${project.stack.frontend}` : ""}
${project.stack.backend ? `- Backend: ${project.stack.backend}` : ""}
${project.stack.database ? `- Database: ${project.stack.database}` : ""}

## Getting Started

### Prerequisites

- Node.js 18+
${db ? "- Docker (for database)\n" : ""}

### Setup

\`\`\`bash
# Install dependencies
npm install

# Start infrastructure (database, cache, etc.)
${db ? "docker compose up -d\n" : ""}
# Set up environment variables
cp .env.local .env

# Run database migrations (if using Prisma)
npx prisma migrate dev

# Start the development server
npm run dev
\`\`\`

${backend ? `### API Server\n\nThe backend runs on port \`${(backend.configuration?.port as number) || 4000}\`.\n` : ""}
${frontend ? `### Frontend\n\nThe frontend runs on port \`${(frontend.configuration?.port as number) || 3000}\`.\n` : ""}

## Generated by StateForward

This project was visually designed using StateForward's architecture canvas.
The diagram is the app.
`;
}

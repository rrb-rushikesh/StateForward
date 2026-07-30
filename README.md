# StateForward

**Architecture-first development environment. Design your system on a visual canvas. Get real, production-quality code you own.**

Not no-code. Not an AI wrapper. Not a diagram tool. A developer tool.

---

## Why StateForward

Every AI coding tool today — Cursor, Copilot, Devin, Lovable, Bolt, v0 — shares one blind spot: no map of the system. Natural language is ambiguous. The AI hallucinates structure, wires things wrong, breaks connections across files. Every new session you re-feed context and burn tokens.

Architecture tools (IcePanel, Structurizr, Eraser) model systems beautifully but stop at a static picture. Documentation that goes stale the moment code changes.

No-code tools (Bubble, Retool) are fast but lock you in. You don't own the code.

**StateForward connects structure + real code + control.**

## The Core Insight

Most of web development is already solved. The frameworks exist. The patterns are known. The problem isn't generating code — it's keeping the architecture correct as the system grows.

StateForward encodes known-good patterns as visual components and lets the engine assemble them within validated structure. The compiler pipeline ensures the output is always valid, portable, and yours.

**Architecture handles the WHAT. The engine handles the HOW.**

## What's Built

This repository contains a production-ready web application with:

### Landing Page
- Hero section with value proposition
- Features grid (Visual Architecture, Real Code Generation, Multi-Layer Design, You Own the Code, Three Build Modes, Connected Structure)
- How It Works section (4-step process)
- Responsive design with dark mode support

### Dashboard
- Project listing with stack badges
- Create / delete projects
- Auto-save to localStorage

### New Project Wizard
- 3-step guided setup: Name → Stack Selection → Review
- Stack selection for frontend (Next.js, React, Vue), backend (Express, Fastify, NestJS, Django, Flask, Go), database (PostgreSQL, MongoDB, MySQL, SQLite, Redis)

### Architecture Canvas
- Drag-and-drop visual canvas powered by React Flow
- Component library with draggable nodes: Frontend, Backend, Database, Auth Service, API Gateway, Message Queue, Cache Layer, File Storage, External Service
- Custom colored nodes with icons and handles
- Connection system (connect nodes with edges)
- Minimap navigation
- Auto-save on every change

### Property Panel
- Click any node to inspect/configure
- Edit node name inline
- Configure framework, port, database type, auth provider, and more
- Dynamic form fields based on node type
- Delete nodes

### Code Generation Engine
- Compiles your visual architecture into real project files:
  - `package.json` with proper dependencies
  - `next.config.ts`
  - API client (`src/lib/api-client.ts`)
  - Auth configuration (`src/lib/auth.ts`)
  - Database client (`src/lib/database.ts`)
  - Express server scaffold (`server/index.ts`)
  - Prisma schema (`prisma/schema.prisma`)
  - Docker Compose for infrastructure
  - `.env.local` with connection strings
  - Full README

### Code Preview Panel
- File tree browser
- Syntax-highlighted code preview
- One-click export as ZIP download

## Tech Stack

- **Framework:** Next.js 16 (App Router) + Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + tailwindcss-animate
- **Canvas:** React Flow (@xyflow/react v12)
- **State:** Zustand
- **UI:** Radix UI primitives + shadcn/ui-style components
- **Icons:** Lucide React
- **Export:** JSZip

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── projects/
│   │   │   ├── new/page.tsx    # New project wizard
│   │   │   └── [id]/page.tsx   # Architecture editor
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── select.tsx
│   ├── landing/
│   │   └── LandingPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── NewProjectPage.tsx
│   ├── editor/
│   │   └── EditorPage.tsx
│   └── canvas/
│       ├── ArchitectureCanvas.tsx  # Main canvas (React Flow)
│       ├── NodePalette.tsx         # Draggable component sidebar
│       ├── PropertyPanel.tsx       # Node configuration panel
│       ├── CodePreviewPanel.tsx    # Generated code viewer
│       └── nodes/
│           └── ArchitectureNode.tsx # Custom canvas node
├── lib/
│   ├── types.ts                    # Core type definitions
│   ├── utils.ts                    # Utility functions
│   ├── node-definitions.ts         # Component library definitions
│   ├── generators/
│   │   └── index.ts                # Code generation engine
│   └── store/
│       └── project-store.ts        # Zustand state management
```

## Architecture

### Node Types

| Type | Color | Description |
|------|-------|-------------|
| Frontend App | Indigo | Client-side web app (Next.js, React, Vue) |
| Backend Service | Emerald | API server (Express, Fastify, NestJS, etc.) |
| Database | Amber | Data store (PostgreSQL, MongoDB, etc.) |
| Auth Service | Red | Authentication (JWT, OAuth, NextAuth, Clerk) |
| API Gateway | Violet | Request routing and rate limiting |
| Message Queue | Cyan | Async message processing |
| Cache Layer | Yellow | In-memory caching |
| File Storage | Teal | Object storage |
| External Service | Slate | Third-party APIs |

### Code Generation Pipeline

1. **Architecture Interpreter** reads the visual graph
2. **Template Resolver** maps nodes to framework-specific templates
3. **Code Assembler** produces a complete, ready-to-run project

## Roadmap

- [ ] **Multi-layer zoom** — C4-inspired drill-down from system to component level
- [ ] **Live preview** — See your generated app running in an iframe
- [ ] **Git integration** — Push generated code directly to GitHub
- [ ] **AI modes** — Vibe Mode (AI-driven) and Dev Mode (AI-guided)
- [ ] **Collaboration** — Real-time multi-user editing
- [ ] **More frameworks** — Python, Go, Rust backends
- [ ] **Custom templates** — Bring your own code patterns

## License

MIT

---

*Built with the belief that architecture, not better prompting, is the next abstraction layer in programming.*

**Binary → Assembly → High-Level Languages → Architecture.**

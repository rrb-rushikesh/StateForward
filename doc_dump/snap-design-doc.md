# Snap — Full-Stack IDE Design Document
> Status: Complete. Parts 1–10. Audited for internal consistency.
>
> Canonical decisions (referenced throughout):
> - **Snap is a web application** (Next.js, runs in the browser). Not Electron, not desktop.
> - **Snap markers in generated code:** `data-snap-id` (element identity) and `data-snap-bind` (binding reference). No other prefixes.
> - **User-project default stack (MVP):** Next.js + Next.js API Routes + Prisma + SQLite ("Snap manages it", zero-config). PostgreSQL recommended for production; NestJS/Express available as backend options.
> - **Product name is "Snap"** everywhere. (Mockup images use the working title "StateForward" — treat all such references as "Snap".)

---

# PART 1 — Vision, Core Concept & What Snap Is (and Isn't)

## 1.1 The Problem

Building full-stack software today requires a developer to simultaneously hold two mental models:

1. The **architecture** — how services, APIs, data flows, and components relate to each other
2. The **implementation** — the actual code that makes it real

These two models live in different places. Architecture lives in diagrams (Miro, IcePanel, Figma, whiteboards) that are disconnected from code. Implementation lives in editors that show no structure. The gap between them is where complexity hides, where onboarding fails, and where systems become hard to reason about.

Existing tools solve only half the problem:

- **IcePanel / C4 tools** — great for visualizing architecture, but produce zero runnable code
- **Webflow / Bubble** — great for visual building, but produce locked-in, non-portable output
- **VS Code / Cursor** — great for coding, but show no visual structure of what's being built
- **Retool / Appsmith** — good for internal tools, but limited in scope and not production-grade

Snap closes this gap entirely.

---

## 1.2 The Core Idea

**Snap is a full-stack JavaScript IDE where the visual layer and the code layer are the same thing — two synchronized views over one codebase.**

There is no export step. There is no "generate code" button. There is no diagram that becomes stale. The visual environment and the code editor are permanently bound. A change in one is a change in both — immediately, without any manual reconciliation.

This is the central, non-negotiable principle of Snap:

> **Visual and code are not separate workflows. They are two interfaces over the same source of truth.**

### The two headline pillars

Snap stands on two pillars. The first is the sync above. The second is what that synchronized model makes uniquely possible:

**Pillar 1 — Visual and code are one synchronized model.** Edit either; both update; the code is always real and yours.

**Pillar 2 — The connection between frontend and backend is a typed, live contract.** Because Snap holds the whole app as one structured model, the link between a UI element and the server logic behind it is explicit and machine-checked — not held in the developer's head. This directly answers the deepest, most-complained-about pain in full-stack development: contract drift (see Part 12.1).

The single demo that captures Snap:

> Rename a database field → every affected frontend binding lights up red across every page → fix them all in one propagating action.

No competing tool can do this, because no competing tool has a typed link across the network boundary. This is the wedge.

---

## 1.3 What Snap Is

- A **web-based IDE** that runs in any modern browser — cross-platform by definition (Windows, macOS, Linux), no install
- A **full-stack JavaScript development environment** — frontend + backend in one place
- A **visual builder** with multiple modes: a drag-and-drop frontend builder (Webflow-style), a node-based backend canvas (IcePanel/C4-style), and a database manager
- A **code editor** with full two-way sync to the visual layer
- A **project management system** with a dashboard, project creation wizard, and stack configuration
- An **AI-accelerated** platform — AI is a productivity layer, not the product itself
- A tool that produces **standard, portable, readable JavaScript** — no proprietary lock-in

---

## 1.4 What Snap Is NOT

- **Not a no-code tool.** Snap is for developers. You can always see and edit the code. The visual layer is a developer productivity tool, not an abstraction that hides code.
- **Not a diagram tool.** The backend canvas is a development environment. What you build on it runs. It is not documentation.
- **Not a framework.** Snap wraps existing libraries and patterns. It does not introduce new syntax, new abstractions, or a new execution model.
- **Not a hosting/deployment platform.** Snap is where you build. It does not own your deployment, your hosting, or your production infrastructure — you deploy the standard code it produces wherever you like.
- **Not a low-code platform.** The output is not generated boilerplate you then have to modify. The output is the code you wrote, represented visually.
- **Not locked-in.** Remove Snap from a project and the codebase remains 100% intact, readable, and runnable. Snap adds no runtime dependency.

---

## 1.5 The Guiding Principles

These principles govern every design decision in Snap:

**1. Code is always real.**
Every visual action produces real, standard JavaScript. There are no intermediate representations, no hidden DSLs, no proprietary file formats for logic.

**2. Sync is never broken.**
The visual layer and code editor are always in sync. There is no "dirty state" where one is ahead of the other. The sync is real-time and bidirectional.

**3. Developer control is never removed.**
A developer can drop into code at any point. The visual layer never locks anything down. Every component, node, binding, and configuration is editable in code.

**4. Complexity is made visible, not hidden.**
The goal is not to hide how a system works. It is to make the structure of the system visible and navigable so developers can reason about it at any scale.

**5. AI assists, it does not replace.**
The platform is fully functional and powerful without AI. AI accelerates existing workflows — it does not own them. The architecture and context built into the platform make AI unusually capable compared to a plain editor.

**6. Premium, not generic.**
Snap is not a web app with a text editor embedded. It is a purpose-built, browser-based IDE with a professional UI, keyboard-first interactions, and a visual language that feels intentional.

---

## 1.6 Target User

Snap is built for **professional JavaScript developers** building full-stack web applications — people who know how to code, who are frustrated by the fragmentation of their toolchain, and who want to move faster without giving up control.

Secondary users: technical co-founders, senior engineers onboarding teams onto complex systems, and developers who think architecturally before they think in code.

Snap is not built for people who do not want to write code. That is not the audience, and designing for them would compromise the tool for its actual users.

---


---

# PART 2 — Architecture Overview

## 2.1 What Snap Is, Architecturally

Snap is a **web application** that runs in the browser. It is built with Next.js and hosted (or run locally via `npm run dev` during development). There is no Electron, no desktop agent, no installer.

The user's generated project — the full-stack app they are building inside Snap — is a separate codebase that Snap manages, stores, and can run inside an embedded preview/terminal. Snap is the IDE. The user's project is the output.

These two things must never be confused:

- **Snap app** — the IDE itself, runs in the browser, built with the stack below
- **User project** — the full-stack JS app a user builds using Snap, stored and executed separately

> **Snap is framework-agnostic by design (see Part 12.3).** The structured model — components, nodes, bindings, schema — is independent of any one framework. The *user project's* framework is selected per project and emitted through a pluggable **FrameworkAdapter**. The Snap IDE itself (the stack below) is a separate, fixed choice. Do not conflate the IDE's stack with the user project's stack, and do not tie Snap's identity to any single output framework.

---

## 2.2 The Full Tech Stack

### Snap IDE (the product itself)

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR for dashboard/auth pages, API routes for backend, one repo |
| Language | **TypeScript** throughout | Type safety across frontend and backend |
| UI Framework | **React 18** | Component model, ecosystem, concurrent features |
| UI Kit | **MUI (Material UI) v5** | Comprehensive, themeable, professional — customized heavily away from default Material look |
| Supplemental UI | **Radix UI primitives** | Accessible headless components for custom-styled elements MUI doesn't cover well |
| Icons | **Lucide React + Phosphor Icons** | Lucide for UI chrome, Phosphor for canvas/builder icons — both tree-shakeable |
| State (client) | **Zustand** | Lightweight, no boilerplate, ideal for complex IDE state (panels, selections, canvas) |
| State (server) | **TanStack Query v5** | Server state, caching, background sync for project data |
| Code Editor | **Monaco Editor** via `@monaco-editor/react` | VS Code's editor engine — syntax highlighting, IntelliSense, diff view |
| Visual Canvas | **React Flow** | Node-based graph for the Backend Canvas — purpose-built, performant, extensible |
| Drag & Drop | **dnd-kit** | Modern, accessible, pointer/touch support for the Frontend Builder |
| AST / Code Parsing | **Babel parser + @babel/traverse + @babel/generator** | Core of two-way sync — parse code → AST → manipulate → regenerate |
| Styling | **Tailwind CSS** (utility) + MUI theme | MUI for components, Tailwind for layout and one-off utility classes |
| Fonts | **Geist (Vercel) + JetBrains Mono** | Geist for UI, JetBrains Mono for editor |

### Snap Backend (API + data layer)

| Layer | Technology | Reason |
|---|---|---|
| API | **Next.js API Routes / Route Handlers** | Co-located with the frontend, no separate server process needed for MVP |
| Database | **PostgreSQL** | Relational, robust, supports JSON columns for flexible node/canvas data |
| ORM | **Prisma** | Type-safe queries, excellent DX, auto-generated types align with TypeScript |
| Auth | **Better Auth** | Modern, TypeScript-native, handles sessions, OAuth, credentials cleanly |
| File Storage | **Local filesystem** (MVP) → **S3 / Supabase Storage** (later) | Store project files; local for validation phase, cloud when scaling |
| Cache | **Redis** (later) | Not needed for MVP; add when background jobs and session scaling require it |
| Realtime | **Socket.IO** (later) | Collaboration is post-MVP; Socket.IO for presence and live updates when needed |
| Search | **PostgreSQL full-text search** | Built-in, sufficient for project/file search at MVP scale |

### User Project Runtime (what Snap builds and runs)

| Concern | Approach |
|---|---|
| Project storage | Stored as files in a managed directory on the server (or local dev machine), tracked in PostgreSQL |
| Project execution | Snap spawns a child Node.js process (`child_process.spawn`) to run the user's project |
| Preview | Embedded `<iframe>` pointing to the spawned process's localhost port |
| Terminal output | Streamed from the child process to the browser via WebSocket / Server-Sent Events |
| Generated stack | Emitted via a **FrameworkAdapter** (Part 12.3). Targets in priority order: **Vite + React**, **Next.js (Pages Router)**, **TanStack Start**, Remix. Backend: Next.js API Routes / NestJS / Express. Data: **Prisma + SQLite** default (Postgres for production). All standard, portable, ejectable. |

---

## 2.3 Monorepo Structure

```
snap/
├── apps/
│   └── web/                        # The Snap IDE — Next.js app
│       ├── app/                    # App Router pages
│       │   ├── (auth)/             # Login, signup, onboarding
│       │   ├── dashboard/          # Project list, settings
│       │   └── project/[id]/       # The IDE workspace
│       ├── components/
│       │   ├── ide/                # IDE shell (panels, tabs, activity bar)
│       │   ├── frontend-builder/   # Drag-drop page builder
│       │   ├── backend-canvas/     # Node-based backend editor
│       │   ├── code-editor/        # Monaco wrapper + sync logic
│       │   └── shared/             # Buttons, dialogs, tooltips, etc.
│       ├── lib/
│       │   ├── sync/               # Two-way sync engine (AST ↔ visual)
│       │   ├── store/              # Zustand stores
│       │   └── api/                # TanStack Query hooks
│       └── server/
│           ├── api/                # Route handlers
│           ├── db/                 # Prisma client + schema
│           └── runtime/            # Child process management for user projects
├── packages/
│   ├── ast-engine/                 # Babel-based AST parser/writer (shared)
│   ├── framework-adapters/         # Per-framework codegen (Vite, Next.js, TanStack Start, ...)
│   ├── node-definitions/           # Backend canvas node type definitions
│   ├── component-registry/         # Frontend builder component library
│   └── types/                      # Shared TypeScript types across packages
└── tooling/
    ├── eslint-config/
    └── tsconfig/
```

Managed with **pnpm workspaces** + **Turborepo** for build orchestration and caching.

---

## 2.4 Key Architectural Decisions & Rationale

**Why Next.js for Snap itself (not Vite)?**
Snap has both a marketing/dashboard surface (benefits from SSR) and a complex client-side IDE surface. Next.js App Router handles both cleanly. The IDE route (`/project/[id]`) is a fully client-side component tree — SSR is disabled for it. API routes eliminate the need for a separate backend server for MVP.

**Why not Electron?**
Electron adds packaging complexity, auto-update infrastructure, code signing, and platform-specific build pipelines. For MVP validation, a web app runs everywhere instantly — no install, no binary, no OS-specific issues. If validation succeeds and offline/native filesystem access becomes a priority, Electron (or Tauri) can be added as a wrapper around the same web app.

**Why Zustand over Redux/Jotai?**
IDE state is complex: active panel, selected nodes, canvas viewport, open files, binding selections, split pane sizes, undo/redo stacks. Zustand's flat, composable stores handle this without boilerplate. Jotai is too granular for this scale; Redux is too ceremonial.

**Why React Flow for the backend canvas?**
Building a production-quality node graph from scratch is months of work. React Flow is battle-tested, handles zoom/pan/edge routing/selection/minimap out of the box, and is fully customizable. The node *content* is 100% custom — React Flow just handles the graph mechanics.

**Why Babel over TypeScript compiler API for AST?**
Babel's parser is faster to work with, has excellent plugin ecosystem, and handles JSX natively. The TypeScript compiler API is more powerful for type analysis but significantly more complex. For two-way sync (the core feature), Babel gives 90% of what's needed with 30% of the complexity.

**Why dnd-kit over React DnD?**
React DnD uses the HTML5 drag API which has known limitations (no touch, poor performance on complex trees). dnd-kit is pointer-event based, accessible, and designed for exactly this use case — sortable lists, drag-between-containers, custom drag overlays.

---

## 2.5 Data Flow Overview

```
User action (visual or code)
        │
        ▼
  Zustand store update
        │
        ├──► AST Engine         (if code change → update visual model)
        │         │
        │         ▼
        │    Visual model update → React Flow / Builder re-render
        │
        └──► Visual model change (if visual action → update AST → regenerate code)
                  │
                  ▼
             Monaco Editor content update (programmatic setValue)
```

The AST engine is the bridge. It is the single most important subsystem in Snap. Everything else depends on it working correctly and fast (target: <50ms for any sync operation on typical file sizes).

---


---

# PART 3 — UI/UX Shell

## 3.1 Design Philosophy

Snap's UI is built on three references, each contributing something specific:

- **VS Code** — the structural model: activity bar, sidebar, editor area, bottom panel, status bar. Keyboard-first. Dense but not cluttered. Every pixel earns its place.
- **CodeSandbox** — the tab-based mode switching at the top center of the IDE, the clean dark theme, the feeling that the IDE itself is part of the product rather than just a container.
- **Firebase Console** — the dashboard layer before you enter the IDE: project cards, clear create/edit/delete actions, project metadata visible at a glance.

The output is not a clone of any of these. It is a purpose-built IDE that borrows the best structural decisions from each.

**Visual language:**
- Dark theme only (MVP). Background: `#0d0d0d` to `#111111`. Not pure black, not VS Code grey.
- Accent color: **violet/purple** (`#7c3aed` base, `#8b5cf6` highlights) — visible in the mockups on the active tab indicator, Deploy button, binding highlights.
- Secondary accent: **amber/orange** for triggers, **green** for live/success states, **blue** for database nodes — each canvas node category has a distinct color identity.
- Typography: **Geist** for UI chrome, **JetBrains Mono** for all code surfaces.
- Borders: subtle, `1px solid rgba(255,255,255,0.08)` — separators that exist but don't compete.

---

## 3.2 The Five Layout Zones

The IDE workspace is divided into five permanent zones. All zones except the Title Bar are resizable. All except the Activity Bar can be collapsed.

```
┌─────────────────────────────────────────────────────────────────┐
│  TITLE BAR  (logo | menu | mode tabs | search | status | user)  │  ~40px
├────┬────────────┬────────────────────────────────┬──────────────┤
│    │            │                                │              │
│ A  │  PRIMARY   │        EDITOR AREA             │  INSPECTOR   │
│ C  │  SIDEBAR   │   (canvas / builder / code)    │  PANEL       │
│ T  │            │                                │  (right)     │
│ I  │            │                                │              │
│ V  │            │                                │              │
│ I  │            │                                │              │
│ T  │            │                                │              │
│ Y  │            │                                │              │
│    ├────────────┴────────────────────────────────┴──────────────┤
│ B  │         BOTTOM PANEL (terminal / output / ports)           │  ~200px
│ A  │                                                            │
│ R  │                                                            │
├────┴────────────────────────────────────────────────────────────┤
│  STATUS BAR  (branch | sync status | errors | port info)        │  ~24px
└─────────────────────────────────────────────────────────────────┘
```

| Zone | Width/Height | Resizable | Collapsible |
|---|---|---|---|
| Title Bar | 40px fixed | No | No |
| Activity Bar | 48px fixed | No | No |
| Primary Sidebar | 240px default | Yes (drag handle) | Yes |
| Editor Area | Fills remaining | Yes | No |
| Inspector Panel | 280px default | Yes (drag handle) | Yes |
| Bottom Panel | 200px default | Yes (drag handle) | Yes |
| Status Bar | 24px fixed | No | No |

Resize handles: `react-resizable-panels` library. Panels remember their last size in Zustand (persisted to localStorage).

---

## 3.3 Title Bar

The title bar is Snap's primary navigation surface and global chrome. It replaces the traditional OS window chrome.

**Left section:**
- Snap logo mark + wordmark
- Menu items: `File` `Edit` `View` `Build` `Deploy` `Help` — these are custom dropdowns, not OS native menus (web app, no OS menu bar)

**Center section — Mode Tabs (the most important element):**
Five tab pills, always visible, always accessible:

```
[ Frontend ]  [ Backend ]  [ Database ]  [ ◈ Code ]  [ Settings ]
```

- Only one tab active at a time
- Active tab has a filled/highlighted style (violet underline or filled pill)
- Switching tabs changes: the Editor Area content, the Primary Sidebar content, the Inspector Panel content
- The Code tab is special — it shows the Monaco editor regardless of which visual tab was last active
- Keyboard shortcuts: `Ctrl+1` through `Ctrl+5`

**Right section:**
- `Search commands...` — global command palette trigger (`Ctrl+K` / `Cmd+K`), styled like VS Code's command palette
- Sync status indicator — `● Synced` (green) / `⟳ Syncing` (amber) / `✕ Error` (red)
- `Deploy` button — primary CTA, always visible, violet filled
- Project name + user avatar (clicking opens project switcher / account menu)

---

## 3.4 Activity Bar

The activity bar is a 48px-wide vertical icon strip on the far left. It is always visible and never collapses.

Each icon opens a specific view in the Primary Sidebar. The active icon has a violet left-border indicator (VS Code style). Hovering shows a tooltip with the view name.

**Activity Bar Items (top to bottom):**

| Icon | View | Shortcut |
|---|---|---|
| Files icon | Explorer — file tree of the user's project | `Ctrl+Shift+E` |
| Search icon | Global search across project files | `Ctrl+Shift+F` |
| Components icon | Component registry / library browser | `Ctrl+Shift+C` |
| Git branch icon | Source control (git status, diff, commit) | `Ctrl+Shift+G` |
| Node/graph icon | Backend node library (visible in Backend tab) | `Ctrl+Shift+N` |
| Database icon | Database schema browser | `Ctrl+Shift+D` |
| Extensions icon | Snap plugin/extension registry (future) | — |

**Bottom of activity bar (separated by spacer):**
- Account / profile icon
- Settings icon (also accessible via `Ctrl+,`)

The active item in the activity bar always corresponds to what's shown in the sidebar. Clicking the active icon collapses the sidebar (toggle behavior, same as VS Code).

**Important:** The sidebar content changes based on both the active activity bar item AND the active mode tab. The Explorer always shows the file tree. But the Component Library shows frontend components when in Frontend mode and node definitions when in Backend mode.

---

## 3.5 Primary Sidebar

240px default width. Contains contextual panels based on the active activity bar selection.

### Explorer View (all modes)
Standard file tree of the user's project. Identical in feel to VS Code's Explorer:
- Folder expand/collapse with arrow indicators
- File icons by type (using `vscode-icons` or `file-icons` mapping)
- Right-click context menu: New File, New Folder, Rename, Delete, Copy Path
- Inline rename on double-click or F2
- Drag to move files between folders
- Dirty indicator (dot) on unsaved files

### Component Library (Frontend mode)
The left sidebar when the Frontend Builder is active. Organized sections:

```
COMPONENTS                    [+]
  Search components...

  LAYOUT
    [ Section ]  [ Grid ]  [ Columns ]
    [ Flex Row ] [ Div ]   [ Container ]

  TYPOGRAPHY
    [ Heading ]  [ Paragraph ]  [ Span ]
    [ Link ]

  INTERACTIVE
    [ Button ]  [ Input ]   [ Form ]
    [ Select ]  [ Checkbox ] [ Toggle ]

  MEDIA
    [ Image ]  [ Video ]  [ Icon ]
    [ Divider ]

  PRE-BUILT SECTIONS
    ▣ Hero Section
      Title + subtitle + CTA
    ▣ Feature Grid
    ▣ Pricing Table
    ▣ ...
```

Each component is draggable onto the canvas. Pre-built sections are larger drop targets. A search box filters all components in real time.

### Node Library (Backend mode)
The left sidebar when the Backend Canvas is active. Categories with color-coded left borders matching node colors on the canvas:

```
NODE LIBRARY
  Search nodes...

  TRIGGERS           (orange)
    ⬡ HTTP Request
    ⬡ Schedule
    ⬡ Webhook

  HTTP / ROUTING     (purple)
    ⬡ Route Handler
    ⬡ Router
    ⬡ Redirect

  AUTH / SECURITY    (yellow)
    ⬡ JWT Auth
    ⬡ Rate Limit
    ⬡ CORS
    ⬡ Validate

  DATABASE           (green)
    ⬡ Query
    ⬡ Insert
    ⬡ Update
    ⬡ Delete

  LOGIC              (green)
    ⬡ Condition
    ⬡ Transform
    ⬡ Loop
    ⬡ Merge

  OUTPUT             (blue)
    ⬡ Send Response
    ⬡ Send Email
```

Nodes are draggable onto the canvas. Each category is collapsible.

### Tables View (Database mode)
```
TABLES                        [+]
  users              248 rows
  waitlist         1,243 rows
  sessions           84 rows
  settings           12 rows
  logs             4,891 rows

VIEWS
  active_users
```

Clicking a table opens it in the editor area. Row counts update in real time.

### Search View (all modes)
Global full-text search across all project files. Results grouped by file, with line previews. Click to jump to file + line in Monaco.

---

## 3.6 Editor Area — Mode-Specific Views

The editor area is the largest zone. Its content changes completely based on the active mode tab.

### Frontend Mode — Visual Builder
- Full-width canvas showing a browser-frame mock (with fake address bar showing `localhost:3000`) containing the user's rendered page
- Canvas has its own toolbar above it: select, text, rectangle tools + undo/redo + viewport size selector (1440×900, 1280×800, 375×812 mobile) + zoom %
- Selected elements get blue selection handles with resize corners (Webflow-style)
- Selected element name appears as a label above the selection box (e.g., `Hero Section`)
- The canvas IS the preview — it renders the actual React output in an iframe

### Backend Mode — Node Canvas
- Infinite pan/zoom canvas (React Flow)
- Nodes float freely, connected by curved edges
- Canvas toolbar: selection, pan, zoom fit, minimap toggle, add note
- Route indicator at top of canvas showing which route is being viewed: `POST /api/join  LIVE`
- Right-click on canvas: `Add Node` context menu

### Database Mode — Table Editor
- Spreadsheet-style table view (primary), Schema view, Query editor, Migrations tab
- Tabs across top: `Data` `Schema` `Query` `Migrations`
- Database info bar: `● dev.db  2.4 MB · SQLite`
- Toolbar: `Insert Row` `Filter` `Sort` `Search...`
- Top right: `Import` `Export` `+ New Table`

### Code Mode — Monaco Editor
- Full Monaco editor, VS Code dark theme
- File tabs across the top of the editor area (open files)
- Breadcrumb path below tabs: `src > pages > index.jsx`
- Status bar at bottom of Monaco: `Ln 1, Col 1  UTF-8  JSX  ⇌ Synced with Visual Builder`
- The `⇌ Synced` indicator is Snap-specific — shows the two-way sync is active and current

---

## 3.7 Inspector Panel (Right Sidebar)

280px default width. Appears when something is selected. Context-sensitive.

### When a frontend element is selected (Frontend mode):
Four tabs: `Style` `Layout` `Interact` `Bind`

- **Style tab:** Background color, border, shadow, effects — color pickers, inputs, toggles
- **Layout tab:** Size (W/H/X/Y), spacing (margin/padding with individual side controls), typography (font family, size, weight, line height, color)
- **Interact tab:** onClick, onHover, visibility conditions
- **Bind tab:** Wire this element to a backend node (the binding system — covered in Part 6)

### When a backend node is selected (Backend mode):
Panel title shows node name and category badge (e.g., `DB Insert  DATABASE`).

Sections:
- **Configuration** — node-specific fields (table name, operation type, conflict handling)
- **Data Fields** — schema definition for the node's data
- **Frontend Binding** — shows which frontend elements are bound to this node (e.g., `#hero-cta  onclick`)
- **Generated Code** — read-only Monaco snippet showing the actual code this node produces. Live-updating as config changes.

### When nothing is selected:
Panel shows project-level properties or collapses to a thin sliver.

---

## 3.8 Bottom Panel

Toggleable (Ctrl+\`). Four tabs:

| Tab | Content |
|---|---|
| `TERMINAL` | Embedded xterm.js terminal. Runs inside the user's project directory. Shows `npm run dev` output, process logs. |
| `OUTPUT` | Snap's own log output — sync events, AST parse errors, binding warnings |
| `PROBLEMS` | Errors and warnings with count badge (e.g., `PROBLEMS 2`). Click to jump to file. |
| `PORTS` | Lists active ports from the spawned user project process (e.g., App: 3100 — pages + API routes) |

The terminal always shows the user's project context in the prompt:
```
C:\my-project [main ↯]> npm run dev
✓ Snap dev server started
  App:      http://localhost:3100   (pages + API routes, unified)
  Database: SQLite (dev.db) — connected via Prisma
  Visual ↔ Code sync: active
  HMR: enabled
```
(The dev-server port is assigned by Snap from its port pool — see Part 10.6. With the default Next.js API Routes backend, pages and API share one port. If NestJS/Express is chosen, a second port is shown for the API server.)

---

## 3.9 Status Bar

24px strip at the very bottom. Left to right:

```
⎇ main   ○ Synced   ⚠ 0  △ 2          Ln 1, Col 1   Tab: 2   UTF-8   LF   JSX
```

| Item | Meaning |
|---|---|
| `⎇ main` | Current git branch. Click to branch switcher. |
| `○ Synced` | Visual ↔ code sync status |
| `⚠ 0 △ 2` | Errors (0) and warnings (2). Click to open Problems panel. |
| Right side | Monaco cursor position, indentation, encoding, line endings, language mode |

---

## 3.10 Command Palette

`Ctrl+K` / `Cmd+K` — opens a centered floating command palette (Linear/Raycast-style, not VS Code's top-bar style).

Capabilities:
- Run any menu action (`Deploy`, `New File`, `Run Dev Server`)
- Switch between open files
- Switch mode tabs
- Trigger AI actions (`Ask AI about this node`, `Generate component`)
- Search project files by name

Built with **cmdk** (the library behind shadcn/ui's command palette) + Radix Dialog.

---

## 3.11 Theme & Design Tokens

```
Background layers:
  --bg-base:        #0d0d0d   (app background)
  --bg-surface:     #111111   (panels, sidebars)
  --bg-elevated:    #1a1a1a   (cards, dropdowns, nodes)
  --bg-overlay:     #222222   (hover states, tooltips)

Borders:
  --border-subtle:  rgba(255,255,255,0.06)
  --border-default: rgba(255,255,255,0.10)
  --border-strong:  rgba(255,255,255,0.18)

Accent (violet):
  --accent-base:    #7c3aed
  --accent-hover:   #6d28d9
  --accent-light:   #8b5cf6
  --accent-glow:    rgba(124,58,237,0.20)

Node category colors:
  --node-trigger:   #f97316   (orange)
  --node-routing:   #a855f7   (purple)
  --node-auth:      #eab308   (yellow)
  --node-database:  #22c55e   (green)
  --node-logic:     #22c55e   (green, same as database)
  --node-output:    #3b82f6   (blue)
  --node-service:   #ec4899   (pink)

Status colors:
  --status-success: #22c55e
  --status-warning: #f59e0b
  --status-error:   #ef4444
  --status-info:    #3b82f6

Text:
  --text-primary:   #f0f0f0
  --text-secondary: #a0a0a0
  --text-muted:     #525252
  --text-code:      #e5c07b   (warm yellow, Monaco default)
```

---

## 3.12 Key Libraries for the Shell

| Concern | Library |
|---|---|
| Resizable panels | `react-resizable-panels` |
| Command palette | `cmdk` |
| Context menus | `@radix-ui/react-context-menu` |
| Tooltips | `@radix-ui/react-tooltip` |
| Dialogs / modals | `@radix-ui/react-dialog` |
| Tabs (mode switcher) | `@radix-ui/react-tabs` |
| Icons (UI chrome) | `lucide-react` |
| Icons (nodes/canvas) | `@phosphor-icons/react` |
| Drag handles | `@dnd-kit/core` |
| Terminal | `xterm` + `xterm-addon-fit` |
| Scroll areas | `@radix-ui/react-scroll-area` |

---


---

# PART 4 — Frontend Builder

## 4.1 What It Is

The Frontend Builder is a drag-and-drop page editor that produces real React + Tailwind CSS code. It is the visual interface for building the frontend of the user's project. Every action taken in it — dropping a component, changing a color, setting padding — immediately produces and updates real code in the file system. There is no intermediate format, no export step.

It is modeled after Webflow's interaction model but outputs React, not raw HTML/CSS. The user is always building actual components, not a static mockup.

---

## 4.2 The Canvas

The canvas is a browser-frame mock centered in the editor area. It simulates a real browser viewport.

**Browser chrome mock:**
- Three dots (red/yellow/green) top-left — decorative, not functional
- Fake address bar showing `localhost:3000` (or current preview port)
- Reload button — triggers a preview refresh

**The canvas content** is a live iframe rendering the user's actual React app via the spawned dev server. It is not a simulated render — it is the real running output. Selection and manipulation are overlaid on top of the iframe using a transparent interaction layer that intercepts pointer events.

**Viewport controls (toolbar above canvas):**

```
[ ↖ Select ] [ T Text ] [ □ Frame ] [ △ ] [ ○ ] [ ≡ ] [ ⊞ ]   1440 × 900 px   75% [+][-] [ ⤢ ]
```

| Control | Function |
|---|---|
| Select tool | Default. Click to select, drag to multi-select |
| Text tool | Click on canvas to insert inline text |
| Frame tool | Draw a new div/container by dragging |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Shift+Z` |
| Viewport presets | Desktop (1440×900), Laptop (1280×800), Tablet (768×1024), Mobile (375×812) |
| Zoom | Percentage input + `+`/`-` buttons + scroll to zoom |
| Fit to screen | Fit canvas to available area |

Viewport size is stored in Zustand. Changing it resizes the iframe container — the preview reflows exactly as it would on that device.

---

## 4.3 Selection Model

Clicking an element on the canvas selects it. The selection system works through the interaction overlay — mouse events are captured, the overlay identifies the target element by its `data-snap-id` attribute injected during code generation, and selection state is updated in Zustand.

**Visual feedback on selection:**
- Blue border outline around the selected element (`2px solid #3b82f6`)
- Eight resize handles at corners and midpoints (white squares with blue border)
- Label badge above the top-left corner showing the component name: `Hero Section`
- Parent breadcrumb in the canvas toolbar area: `body > section#hero > div.container`

**Multi-select:**
- Drag a selection rectangle on empty canvas area
- Or `Shift+click` to add/remove from selection
- Multi-select only shows shared properties in the Inspector

**Double-click behavior:**
- Double-click a container → enters it (selects its children, narrows context)
- Double-click a text element → enters inline text editing mode

**Hover state:**
- Hovering an element shows a faint blue outline before clicking
- Hover label shows element type in small tooltip

---

## 4.4 Component Model

Every element on the canvas is a **Snap Component** — a React component with a defined schema. The schema specifies what props it accepts, what styles it supports, and how it maps to code.

Each component has (simplified view — the canonical, complete `Component` interface is defined in Part 10.2):
```
{
  id: string              // unique instance ID, e.g. "hero-section-1"
  type: ComponentType     // "Section" | "Button" | "Heading" | etc.
  snapId: string          // data-snap-id injected into DOM for selection
  props: Record<string, unknown>    // component-specific props (text, href, src)
  styles: StyleProperties // margin, padding, width, height, color, etc.
  children: Component[]   // nested children
  bindings: Binding[]     // connections to backend nodes (Part 6)
}
```

This tree is the **visual model** — the in-memory representation of the page. The AST engine converts it to React code and back. It is stored in Zustand and persisted to the project file system as a `.snap/pages/[page].snap.json` file alongside the generated `.jsx` file (see Part 10.4).

---

## 4.5 Dragging Components onto the Canvas

Dragging from the Component Library sidebar uses **dnd-kit**.

**Drag flow:**
1. User grabs a component from the sidebar (dnd-kit draggable)
2. A ghost/preview of the component follows the cursor
3. As the cursor moves over the canvas, drop zones highlight (blue outline on valid containers)
4. Drop targets are determined by the component tree — a `Button` can drop inside a `Section` or `Div` but not inside a `Span`
5. On drop, the component is inserted into the visual model at the correct position in the tree
6. The AST engine immediately generates the corresponding JSX and updates the file
7. Monaco editor reflects the new code within <50ms

**Reordering within a container:**
- Drag an existing element up/down within its parent
- Blue insertion line appears between siblings showing where it will land
- On drop, tree order updates → code order updates

**Nesting:**
- Drag an element onto another element to nest it (with a brief hover delay to distinguish from reorder)
- The target container highlights with a filled blue tint (vs. outline for reorder)

---

## 4.6 Component Library — Full Catalog

### Layout
| Component | Description | Generated code |
|---|---|---|
| Section | `<section>` wrapper with padding | `<section className="...">` |
| Grid | CSS Grid container with column config | `<div className="grid grid-cols-N ...">` |
| Columns | Flex row with equal-width children | `<div className="flex gap-N ...">` |
| Flex Row | `display: flex`, row direction | `<div className="flex ...">` |
| Div | Generic container | `<div className="...">` |
| Container | Max-width centered wrapper | `<div className="max-w-7xl mx-auto ...">` |

### Typography
| Component | Generated code |
|---|---|
| Heading | `<h1>` through `<h6>`, configurable level |
| Paragraph | `<p>` |
| Span | `<span>` |
| Link | `<a href="...">` or Next.js `<Link>` |

### Interactive
| Component | Notes |
|---|---|
| Button | Primary/secondary/ghost variants, configurable |
| Input | Text, email, password, number types |
| Form | Wraps inputs, has onSubmit binding point |
| Select | Dropdown select |
| Checkbox | With label |
| Toggle | Boolean switch |

### Media
| Component | Notes |
|---|---|
| Image | `<img>` with alt, src, object-fit config |
| Video | `<video>` with src, autoplay, controls |
| Icon | Lucide icon picker — searchable, inserts `<LucideIconName />` |
| Divider | `<hr>` with style config |

### Pre-built Sections
Full page sections with multiple nested components, pre-styled. These are the most valuable for fast page building:

| Section | Contents |
|---|---|
| Hero Section | Heading + subheading + CTA button(s) + optional badge |
| Feature Grid | 3-column grid of icon + title + description cards |
| Pricing Table | 2-3 tier cards with feature lists and CTA |
| Testimonials | Quote cards with avatar + name + role |
| CTA Banner | Full-width background + heading + button |
| Navbar | Logo + nav links + CTA button |
| Footer | Links grid + copyright |
| Form Section | Centered form with title + fields + submit |

Pre-built sections are fully editable after placement — they decompose into their individual components in the layer tree.

---

## 4.7 Inspector — Style Properties (Detail)

When an element is selected, the Inspector Panel (right sidebar) shows its properties. Six collapsible sections:

### Size & Position
```
W: [    1440    ]   H: [  auto  ]
X: [       0   ]   Y: [    64  ]
```
- W/H: width and height, accepts px, %, auto, fit-content
- X/Y: only editable when element is `position: absolute`
- Constrain proportions toggle

### Typography (text elements only)
```
Family: [ Inter          ▾ ]
Size:   [ 56  ]  Weight: [ 700 ▾ ]  LH: [ 1.1 ]
Color:  [████] #f0f0f8        Opacity: [ 1  ]
[ Left ] [ Center ] [ Right ] [ Justify ]
```

### Background
```
Fill:  [ Color ● ] [ Gradient ] [ Image ] [ None ]
       [████████] #0d0d0d        Opacity: [ 1  ]
```

### Spacing
```
MARGIN          PADDING
     [  0  ]          [  0  ]
[ 80 ]   [ 80 ]   [ 88 ]   [ 88 ]
     [  0  ]          [  0  ]
```
Individual side control. Click center to link/unlink all sides.

### Border & Radius
```
Width: [ 0 ]  Color: [████] rgba(255,255,255,0)
Radius: [ 0 ] [ 0 ] [ 0 ] [ 0 ]   (per-corner)
```

### Effects
```
[ ○ ] Drop Shadow     → offset X/Y, blur, spread, color
[ ● ] Backdrop Blur   → blur amount
[ ○ ] Opacity
[ ○ ] Transform       → rotate, scale, skew
```

All style changes update Tailwind classes in the generated JSX in real time via the AST engine. The generated class string is always clean — no duplicate or conflicting classes.

---

## 4.8 Layers Panel

Accessible via the sidebar (toggle from Explorer to Layers via an icon button at the top of the sidebar).

Shows the full component tree of the current page as a collapsible list. Mirrors the canvas structure exactly — the tree and the canvas are always in sync.

```
LAYERS
  ▼ body
    ▼ section#hero  ←─ selected (highlighted blue)
      ▼ div.container
          h1  "Build Full-Stack Apps"
          p   "Snap connects..."
        ▼ div.cta-group
            button  "Start Building Free"
            button  "Watch Demo"
    ▼ section#features
      ...
```

- Click a layer → selects that element on canvas
- Drag layers to reorder (same dnd-kit system)
- Eye icon to toggle visibility
- Lock icon to prevent selection on canvas
- Double-click to rename the element's ID

---

## 4.9 Pages Panel

A project has multiple pages. The Pages panel (also in the sidebar) lists them:

```
PAGES                         [+]
  ● index          (home)
    dashboard
    login
    /blog/[slug]   (dynamic)
```

- Click to switch the canvas to that page
- `+` to create a new page — prompts for route path
- Right-click: Rename, Duplicate, Delete
- Dynamic routes (e.g., `/blog/[slug]`) are supported — the builder shows a mock with placeholder data

---

## 4.10 Code Output

Every component and every style change produces real React code. The output follows consistent, readable patterns.

Example — a Hero Section component after styling:

```jsx
// src/pages/index.jsx  (auto-generated, always in sync)

export default function Home() {
  return (
    <main>
      <section
        id="hero"
        className="px-20 py-20 text-center"
        data-snap-id="hero-section-1"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black tracking-tight text-white">
            Build Full-Stack Apps
          </h1>
          <p className="mt-6 text-lg text-gray-400">
            Snap connects your drag-and-drop builder...
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              id="hero-cta"
              data-snap-id="hero-cta-btn"
              data-snap-bind="POST:/api/join"
              className="px-7 py-3 bg-violet-600 rounded-lg font-semibold text-white"
            >
              Start Building Free
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
```

Key conventions in generated code:
- `data-snap-id` on every element — used by the selection overlay to identify elements
- `data-snap-bind` on bound elements — carries the backend binding reference (Part 6)
- Tailwind classes for all styling — no inline styles, no CSS modules
- Clean indentation, readable structure — a developer can edit this directly and it reads back into the visual model
- No Snap-specific imports or runtime dependencies in the generated output

---

## 4.11 Undo / Redo

Full undo/redo stack for all visual actions. Implemented via Zustand middleware (`zustand/middleware` immer + a history slice).

Every action that mutates the visual model is recorded as a discrete operation:
- Component added
- Component deleted
- Style property changed
- Component moved/reordered
- Text edited

`Ctrl+Z` reverts the last operation. `Ctrl+Shift+Z` re-applies it. The undo stack is per-page and persists for the session (not across reloads for MVP).

---


---

# PART 5 — Backend Canvas

## 5.1 What It Is

The Backend Canvas is a node-based visual editor for building the backend of the user's full-stack application. It is not a diagram. It is not documentation. Every node on the canvas is a piece of running code — a route handler, a database query, a validation middleware, an email sender. Connecting two nodes wires their code together. The canvas IS the backend.

The mental model is: **IcePanel's visual clarity + real code output**. Like IcePanel you can see your entire API architecture at a glance. Unlike IcePanel, what you see is what runs.

Built on **React Flow**. React Flow handles pan, zoom, edge routing, selection, minimap, and node drag. Snap provides all node types, edge types, and the code generation engine.

---

## 5.2 Canvas Mechanics

**Navigation:**
- Scroll to zoom in/out
- Click and drag on empty space to pan
- `Ctrl+Scroll` for zoom
- `Space + drag` for pan (alternative)
- Double-click on empty canvas → opens Add Node quick menu

**Canvas toolbar (top of editor area):**
```
[ ↖ ] [ ✥ ] [ ⤢ ]   [←] [→]   [ ⊞ ] [ ⤡ ] [ ◎ ]
```
| Button | Function |
|---|---|
| Select | Default pointer tool |
| Pan | Hand tool for panning |
| Fit view | Fit all nodes into view |
| Undo / Redo | Canvas-level undo/redo |
| Add node | Opens node picker |
| Fullscreen | Expand canvas to full editor area |
| Minimap | Toggle minimap (bottom-right corner) |

**Route indicator bar** (below main toolbar, above canvas):
```
  POST  /api/join    ● LIVE
```
Shows the currently focused route. Click to switch between routes. Pill badge shows live/draft status.

**Minimap:** Bottom-right corner of the canvas. Shows node positions as colored dots matching their category color. Viewport rectangle shows current view position.

---

## 5.3 Node Anatomy

Every node has the same structural anatomy regardless of type.

```
┌─────────────────────────────────────┐
│ ⬡  HTTP Request         TRIGGER     │  ← header: icon + name + category badge
├─────────────────────────────────────┤
│  Method      POST                   │  ← config fields (key: value pairs)
│  Path        /api/join              │
│  Body        email, name            │
├─────────────────────────────────────┤
│                        ● Request    │  ← output ports (right side)
└─────────────────────────────────────┘
```

**Header:**
- Left: category icon (colored to match category)
- Center: node name (editable on double-click)
- Right: category badge (e.g., `TRIGGER`, `DATABASE`, `MIDDLEWARE`)

**Body:** Key-value pairs showing the node's current configuration. These are previews — full config is in the Inspector panel when the node is selected.

**Ports:**
- Input ports on the LEFT side (accept incoming connections)
- Output ports on the RIGHT side (send outgoing connections)
- Ports are colored dots: white for data flow, orange for error paths
- Port labels describe what they carry (`Request`, `Valid`, `Error`, `Result`, `Success`)

**Node header colors match category:**
- `TRIGGER` nodes → orange header accent
- `HTTP/ROUTING` nodes → purple header accent
- `AUTH/SECURITY` nodes → yellow header accent
- `DATABASE` nodes → green header accent
- `LOGIC` nodes → green header accent
- `OUTPUT` nodes → blue header accent
- `SERVICE` nodes → pink header accent

---

## 5.4 Node Types — Complete Catalog

### TRIGGERS (orange)
These are always the starting point of a route. Every flow begins with one trigger.

| Node | Config | Output ports |
|---|---|---|
| **HTTP Request** | Method (GET/POST/PUT/DELETE/PATCH), Path, Body schema | `Request` |
| **Schedule** | Cron expression, Timezone | `Trigger` |
| **Webhook** | Provider (Stripe, GitHub, etc.), Secret | `Payload`, `Error` |

### HTTP / ROUTING (purple)
| Node | Config | Ports |
|---|---|---|
| **Route Handler** | Express-style route, method | `Request`, `Response` |
| **Router** | Prefix, child routes | `Request` |
| **Redirect** | Target URL, status code (301/302) | `In` |

### AUTH / SECURITY (yellow)
| Node | Config | Ports |
|---|---|---|
| **JWT Auth** | Secret key, expiry | `In` → `Authenticated`, `Error` |
| **Rate Limit** | Max requests, window (seconds) | `In` → `Allowed`, `Blocked` |
| **CORS** | Allowed origins, methods, headers | `In` → `Out` |
| **Validate** | Field rules (required, type, min, max, regex) | `In` → `Valid`, `Error` |

The Validate node (visible in the mockup) shows its field rules inline:
```
  email    required, email
  name     string, min:2
  On fail  400 Bad Request
```

### DATABASE (green)
| Node | Config | Ports |
|---|---|---|
| **Query** | Table, WHERE conditions, SELECT fields, ORDER BY, LIMIT | `In` → `Result`, `Error` |
| **Insert** | Table, data fields (name + type + required flag), conflict handling | `In` → `Result`, `Error` |
| **Update** | Table, WHERE conditions, SET fields | `In` → `Result`, `Error` |
| **Delete** | Table, WHERE conditions | `In` → `Result`, `Error` |

The Insert node shows its data fields inline:
```
  Table     waitlist
  Data      body.email, body.name
  Return    lastID, changes
```

### LOGIC (green)
| Node | Config | Ports |
|---|---|---|
| **Condition** | If/else expression using node context variables | `In` → `True`, `False` |
| **Transform** | JavaScript expression to reshape data | `In` → `Out` |
| **Loop** | Iterate over array, inner flow per item | `In` → `Each`, `Done` |
| **Merge** | Combine outputs from multiple paths | `A`, `B` → `Out` |

### OUTPUT (blue)
| Node | Config | Ports |
|---|---|---|
| **Send Response** | Status code, body expression, headers | `Success`, `Error` → (terminates) |

Send Response shown in mockup:
```
  Status   200 OK
  Body     {"success":true}
  Headers  Content-Type: json
  — #hero-cta (click) —    ← frontend binding badge
```

### SERVICE (pink)
| Node | Config | Ports |
|---|---|---|
| **Send Email** | To (expression), Subject, Template file | `Trigger` → `Sent`, `Error` |
| **Send SMS** | Provider, To, Body | `Trigger` → `Sent`, `Error` |
| **Call Webhook** | URL, method, body | `Trigger` → `Success`, `Error` |
| **Storage Upload** | Bucket, key, source field | `In` → `URL`, `Error` |

---

## 5.5 Edges (Connections)

Edges connect an output port on one node to an input port on another.

**Edge types:**
- **Data flow edge** — default, curved Bezier. White/light grey. Carries data from one node to the next.
- **Error edge** — orange/red. From `Error` output ports. Visually distinct.
- **Conditional edge** — dashed. From `True`/`False` ports on Condition nodes.

**Creating an edge:**
- Hover over an output port → it highlights with a glow
- Click and drag from the port → a floating edge appears following the cursor
- Drop onto a valid input port → edge snaps into place
- Invalid targets show a red indicator when hovering

**Edge labels:** Edges can have a small label in the middle showing the data being passed (e.g., `req.body`). Configurable in the Inspector.

**Deleting edges:** Click an edge to select it → `Delete` key. Or right-click → Remove.

---

## 5.6 Code Generation Per Node

Each node generates a discrete piece of code. The full canvas for a route generates a complete route handler. The exact output shape depends on the project's chosen backend (Part 8.2). The default backend is **Next.js API Routes (Pages Router) + Prisma**, shown here for the `POST /api/join` route from the mockup:

```javascript
// src/pages/api/join.js  (auto-generated — Next.js API Route)

import { prisma } from '@/server/db'
import { sendEmail } from '@/server/services/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // [Validate node]
  const { email, name } = req.body
  if (!email || typeof name !== 'string' || name.length < 2) {
    return res.status(400).json({ error: 'Bad Request' })
  }

  // [DB Insert node]  — Prisma upsert (INSERT OR IGNORE equivalent)
  const result = await prisma.waitlist.upsert({
    where:  { email },
    update: {},
    create: { email, name },
  })

  // [Send Email node]
  await sendEmail({
    to: email,
    subject: 'Welcome to the waitlist!',
    template: 'welcome.html',
  })

  // [Send Response node]
  res.status(200).json({ success: true })
}
```

> If the user chose **NestJS** or **Express** as the backend, the same node graph generates an idiomatic controller/route for that framework instead (e.g., `@Post()` handler in NestJS, `router.post()` in Express). If the user chose **Drizzle** or raw queries instead of Prisma, the DB Insert node emits the corresponding query. The node graph is the source of truth; the emitted code adapts to the stack.

Key principles:
- Each node's code block is preceded by a comment identifying the node
- The overall structure is standard for the chosen framework — no Snap-specific runtime
- Generated code is readable, editable, and lintable
- Removing a node removes its code block and reconnects adjacent logic where possible

---

## 5.7 Inspector Panel — Node Selected

When a node is selected, the right Inspector panel shows its full configuration. Documented in Part 3 (section 3.7) but expanded here:

**For any node:**
1. **Configuration section** — all node-specific fields as form inputs (text fields, selects, toggles)
2. **Data Fields section** — for nodes that define schemas (Validate, Insert) — add/remove/edit fields with name, type, and constraint
3. **Frontend Binding section** — shows any frontend elements bound to this node (covered in Part 6)
4. **Generated Code section** — read-only Monaco snippet showing exactly what code this node produces right now. Updates live as config changes. Has a copy button.

The Generated Code preview in the Inspector is one of Snap's highest-value UI moments — a developer can see the exact output of what they're configuring, which builds trust and understanding simultaneously.

---

## 5.8 Route Management

The backend canvas organizes work by route. Each route is a separate canvas. Routes are listed in the activity bar's node view or via the route indicator dropdown.

**Route list:**
```
ROUTES                           [+]
  POST  /api/join       ● live
  GET   /api/users      ● live
  POST  /api/auth/login ● live
  GET   /api/health     ● live
```

Creating a new route:
1. Click `+` in route list, or drag an HTTP Request trigger node onto a blank canvas
2. Route is created with default GET / path
3. Configure method and path in Inspector

Each route's canvas is stored as a separate JSON file in the project, mapping to a separate route file in the generated code.

---

## 5.9 Zoom, Minimap & Navigation

React Flow's built-in features, configured for Snap:

- **Zoom range:** 0.1x to 2x
- **Fit view** (`Ctrl+Shift+F`): fits all nodes into the viewport with padding
- **Minimap:** bottom-right, 160×100px, colored dots per node category
- **Node search** (`Ctrl+F` on canvas): highlights matching nodes, pans to them
- **Groups / frames:** nodes can be grouped with a labeled frame (drag to create, name it, e.g., "Auth Flow"). Frame is a visual organizer — no code impact.

---

## 5.10 Canvas State in Zustand

The backend canvas state is a slice in Zustand. Nodes and edges belong to a **route** — the canvas renders the nodes/edges of whichever route is active. (This is the canonical shape, matching `CanvasSlice` in Part 10.3.)

```typescript
interface CanvasSlice {
  routes:          Route[]            // each Route owns its own nodes[] and edges[]
  activeRouteId:   string             // which route's graph is currently shown
  selectedNodeIds: string[]           // selected node IDs on the active route
  viewport:        ReactFlowViewport  // pan/zoom position
}
```

The React Flow component is fed `nodes` and `edges` from the active route (`routes.find(r => r.id === activeRouteId)`). See Part 10.2 for the full `Route`, `BackendNode`, and `BackendEdge` interfaces.

Every node mutation triggers the AST engine to regenerate the corresponding route file. The regeneration is debounced at 150ms to avoid thrashing during rapid config changes.

---


---

# PART 6 — Frontend ↔ Backend Binding System

## 6.1 The Core Problem This Solves

Every full-stack application has the same invisible seam: a frontend element (a button, a form, a data display) must connect to a backend operation (an API call, a database query, an auth check). In traditional development this connection exists only in the developer's head and scattered across files — a `fetch('/api/join')` in a click handler here, a `useEffect` watching query results there. It is implicit, unmapped, and undocumented.

Snap makes this connection **explicit, visual, inspectable, and bidirectional**.

The binding system is the product's most distinctive feature. It is what separates Snap from "Webflow + a separate backend" and makes it a unified development environment.

---

## 6.2 What a Binding Is

A **binding** is a named, typed, directional link between a frontend element and a backend node.

Every binding has:

```typescript
interface Binding {
  id: string                    // unique binding ID
  type: BindingType             // 'action' | 'data' | 'state'
  
  // Frontend side
  elementId: string             // data-snap-id of the frontend element
  elementEvent: string          // 'onClick' | 'onSubmit' | 'onLoad' | 'onChange'
  
  // Backend side
  nodeId: string                // ID of the backend node this binds to
  routeId: string               // which route the node belongs to
  
  // Data mapping
  inputMap: FieldMap[]          // how element data maps to the node's input
  outputMap: FieldMap[]         // how the node's response maps back to the element
  
  // Behavior
  loadingState: boolean         // show loading indicator during call?
  errorHandling: 'silent' | 'toast' | 'inline'
  isCustom: boolean             // true if hand-edited in code, not fully Snap-managed
}

type BindingType = 'action' | 'data' | 'state'

interface FieldMap {
  from: string    // e.g. "form.email" or "response.userId"
  to: string      // e.g. "req.body.email" or "display.text"
}
```

> This is the same `Binding` interface defined canonically in Part 10.2 — repeated here for context.

---

## 6.3 Three Types of Binding

### Type 1 — Action Binding
**Trigger: user event → backend operation**

A user action on a frontend element triggers a backend route. The button fires. The form submits. The API call executes.

Examples:
- `Button#hero-cta onClick → POST /api/join` — clicking the waitlist button triggers the join route
- `Form#login-form onSubmit → POST /api/auth/login` — form submission triggers the login route
- `Button#delete-user onClick → DELETE /api/users/:id` — clicking delete triggers the delete route

This is the most common binding type. It replaces:
```javascript
// what a developer would write manually:
button.addEventListener('click', async () => {
  const res = await fetch('/api/join', { method: 'POST', body: ... })
})
```

### Type 2 — Data Binding
**Backend data → frontend display**

A frontend element's content is populated from the result of a backend query. The data flows into the element on page load or on demand.

Examples:
- `Table#users-list onLoad → GET /api/users` — table populates with user data when page loads
- `Text#user-name onLoad → GET /api/profile` — text displays the logged-in user's name
- `List#blog-posts onLoad → GET /api/posts` — list renders each post from the API

This replaces the manual `useEffect` + `fetch` + `setState` pattern that every developer writes from scratch every single time.

### Type 3 — State Binding
**Backend operation result → frontend state**

A frontend element's visibility, content, or style changes based on a backend operation's result. The UI reacts to what the server returned.

Examples:
- After `POST /api/join` succeeds → `Section#success-message` becomes visible
- After `POST /api/auth/login` fails → `Text#error-message` shows the error text
- After `GET /api/users` → `Badge#user-count` displays `response.total`

---

## 6.4 Creating a Binding — The Workflow

There are three ways to create a binding:

### Method A — From the Frontend (drag from element to node)

1. Select a frontend element on the canvas (e.g., the "Start Building Free" button)
2. In the Inspector panel, open the **Bind** tab
3. The Bind tab shows two sections: **Actions** (events this element can fire) and **Data** (properties this element can receive)
4. Click `+ Add Action` next to `onClick`
5. A binding drawer opens — showing the backend canvas nodes as a searchable list
6. Select the target node (e.g., `DB Insert` in the `POST /api/join` route)
7. The field mapper appears — map `form.email → req.body.email`, `form.name → req.body.name`
8. Configure response behavior (loading state, success action, error handling)
9. Binding is created — immediately visible in both the Inspector and the backend node

### Method B — From the Backend (select node, see bound elements)

1. On the backend canvas, select any node (e.g., `Send Response`)
2. In the Inspector, the **Frontend Binding** section shows which frontend elements are already bound to this node
3. Click `+ Add Binding` → an element picker overlays the frontend canvas
4. Click the frontend element to bind it
5. Field mapper appears, same as Method A

### Method C — Via the Binding Map (global view)

A dedicated view (accessible via Command Palette: "Open Binding Map") shows all bindings in the project as a visual matrix — every frontend element on the left, every backend route on the right, with lines between them for existing bindings. Like a wiring diagram for the entire application. This is the "IcePanel for your connections."

---

## 6.5 The Binding Inspector UI

When a bound element is selected, the Inspector **Bind** tab shows its bindings in full detail:

```
BIND

ACTIONS
  onClick  ──→  POST /api/join
    Input mapping:
      form.email   →  req.body.email
      form.name    →  req.body.name
    On success:
      [ Show #success-section ]
      [ Hide #form-section ]
    On error:
      [ Show inline error in #email-input ]
    Loading:  [ ● ] Show loading spinner on button

  [ + Add Action ]

DATA
  (empty — this element has no data bindings)

  [ + Add Data Source ]
```

The backend node (Send Response) simultaneously shows in its Inspector:

```
FRONTEND BINDING
  #hero-cta  onclick  →  POST /api/join
  [ + Add Binding ]
```

Both are live — editing one updates the other immediately.

---

## 6.6 Field Mapper

When creating or editing a binding, the field mapper shows two columns:

```
ELEMENT DATA              BACKEND INPUT
─────────────────────────────────────────
form.email          →     req.body.email
form.name           →     req.body.name
                          req.body.role   (unmapped — shows as warning)

[ + Add mapping ]         [ Auto-map matching names ]
```

The mapper is aware of:
- **Frontend element's available data** — for a Form, all its input field values. For a Button, its text, its parent form data. For a Table row, all column values.
- **Backend node's expected input** — derived from the Validate node or the Insert node's schema
- **Type compatibility** — warns if `form.age` (string) is mapped to `req.body.age` (number expected)

`Auto-map` attempts to match field names automatically. It handles `email → email`, `user_name → userName` (snake→camel), etc.

---

## 6.7 Response Mapping

After the backend route completes, its response needs to flow back to the frontend. The response mapper handles this:

```
BACKEND RESPONSE          FRONTEND TARGET
─────────────────────────────────────────
response.success    →     (condition: if true)
                            Show #success-banner
                            Hide #cta-form
response.error      →     (condition: if defined)
                            Show #error-message
                            Set #error-message.text = response.error
response.userId     →     Set #user-id-display.text
```

Conditions supported:
- `if truthy` / `if falsy`
- `if equals [value]`
- `if status === 200` / `if status >= 400`

Actions available:
- Show / Hide an element
- Set an element's text content
- Set an element's href
- Navigate to a page (for auth flows, post-submit redirects)
- Trigger another binding

---

## 6.8 What the Code Looks Like

The binding system generates real, standard React code. No runtime library. No Snap SDK. Just hooks and event handlers.

**Example: Button bound to POST /api/join**

```jsx
// src/pages/index.jsx (generated by binding system)

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Generated by binding: hero-cta onClick → POST /api/join
  const joinWaitlist = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await res.json()
      return res.json()
    },
    onSuccess: () => {
      setShowSuccess(true)     // response map: show #success-section
    },
    onError: (err) => {
      setErrorMsg(err.message) // response map: set #error-message.text
    },
  })

  return (
    <main>
      <section id="hero" data-snap-id="hero-section-1">
        {!showSuccess ? (
          <form
            id="cta-form"
            data-snap-id="cta-form"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              joinWaitlist.mutate({
                email: fd.get('email'),
                name: fd.get('name'),
              })
            }}
          >
            <input name="email" type="email" required />
            <input name="name" type="text" minLength={2} required />
            <button
              id="hero-cta"
              data-snap-id="hero-cta-btn"
              data-snap-bind="POST:/api/join"
              type="submit"
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? 'Joining...' : 'Start Building Free'}
            </button>
            {errorMsg && <p id="error-message">{errorMsg}</p>}
          </form>
        ) : (
          <section id="success-section">
            <p>You're on the list!</p>
          </section>
        )}
      </section>
    </main>
  )
}
```

Key things to note about this output:
- Uses `useMutation` from TanStack Query — idiomatic, modern React
- Loading state handled automatically via `isPending`
- `data-snap-id` preserved for visual builder re-reading
- `data-snap-bind` attribute preserved for binding system identification
- Zero Snap runtime — this code runs standalone after ejecting from Snap
- Fully readable by a developer who has never used Snap

**Example: Data binding — table populated from GET /api/users**

```jsx
// Generated by binding: users-table onLoad → GET /api/users

import { useQuery } from '@tanstack/react-query'

export default function Dashboard() {
  // Generated by binding: users-table onLoad → GET /api/users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  return (
    <div data-snap-id="users-table">
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading users</p>}
      {users?.map(user => (
        <div key={user.id} data-snap-id={`user-row-${user.id}`}>
          <span>{user.email}</span>
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 6.9 Binding Indicators on the Canvas

Bindings are visible across both canvases — you never have to "remember" what's wired to what.

**Frontend canvas:**
- Bound elements have a small violet chain-link icon badge in their top-right corner
- Hovering the badge shows a tooltip: `onClick → POST /api/join`
- In the Layers panel, bound elements have a `⇌` icon next to their name

**Backend canvas:**
- Nodes with frontend bindings show a small badge at the bottom of the node body showing the bound element(s): `#hero-cta (click)`
- This badge is visible in the mockup on the `Send Response` node

**Binding Map view:**
- A dedicated full-screen view showing all bindings as lines between the frontend element tree (left) and backend route/node list (right)
- Lines colored by binding type (action=violet, data=blue, state=green)
- Click any line to open the binding editor

---

## 6.10 Binding Validation

The binding system continuously validates bindings and surfaces issues:

| Issue | Detection | Display |
|---|---|---|
| Unmapped required field | Backend node has required input that has no mapped source | Yellow warning on the binding, field shown in red in mapper |
| Type mismatch | Frontend data type doesn't match backend expected type | Orange warning, tooltip explaining the mismatch |
| Broken binding | Bound element was deleted | Red error badge, listed in Problems panel |
| Broken binding | Bound backend node was deleted | Red error badge, listed in Problems panel |
| Circular binding | Response action triggers a binding that triggers this binding | Red error, prevented from saving |

Validation runs on every save and is also available on-demand via `Validate Bindings` in the Command Palette.

---

## 6.11 Reading Bindings Back from Code

Because the binding system writes `data-snap-bind` attributes and `useMutation`/`useQuery` hooks with specific comment markers, the AST engine can read the code and reconstruct the binding state. This is what makes two-way sync work for bindings specifically.

When Snap reads a file, it looks for:
1. `data-snap-bind` attributes → identifies bound elements
2. `// Generated by binding:` comments → identifies binding origin
3. `useMutation` / `useQuery` hook patterns → reconstructs the binding type, route, and field maps

If a developer manually edits the generated code and changes a `useMutation` call, Snap detects the change, updates the binding model in Zustand, and reflects it in the visual binding UI. The binding becomes "custom" (marked with a pencil icon) to indicate it was hand-edited.

---

## 6.12 Binding System Architecture Summary

```
Frontend Canvas                    Backend Canvas
─────────────────                  ─────────────────
Element selected                   Node selected
  └─ Bind tab in Inspector           └─ Frontend Binding section

           ↕  BindingStore (Zustand)  ↕

Binding created / edited
        │
        ▼
   BindingCodeGen
        │
        ├──► Generates useMutation / useQuery hook
        ├──► Generates onClick / onSubmit handler
        ├──► Generates response handler (show/hide/set)
        ├──► Injects data-snap-bind attribute on element
        └──► Updates .snap binding JSON file

        │
        ▼
   AST Engine (Babel)
        │
        ├──► Writes to src/pages/[page].jsx
        └──► Monaco editor updates immediately
```

The binding store is part of Zustand's global state. It serializes to a `.snap/bindings.json` file in the project root, which the AST engine reads to reconstruct binding state from code on project open.

---


---

# PART 7 — Code Editor & Two-Way Sync Engine

## 7.1 What It Is

The Code tab is a full Monaco Editor instance — the same engine that powers VS Code. It shows the actual source files of the user's project. Every change made visually in the Frontend Builder or Backend Canvas appears here immediately. Every change made here reflects back in both visual canvases immediately.

This bidirectional, zero-lag sync is the technical heart of Snap. Everything else depends on it working correctly, quickly, and without data loss.

The sync engine is not a "code export" button. It is not a one-way compile. It is a permanent, live, bidirectional bridge between two representations of the same codebase.

---

## 7.2 Monaco Editor Setup

**Configuration:**

```typescript
// The Monaco instance is initialized once and persists for the project session
const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
  theme: 'snap-dark',           // custom theme built on vs-dark base
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 13,
  lineHeight: 22,
  letterSpacing: 0.3,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  bracketPairColorization: { enabled: true },
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  inlayHints: { enabled: 'on' },
  renderLineHighlight: 'all',
  padding: { top: 16, bottom: 16 },
}
```
(Format-on-save is not a Monaco construction option — it is handled by Snap on the save command via Prettier; see 7.9.)

**Custom theme** (`snap-dark`): Built on top of `vs-dark`. Key changes:
- Background: `#0d0d0d` (matches IDE shell)
- Keywords: `#c792ea` (purple)
- Strings: `#c3e88d` (green)
- Functions: `#82aaff` (blue)
- Comments: `#546e7a` (muted, italic)
- `data-snap-id` attribute values: highlighted with a subtle violet underline — visually distinct so developers can see Snap's markers

**TypeScript IntelliSense** — enabled via Monaco's built-in TypeScript language service. Type definitions for the user's installed packages are fetched from a local `node_modules` cache and loaded into Monaco's `extraLibs`. Autocomplete works for React, Tailwind (via class name suggestions), and all project imports.

**File tabs** — open files appear as tabs across the top of the editor area (same as VS Code). Tabs show:
- Filename with file type icon
- Dirty indicator (dot) when unsaved
- Close button on hover
- Middle-click to close

**Breadcrumb** — below the tab bar, shows the current path (`src > pages > index.jsx`) and is clickable to navigate up the tree.

---

## 7.3 The Sync Engine — Architecture

The sync engine is a dedicated package (`packages/ast-engine`) that mediates all transformations between the visual model and code.

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYNC ENGINE                              │
│                                                                 │
│   Visual Model (Zustand)          Code (file system)           │
│         │                                 │                    │
│         ▼                                 ▼                    │
│   VisualToCode                      CodeToVisual               │
│   (Serializer)                      (Parser)                   │
│         │                                 │                    │
│         └──────────→  AST  ←─────────────┘                    │
│                   (Babel parse/generate)                        │
│                                                                 │
│   Trigger: visual change          Trigger: file save / edit    │
│   Direction: visual → AST → file  Direction: file → AST → visual│
└─────────────────────────────────────────────────────────────────┘
```

**Two directions, one pipeline:**

**Direction A — Visual → Code (most common)**
1. User makes a visual change (drops a component, changes a color, connects a node)
2. Zustand store updates immediately (optimistic, instant UI)
3. The `VisualToCode` serializer receives the updated visual model
4. It constructs an AST using Babel's AST builders (`@babel/types`)
5. `@babel/generator` converts the AST to formatted code string
6. The file is written to the filesystem via the API route (`/api/project/write-file`)
7. Monaco's `editor.getModel().setValue()` is called with the new code
8. Monaco's cursor position and scroll state are preserved during the update
9. Total time target: **<50ms** from visual change to code visible in Monaco

**Direction B — Code → Visual (less common but critical)**
1. Developer edits code directly in Monaco
2. Changes are batched on a 300ms debounce (avoids parsing on every keystroke)
3. After debounce, the `CodeToVisual` parser receives the new code
4. Babel's `@babel/parser` parses it into an AST
5. `@babel/traverse` walks the AST, extracting:
   - JSX elements with their `data-snap-id` attributes
   - `className` strings → Tailwind classes → style properties
   - `data-snap-bind` attributes → binding references
   - `useMutation`/`useQuery` hooks with comment markers → binding definitions
6. The extracted data rebuilds the visual model in Zustand
7. The frontend canvas re-renders with the updated component tree
8. The backend canvas updates if route handler code changed
9. Total time target: **<300ms** from code edit to visual updated

---

## 7.4 AST Engine — Deep Internals

The AST engine is the most critical package in the codebase. It must handle real-world code gracefully, including hand-edited code that deviates from the generated format.

### Parsing Strategy

```typescript
// packages/ast-engine/src/parser.ts

import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

export function parseFileToVisualModel(code: string): VisualModel {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    // Tolerant mode — keep parsing even with syntax errors
    errorRecovery: true,
  })

  const components: Component[] = []
  const bindings: Binding[] = []

  traverse(ast, {
    JSXElement(path) {
      const snapId = getAttr(path.node, 'data-snap-id')
      if (!snapId) return  // only track Snap-managed elements

      components.push({
        snapId,
        type: inferComponentType(path.node),
        props:  extractProps(path.node),
        styles: extractTailwindStyles(path.node),
        children: [],  // filled by parent traversal
      })
    },

    CallExpression(path) {
      // Detect useMutation hooks with binding comment markers
      if (isUseMutation(path.node)) {
        const comment = getLeadingComment(path)
        if (comment?.includes('Generated by binding:')) {
          bindings.push(extractBindingFromMutation(path.node, comment))
        }
      }
    }
  })

  return { components: buildTree(components), bindings }
}
```

### Tailwind → Style Property Mapping

The parser converts Tailwind class strings back to structured style properties:

```typescript
// "px-20 py-20 text-center bg-gray-950 text-white"
// →
{
  paddingLeft: '80px',   // px-20 = 5rem = 80px
  paddingRight: '80px',
  paddingTop: '80px',
  paddingBottom: '80px',
  textAlign: 'center',
  backgroundColor: '#030712',  // gray-950
  color: '#ffffff',
}
```

This mapping uses a pre-built lookup table of all Tailwind v3 utility classes → CSS properties. Custom arbitrary values (`px-[37px]`) are parsed with a regex extractor.

### Conflict Resolution

When code is edited manually and diverges from the expected generated format, the AST engine enters "partial sync" mode:

- Elements with `data-snap-id` → synced normally
- Elements without `data-snap-id` → treated as "custom code blocks", shown in the Layers panel as `<custom>` nodes, not editable visually
- Hooks without the `// Generated by binding:` comment → not treated as bindings, left alone

This means a developer can freely add code that Snap doesn't understand — it will be preserved, just not represented visually.

---

## 7.5 File Watching & External Changes

If a developer edits a file outside of Snap (in their own editor, via a script, via git checkout), Snap detects the change via filesystem watching (`chokidar` on the server-side process) and triggers a Direction B sync.

```
External file edit (any editor)
        │
        ▼
chokidar file watcher (server)
        │
        ▼
WebSocket event → browser
        │
        ▼
AST Engine parses new content
        │
        ▼
Visual model updates
        │
        ▼
Canvas re-renders + Monaco gets new content
```

A toast notification appears: `"index.jsx updated externally — canvas refreshed"` with an undo option (reverts to last Snap-generated version).

---

## 7.6 The Sync Status Indicator

Visible in the title bar at all times:

| State | Display | Meaning |
|---|---|---|
| Idle | `● Synced` (green) | Visual and code are identical |
| Syncing visual→code | `⟳ Syncing` (amber, spinning) | Code is being written from visual change |
| Syncing code→visual | `⟳ Reading` (amber, spinning) | Visual is being updated from code change |
| Conflict | `⚠ Conflict` (orange) | AST parse found something it can't represent visually |
| Error | `✕ Sync Error` (red) | Parse or write failed — code unchanged, visual unchanged |

Also visible in Monaco's status bar: `⇌ Synced with Visual Builder` (bottom right of editor).

---

## 7.7 Multi-File Editing

The Code tab shows one file at a time but tracks multiple open files via tabs. The sync engine manages all open files simultaneously.

**File tree** in the Explorer sidebar shows the full project structure. Clicking a file opens it in a new Monaco tab.

**Supported file types and their sync behavior:**

| File type | Visual sync | Notes |
|---|---|---|
| `src/pages/*.jsx` | Full sync | Page files — managed by Frontend Builder |
| `src/pages/api/*.js` | Full sync | API routes — managed by Backend Canvas (default stack) |
| `src/components/*.jsx` | Partial sync | Custom components shown as black-box elements in builder |
| `*.css` / `*.module.css` | No visual sync | Editable in code only |
| `prisma/schema.prisma` | Schema sync | Reflected in Database tab |
| `package.json` | No visual sync | Editable in code only |
| `.env` | Hidden | Never shown in Monaco |

---

## 7.8 Diff View

Monaco's built-in diff editor is available for:
- Comparing the current file to its last committed git state (`Alt+D`)
- Showing what changed after an AI-generated code action (Part 9)
- Reviewing changes before a deploy

The diff view uses the same `snap-dark` theme with green/red line highlighting.

---

## 7.9 Format on Save

On every save (`Ctrl+S`):
1. **Prettier** formats the file (config from project's `.prettierrc` or Snap's default: 2-space indent, single quotes, no semicolons)
2. **ESLint auto-fix** applies any auto-fixable lint rules
3. The formatted code is synced back to Monaco
4. If the format changed anything visible (e.g., class order), the visual model is updated accordingly

This ensures the generated code is always clean regardless of how quickly visual changes accumulate.

---

## 7.10 Keyboard Shortcuts in Code Mode

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save + format |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo (Monaco native) |
| `Ctrl+/` | Toggle line comment |
| `Ctrl+D` | Select next occurrence |
| `Ctrl+Shift+K` | Delete line |
| `Alt+↑/↓` | Move line up/down |
| `Ctrl+Space` | Trigger IntelliSense |
| `F12` | Go to definition |
| `Shift+F12` | Find all references |
| `F2` | Rename symbol |
| `Alt+D` | Open diff view (vs. last git state) |
| `Ctrl+\`` | Focus terminal |
| `Ctrl+1-5` | Switch mode tabs (title bar) |

---

## 7.11 The Performance Contract

The sync engine has strict performance targets. If these are violated, the two-way sync feels laggy and breaks trust:

| Operation | Target | Failure mode |
|---|---|---|
| Visual change → Monaco update | <50ms | Debounce + batch multiple rapid changes |
| Code edit → canvas update | <300ms | Debounce at 300ms, skip if file is >500 lines (show warning instead) |
| File open in Monaco | <100ms | Lazy-load large files, show loading state |
| Tailwind class parse (per element) | <5ms | Precomputed lookup table, no regex at runtime |
| Full page AST parse | <80ms | Cache AST between parses, only re-parse changed subtrees |

The 50ms visual→code target is achievable because the generated code is structured and predictable. The 300ms code→visual target requires the partial-sync approach — never blocking on elements that can't be parsed.

---


---

# PART 8 — Project Creation Flow & Dashboard

## 8.1 The Dashboard

The dashboard is what the user sees before entering any project. It is the "Firebase Console home page" of Snap — a clean, professional project management surface.

Route: `/dashboard`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Snap  [logo]                         [avatar]  [settings]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Projects                    [+ New Project]           │
│  ─────────────────────────────────────────────             │
│                                                             │
│  [Search projects...]    [Sort: Recent ▾]  [⊞ Grid  ≡ List]│
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  my-saas     │  │  blog-app    │  │  e-commerce  │     │
│  │              │  │              │  │              │     │
│  │  Next.js     │  │  Next.js     │  │  Next.js     │     │
│  │  PostgreSQL  │  │  PostgreSQL  │  │  PostgreSQL  │     │
│  │              │  │              │  │              │     │
│  │  2 days ago  │  │  5 days ago  │  │  1 week ago  │     │
│  │  [Open] [⋮]  │  │  [Open] [⋮]  │  │  [Open] [⋮]  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Project card shows:**
- Project name
- Stack summary (framework + database)
- Last modified timestamp (relative: "2 days ago")
- `Open` button → opens the IDE workspace
- `⋮` menu → Rename, Duplicate, Export, Delete

**Top bar:**
- Left: Snap logo
- Right: user avatar (click → account menu: profile, billing, sign out)

**Search** — filters project cards in real time by name. Client-side, no API call needed.

**Sort options:** Most recent (default), Name A→Z, Name Z→A, Date created.

**View modes:** Grid (3-column cards, default) and List (dense rows with more metadata visible).

**Empty state** (new user, no projects):
```
     ∅
  No projects yet

  Start building your first full-stack app.

        [ + Create New Project ]
```

---

## 8.2 New Project — The Creation Wizard

Clicking `+ New Project` opens a multi-step modal wizard. Inspired by Firebase's "Create project" flow but far more detailed — because Snap needs to know the full stack upfront to scaffold correctly.

The wizard is a **step indicator + form** inside a centered modal (`max-w-2xl`, dark card on dimmed backdrop).

```
  ●━━━●━━━○━━━○━━━○
  1   2   3   4   5
```

Five steps, each saved as the user progresses (no data lost if they close and reopen).

---

### Step 1 — Project Basics

```
  Create New Project

  Project name
  [ my-awesome-app                    ]
  Letters, numbers, and hyphens only.

  Project location (path)
  [ /Users/rushi/projects/            ] [Browse]
  The folder where your project files will live.

  Description (optional)
  [ A full-stack app built with Snap  ]

                              [ Cancel ]  [ Next → ]
```

- **Project name** — validated: lowercase, alphanumeric + hyphens, max 50 chars. Also used as the folder name.
- **Location** — a path input. On web (no native file picker), this is a text field. The server validates the path exists and is writable. For MVP: projects are stored in a managed directory under Snap's server root (`~/.snap/projects/`), and the path field is pre-filled.
- **Description** — optional, shown on dashboard card.

---

### Step 2 — Framework & Language

```
  Choose your stack

  Frontend framework
  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │  ▲ Next.js      │  │  ⚡ Vite+React  │  │  (coming soon)  │
  │  Recommended    │  │                 │  │  Vue / Svelte   │
  └─────────────────┘  └─────────────────┘  └─────────────────┘
  [●] Next.js selected

  Language
  ( ● ) TypeScript  (recommended)
  ( ○ ) JavaScript

  Backend
  ( ● ) Next.js API Routes   — same project, simple setup
  ( ○ ) NestJS               — separate server, structured
  ( ○ ) Express (minimal)    — lightweight, full control

                              [ ← Back ]  [ Next → ]
```

- Framework tiles are clickable cards with icon + name + optional badge
- Language toggle (TypeScript default)
- Backend radio — defaults to Next.js API Routes for simplicity. NestJS is recommended for complex apps (tooltip explains the difference).

---

### Step 3 — Database & ORM

```
  Database setup

  Database
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ 🐘 PostgreSQL│  │  SQLite      │  │  MySQL       │
  │  Recommended │  │  Zero setup  │  │              │
  └──────────────┘  └──────────────┘  └──────────────┘

  ORM
  ( ● ) Prisma   — type-safe, auto-generated types, migrations
  ( ○ ) Drizzle  — lightweight, SQL-first
  ( ○ ) None     — raw queries

  Connection
  ( ● ) Snap manages it   — automatic local DB setup
  ( ○ ) I'll connect my own
        [ Connection string:                          ]

                              [ ← Back ]  [ Next → ]
```

- **Snap manages it** (default): for MVP, Snap spins up a local SQLite or PG instance automatically. User doesn't need to configure anything.
- **Own connection**: power user option — paste a DATABASE_URL and Snap uses it.

---

### Step 4 — Features & Integrations

```
  What does your app need?

  [ ✓ ] Authentication
        ( ● ) Better Auth   ( ○ ) Auth.js   ( ○ ) None
        Providers: [ ✓ ] Email/Password  [ ✓ ] Google  [ ] GitHub  [ ] Apple

  [ ✓ ] File Storage
        ( ● ) Local (MVP)   ( ○ ) S3   ( ○ ) Supabase Storage

  [   ] Email
        Provider: ( ○ ) Resend   ( ○ ) SendGrid   ( ○ ) SMTP

  [   ] Payments
        Provider: ( ○ ) Stripe

  [   ] Real-time / WebSockets
        ( ○ ) Socket.IO

  [   ] Search
        ( ● ) PostgreSQL FTS   ( ○ ) Meilisearch

                              [ ← Back ]  [ Next → ]
```

Each feature is a checkbox. Checking it expands a sub-panel with configuration options. Unchecked features are not scaffolded at all — no dead code in the project.

This is one of Snap's highest-value setup moments. A developer configuring this for a new SaaS gets a production-ready skeleton in 30 seconds instead of 2 hours.

---

### Step 5 — UI Kit & Styling

```
  Visual setup

  UI Component Library
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  MUI         │  │  shadcn/ui   │  │  Mantine     │  │  None        │
  │  Material UI │  │  Radix-based │  │              │  │  Tailwind    │
  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

  Styling
  [ ✓ ] Tailwind CSS  (required — used by Snap's visual builder)

  Icon Library
  [ ✓ ] Lucide React   [ ] Phosphor Icons   [ ] React Icons

  Font
  ( ● ) Geist (recommended)
  ( ○ ) Inter
  ( ○ ) Custom Google Font: [            ]

  Default color scheme
  [████] Primary   #7c3aed    [████] Background  #0d0d0d    (presets: ○ ○ ○ ● ○)

                              [ ← Back ]  [ Create Project ✓ ]
```

The color scheme picker has 5 preset palettes (dark violet, dark blue, dark green, light neutral, custom). This sets the base Tailwind config and MUI theme for the generated project.

---

## 8.3 Project Scaffolding — What Happens After "Create"

When the user clicks `Create Project`, a scaffolding process runs on the server. A progress screen replaces the wizard:

```
  Creating your project...

  ✓  Scaffolding directory structure
  ✓  Installing dependencies (npm install)
  ✓  Setting up database
  ✓  Configuring authentication
  ⟳  Generating starter pages...
  ○  Starting dev server
  ○  Opening workspace
```

Each step is a real server-side operation streamed via WebSocket. The user sees live progress.

**What gets generated:**

```
my-app/
├── src/
│   ├── pages/
│   │   ├── index.jsx          ← starter home page (pre-built Hero section)
│   │   ├── dashboard.jsx      ← empty dashboard page
│   │   ├── login.jsx          ← auth page (if auth selected)
│   │   └── api/               ← Next.js API Routes (backend, default stack)
│   │       ├── auth/[...all].js  ← if auth selected
│   │       └── health.js      ← GET /api/health (always included)
│   ├── components/
│   │   └── ui/                ← MUI/shadcn wrappers, Snap-compatible
│   ├── server/
│   │   ├── db.js              ← Prisma client singleton
│   │   └── services/          ← email, storage, etc. (per features chosen)
│   └── styles/
│       └── globals.css
├── prisma/
│   └── schema.prisma          ← initial schema with User model if auth selected
├── .snap/                     ← Snap metadata (committed to git — it's the visual model)
│   ├── project.json
│   ├── pages/
│   │   └── index.snap.json    ← visual model for src/pages/index.jsx
│   └── bindings.json          ← all binding definitions
├── .env                       ← DATABASE_URL, AUTH_SECRET, etc. (git-ignored)
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

> If the user chose NestJS/Express instead of Next.js API Routes, the backend lives in a separate `server/` app with its own `routes/` directory instead of `src/pages/api/`.

The starter home page is NOT a blank page. It is a real, styled page using the chosen UI kit and color scheme. A hero section with placeholder content — ready to be modified, not starting from zero.

After scaffolding completes, Snap automatically:
1. Runs `npm install`
2. Runs `prisma generate` + `prisma db push` (if database selected)
3. Starts the dev server (`npm run dev`)
4. Opens the IDE workspace at `/project/[id]` — defaulting to the Frontend Builder tab showing the generated home page

---

## 8.4 Project Settings

Accessible via `Settings` mode tab in the IDE title bar.

Sections:
- **General** — rename project, change description, danger zone (delete project)
- **Stack** — view the chosen stack. Some things are re-configurable (add auth later, add email service). Others are locked post-creation (changing DB type requires migration).
- **Environment Variables** — a UI for managing `.env` values. Add/edit/delete key-value pairs. Values are masked (shown as `••••••`) unless toggled visible. Never synced to version control.
- **Dev Server** — port configuration, start/stop/restart buttons for the spawned user project process
- **Snap Metadata** — toggle for showing the `.snap/` folder in Explorer, option to eject (removes all `data-snap-id` attributes and `.snap/` folder from the project)

---

## 8.5 The Eject Option

Snap is non-destructive. A user can eject at any time.

Ejecting does three things:
1. Removes all `data-snap-id` attributes from JSX files (via an AST pass)
2. Removes all `data-snap-bind` attributes from JSX files
3. Removes the `.snap/` metadata directory

The result is a clean, standard codebase with no Snap footprint. The developer can continue building it in any editor. This is a promise — and it is documented prominently during onboarding and in project settings.

---


---

# PART 9 — AI Integration Layer

## 9.1 The Principle

AI in Snap is a productivity multiplier, not the product. The platform is fully functional without AI. A developer can build a complete, production-ready full-stack application using only the visual builders and code editor.

What AI does is compress time — leveraging the rich context that already exists in Snap (the visual model, the backend canvas graph, the binding map, the schema, the project stack) to give responses and generate code that is unusually accurate compared to a generic chat interface.

The key insight: **most AI coding tools have no context**. They get a prompt and a file. Snap's AI has the entire architecture — every node, every binding, every page, every schema field — as structured data it can reason over. This is a structural advantage that compounds as the project grows.

AI never silently modifies files. Every AI action produces a diff that the developer reviews before applying. This is non-negotiable.

---

## 9.2 AI Entry Points

There are four ways to invoke AI in Snap. Each is context-aware to where the user currently is.

### 1. AI Panel (sidebar)
Accessible via the activity bar's brain/sparkle icon. A persistent chat panel in the sidebar. Conversations are project-scoped — history is saved per project.

```
AI ASSISTANT
─────────────────────────────
  ↑ Earlier messages...

  [user]
  Add email validation to
  the /api/join route

  [snap ai]
  I'll add email validation
  to the Validate node in
  POST /api/join.

  Here's what I'll change:
  ┌──────────────────────┐
  │ + email: required,   │
  │         email format │
  │ + Reject if invalid: │
  │   400 { error: "..." }│
  └──────────────────────┘
  [ Apply ]  [ Edit ]  [ Dismiss ]
─────────────────────────────
  [ Ask anything about your project... ]  [↑]
```

### 2. Inline Code Suggestions (Monaco)
While in the Code tab, `Ctrl+I` opens an inline AI input directly in the editor (Cursor-style). The AI sees the current file + cursor context + the visual model for this file.

```javascript
  // User types:  // TODO: validate that email is unique before inserting
  // Presses Ctrl+I, types: "implement this"
  // AI generates the check inline, shows as ghost text
  // Tab to accept, Escape to dismiss
```

### 3. Canvas AI (right-click on canvas)
Right-clicking on empty canvas space (Frontend or Backend) shows an AI option: `✦ Generate with AI`.

- **Frontend canvas:** opens a prompt like "Add a pricing section with 3 tiers" → generates and places the components
- **Backend canvas:** opens a prompt like "Add a rate-limited POST route for user registration" → generates the full node graph for that route

### 4. Inspector AI Assist
When a node or element is selected, a small `✦` button appears in the Inspector panel header. Clicking it opens a focused AI prompt for that element: "Suggest improvements", "Explain what this does", "Add error handling".

---

## 9.3 Context Package — What the AI Knows

Before every AI request, Snap assembles a **context package** — a structured summary of the project sent alongside the user's prompt. This is what makes Snap's AI dramatically more accurate than a generic assistant.

```typescript
interface AIContextPackage {
  // Project identity
  projectName: string
  stack: StackConfig              // framework, database, auth, etc.

  // Current file / view
  activeFile: string              // e.g. "src/pages/index.jsx"
  activeMode: 'frontend' | 'backend' | 'database' | 'code'
  selectedElementId?: string      // if something is selected
  selectedNodeId?: string

  // Architecture snapshot
  pages: PageSummary[]            // all pages with their component trees (summarized)
  routes: RouteSummary[]          // all backend routes with node types and connections
  bindings: BindingSummary[]      // all frontend↔backend bindings
  schema: PrismaSchema            // the full Prisma schema

  // Current file content
  currentFileCode: string

  // Relevant files (auto-selected based on query)
  relatedFiles: { path: string, content: string }[]
}
```

The context package is assembled fresh on each request. It never includes `.env` values or secrets. Sensitive field names in schema are included (needed for accurate code gen), but values are never sent.

Token budget management: if the context would exceed the model's context window, Snap prioritizes: selected element/node > current file > bindings > routes > pages. Less relevant sections are summarized to 1-2 lines.

---

## 9.4 AI Capabilities — Full List

### Frontend Builder AI

| Action | How to trigger | What it does |
|---|---|---|
| Generate section | Right-click canvas → `✦ Generate` | Creates a full page section from description, places it on canvas |
| Improve component | Select element → Inspector `✦` | Suggests styling improvements, better layout, accessibility fixes |
| Generate page | Command palette → `✦ Generate page` | Creates a full page layout from description |
| Copy style | Select element → Inspector `✦` → "Match this style" | Applies the style of a described reference to the selected element |

### Backend Canvas AI

| Action | How to trigger | What it does |
|---|---|---|
| Generate route | Right-click canvas → `✦ Generate route` | Creates full node graph for a described API endpoint |
| Add validation | Select Validate node → Inspector `✦` | Suggests validation rules based on the connected schema |
| Suggest error handling | Select any node → Inspector `✦` | Adds error output branches and appropriate error responses |
| Explain route | Right-click route → "Explain this route" | Returns plain-English description of what the route does end-to-end |
| Optimize query | Select Database node → Inspector `✦` | Suggests index additions, query rewrites for performance |

### Code Editor AI

| Action | How to trigger | What it does |
|---|---|---|
| Inline completion | `Ctrl+I` | Generates code at cursor from inline prompt |
| Explain code | Select code → right-click → `✦ Explain` | Returns plain-English explanation |
| Refactor | Select code → right-click → `✦ Refactor` | Suggests and applies refactoring |
| Fix error | Click error in Problems panel → `✦ Fix` | Reads the error + relevant code and generates a fix |
| Write test | Right-click file → `✦ Generate tests` | Creates a test file for the selected module |

### Global AI (Command Palette)

| Command | What it does |
|---|---|
| `✦ Ask AI` | Open AI panel |
| `✦ Explain this project` | Returns a full plain-English overview of the project architecture |
| `✦ Find security issues` | Audits routes, auth, and input handling |
| `✦ Generate README` | Creates a project README from the architecture context |
| `✦ Suggest next features` | Based on the current project, suggests logical next steps |

---

## 9.5 The Apply Flow — Reviewing AI Changes

Every AI-generated action that modifies files follows this flow. No exceptions.

```
AI generates change
        │
        ▼
Diff view opens (Monaco diff editor)
  Left: current code
  Right: proposed change
  Changed lines highlighted
        │
        ▼
User sees three options:
  [ Apply ]        — writes the change, updates visual model
  [ Edit ]         — opens the proposed code in Monaco for manual adjustment before applying
  [ Dismiss ]      — discards, no changes made
        │
        ▼
If Apply:
  → AST engine processes the new code
  → Visual model updates
  → Sync status shows "AI change applied"
  → Action is added to undo stack (Ctrl+Z undoes the entire AI change as one operation)
```

The diff view always appears for code changes. For purely visual changes (add a component to canvas), a preview overlay is shown instead of a code diff — user sees the component appear on canvas with an `Apply` / `Dismiss` overlay.

---

## 9.6 AI Model & API

For MVP: **OpenAI GPT-4o** via the OpenAI API. The context package and prompt engineering are Snap's proprietary layer — the model itself is interchangeable.

The AI API key is configured in Snap's settings (not in the user's project — it's a Snap platform credential). For self-hosted / open source usage, users can provide their own API key.

Model routing strategy (future):
- Simple completions (explain, rename, short fixes): GPT-4o-mini — faster, cheaper
- Complex generation (full route, full page section): GPT-4o
- Very large context (explain entire project): Claude 3.5 Sonnet (larger context window)

All AI requests go through Snap's backend API route (`/api/ai/complete`) which:
1. Assembles the context package (server-side, so no secrets leak to the browser)
2. Calls the LLM API
3. Streams the response back to the client via SSE
4. Logs the request (model, token count, latency) for usage tracking

---

## 9.7 Streaming UI

AI responses stream token-by-token into the chat panel. Code blocks are rendered progressively — partial code is shown with a shimmer effect until the block completes, then syntax highlighting is applied.

For inline code suggestions in Monaco, the ghost text appears progressively as tokens arrive. The developer can press `Tab` to accept at any point (accepts what has arrived so far) or wait for completion.

---

## 9.8 AI Boundaries — What It Won't Do

- **Never auto-apply** — always requires explicit user confirmation
- **Never access `.env`** — environment variables are excluded from all context packages
- **Never call external APIs** — Snap's AI only operates on local project files
- **Never modify git history** — AI changes are uncommitted code edits, not commits
- **Never run terminal commands** — AI can suggest commands, displayed in the chat, not auto-executed

---


---

# PART 10 — Data Models, File Structure & State Management

## 10.1 Snap's Own Database Schema (Prisma)

This is the schema for Snap-as-a-product — the database that powers the IDE platform itself, not the user's project.

```prisma
// apps/web/server/db/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  projects      Project[]
  accounts      Account[]  // Better Auth OAuth accounts
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "google" | "github" | "credentials"
  providerAccountId String
  accessToken       String?
  refreshToken      String?

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Project {
  id          String        @id @default(cuid())
  userId      String
  name        String
  description String?
  slug        String        @unique  // used in URL: /project/[slug]
  path        String        // filesystem path to project root
  stackConfig Json          // StackConfig object (see 10.2)
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  lastOpenedAt DateTime?

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  processes   DevProcess[]

  @@index([userId])
}

model DevProcess {
  id        String        @id @default(cuid())
  projectId String
  pid       Int?          // OS process ID when running
  port      Int?          // port the dev server is on
  status    ProcessStatus @default(STOPPED)
  startedAt DateTime?
  stoppedAt DateTime?

  project   Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  DELETED
}

enum ProcessStatus {
  RUNNING
  STOPPED
  CRASHED
  STARTING
}
```

---

## 10.2 TypeScript Interfaces — Core Types

These are the shared types used across the entire codebase (`packages/types`):

```typescript
// packages/types/src/index.ts

// ─── Stack Configuration ────────────────────────────────────────

export interface StackConfig {
  framework:   'vite-react' | 'nextjs-pages' | 'tanstack-start' | 'remix'
  language:    'typescript' | 'javascript'
  backend:     'nextjs-api' | 'nestjs' | 'express'
  database:    'postgresql' | 'sqlite' | 'mysql' | 'none'
  orm:         'prisma' | 'drizzle' | 'none'
  auth:        AuthConfig | null
  storage:     'local' | 's3' | 'supabase' | 'none'
  email:       'resend' | 'sendgrid' | 'smtp' | 'none'
  uiKit:       'mui' | 'shadcn' | 'mantine' | 'none'
  font:        string
  primaryColor: string
}

export interface AuthConfig {
  provider:   'better-auth' | 'authjs'
  strategies: ('email' | 'google' | 'github' | 'apple')[]
}

// ─── Framework Adapter (makes Snap framework-agnostic, Part 12.3) ─

export interface FrameworkAdapter {
  id: 'vite-react' | 'nextjs-pages' | 'tanstack-start' | 'remix'

  // Where a page/route lives in this framework's conventions
  pagePath:   (route: string) => string   // "/dashboard" → "src/pages/dashboard.jsx"
  apiPath:    (route: string) => string   // "/api/join"  → "src/pages/api/join.js"

  // How the structured model becomes code for this framework
  emitPage:   (page: Page) => string
  emitRoute:  (route: Route, stack: StackConfig) => string
  emitClient: (binding: Binding) => string   // useQuery/useMutation hook shape

  // How this framework's code is read back into the model (reverse of emit)
  parsePage:  (code: string) => Page
  parseRoute: (code: string) => Route

  // Scaffolding
  scaffold:   (config: StackConfig) => FileTree
  devCommand: string                         // e.g. "npm run dev"
}

// ─── Visual Component Model ─────────────────────────────────────

export interface Component {
  id:        string          // instance ID, stable across sessions
  snapId:    string          // data-snap-id injected into DOM
  type:      ComponentType
  props:     Record<string, unknown>
  styles:    StyleProperties
  children:  Component[]
  bindings:  Binding[]
  locked:    boolean         // true if developer locked it in Layers panel
  visible:   boolean
  custom:    boolean         // true if element is not Snap-managed (no snapId in code)
}

export type ComponentType =
  | 'Section' | 'Grid' | 'Columns' | 'FlexRow' | 'Div' | 'Container'
  | 'Heading' | 'Paragraph' | 'Span' | 'Link'
  | 'Button' | 'Input' | 'Form' | 'Select' | 'Checkbox' | 'Toggle'
  | 'Image' | 'Video' | 'Icon' | 'Divider'
  | 'CustomComponent'  // user-defined component, shown as black box

export interface StyleProperties {
  // Sizing
  width?: string; height?: string
  minWidth?: string; maxWidth?: string
  minHeight?: string; maxHeight?: string
  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string; right?: string; bottom?: string; left?: string
  // Spacing
  marginTop?: string; marginRight?: string; marginBottom?: string; marginLeft?: string
  paddingTop?: string; paddingRight?: string; paddingBottom?: string; paddingLeft?: string
  // Typography
  fontFamily?: string; fontSize?: string; fontWeight?: string
  lineHeight?: string; letterSpacing?: string; color?: string; textAlign?: string
  // Background
  backgroundColor?: string; backgroundImage?: string; backgroundSize?: string
  // Border
  borderWidth?: string; borderColor?: string; borderStyle?: string; borderRadius?: string
  // Effects
  opacity?: number; boxShadow?: string; backdropFilter?: string
  // Flexbox
  display?: string; flexDirection?: string; justifyContent?: string
  alignItems?: string; gap?: string; flexWrap?: string
  // Grid
  gridTemplateColumns?: string; gridTemplateRows?: string
}

// ─── Page Model ─────────────────────────────────────────────────

export interface Page {
  id:       string
  route:    string           // e.g. "/" | "/dashboard" | "/blog/[slug]"
  name:     string           // display name in Pages panel
  filePath: string           // e.g. "src/pages/index.jsx"
  root:     Component        // the root component tree
}

// ─── Backend Canvas ─────────────────────────────────────────────

export interface BackendNode {
  id:       string
  type:     NodeType
  label:    string           // display name, editable
  config:   Record<string, unknown>   // node-specific configuration
  position: { x: number; y: number }
  data:     Record<string, unknown>   // React Flow node data
}

export interface BackendEdge {
  id:       string
  source:   string           // node ID
  target:   string           // node ID
  sourceHandle: string       // port name (e.g. "Request", "Valid", "Error")
  targetHandle: string
  type:     'data' | 'error' | 'conditional'
  label?:   string
}

export interface Route {
  id:       string
  method:   'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path:     string           // e.g. "/api/join"
  filePath: string           // default stack: "src/pages/api/join.js" (NestJS/Express: "server/routes/...")
  nodes:    BackendNode[]
  edges:    BackendEdge[]
  status:   'live' | 'draft'
}

export type NodeType =
  | 'http-request' | 'schedule' | 'webhook'
  | 'route-handler' | 'router' | 'redirect'
  | 'jwt-auth' | 'rate-limit' | 'cors' | 'validate'
  | 'db-query' | 'db-insert' | 'db-update' | 'db-delete'
  | 'condition' | 'transform' | 'loop' | 'merge'
  | 'send-response'
  | 'send-email' | 'send-sms' | 'call-webhook' | 'storage-upload'

// ─── Binding Model ───────────────────────────────────────────────

export interface Binding {
  id:           string
  type:         'action' | 'data' | 'state'
  elementId:    string           // data-snap-id
  elementEvent: string           // 'onClick' | 'onSubmit' | 'onLoad' | 'onChange'
  nodeId:       string
  routeId:      string
  inputMap:     FieldMap[]
  outputMap:    FieldMap[]
  loadingState: boolean
  errorHandling: 'silent' | 'toast' | 'inline'
  isCustom:     boolean          // true if hand-edited, not fully managed by Snap
}

export interface FieldMap {
  from: string
  to:   string
}
```

---

## 10.3 Zustand Store Structure

The client state is split into focused stores. Each store is a Zustand slice. They are composed into a single root store via Zustand's `create` + `immer` middleware.

```typescript
// apps/web/lib/store/index.ts

interface SnapStore {
  // IDE shell state
  ide: IDESlice
  // Visual builder (frontend)
  builder: BuilderSlice
  // Backend canvas
  canvas: CanvasSlice
  // Bindings
  bindings: BindingsSlice
  // Active project
  project: ProjectSlice
  // AI panel
  ai: AISlice
}

interface IDESlice {
  activeMode:        'frontend' | 'backend' | 'database' | 'code' | 'settings'
  activeActivityBar: string       // which sidebar panel is open
  sidebarWidth:      number
  inspectorWidth:    number
  bottomPanelHeight: number
  bottomPanelTab:    'terminal' | 'output' | 'problems' | 'ports'
  sidebarCollapsed:  boolean
  inspectorCollapsed: boolean
  syncStatus:        'synced' | 'syncing' | 'reading' | 'conflict' | 'error'
}

interface BuilderSlice {
  pages:           Page[]
  activePageId:    string
  selectedIds:     string[]       // selected component IDs
  hoveredId:       string | null
  viewport:        ViewportSize
  zoom:            number
  tool:            'select' | 'text' | 'frame'
  history:         HistoryEntry[] // undo/redo stack
  historyIndex:    number
}

interface CanvasSlice {
  routes:          Route[]
  activeRouteId:   string
  selectedNodeIds: string[]
  viewport:        ReactFlowViewport
}

interface BindingsSlice {
  bindings:        Binding[]
  selectedBinding: string | null
}

interface ProjectSlice {
  id:         string
  name:       string
  stackConfig: StackConfig
  openFiles:  OpenFile[]
  activeFile: string
}

interface AISlice {
  panelOpen:   boolean
  messages:    AIMessage[]
  isStreaming: boolean
  pendingDiff: AIDiff | null    // diff waiting for user apply/dismiss
}
```

**Persistence:** The `ide` slice (panel sizes, active mode) is persisted to `localStorage` via `zustand/middleware/persist`. Everything else is ephemeral — rehydrated from the filesystem/database on project open.

---

## 10.4 The `.snap/` Metadata Directory

Every Snap-managed project has a `.snap/` directory at its root. This is Snap's source of truth for the visual model — separate from the generated code so the two can be kept in sync independently.

```
.snap/
├── project.json           ← project-level metadata
├── bindings.json          ← all Binding objects
└── pages/
    ├── index.snap.json    ← visual model for src/pages/index.jsx
    ├── dashboard.snap.json
    └── login.snap.json
```

**`.snap/project.json`:**
```json
{
  "snapVersion": "1.0.0",
  "projectId": "cuid_abc123",
  "stackConfig": { ... },
  "routes": [ ... ]        // Route objects with node/edge data
}
```

**`.snap/pages/index.snap.json`:**
```json
{
  "pageId": "page_home",
  "route": "/",
  "root": {
    "id": "comp_001",
    "snapId": "hero-section-1",
    "type": "Section",
    "styles": { "paddingTop": "80px", ... },
    "children": [ ... ]
  }
}
```

**What gets committed to git:**
- The `.snap/` directory — YES. It's the visual model and should be version-controlled. Teammates who open the project in Snap see the same canvas.
- `.env` — NO. Standard .gitignore.

---

## 10.5 Server-Side File Operations

All file reads/writes go through a dedicated API layer. The browser never directly touches the filesystem — that happens on the server.

```
Browser (React)
    │
    │  fetch('/api/project/read-file', { path })
    │  fetch('/api/project/write-file', { path, content })
    │  WebSocket: file-change events (chokidar)
    ▼
Next.js API Routes (server)
    │
    ├── /api/project/read-file   → fs.readFile
    ├── /api/project/write-file  → fs.writeFile + chokidar trigger
    ├── /api/project/list-dir    → fs.readdir
    ├── /api/project/spawn       → child_process.spawn (start dev server)
    ├── /api/project/kill        → process.kill (stop dev server)
    └── /api/project/stream-log  → SSE stream of spawned process stdout
```

File writes are atomic: written to a temp file, then renamed to the target path. This prevents partial writes from corrupting the codebase if Snap crashes mid-write.

---

## 10.6 Project Runtime — Running the User's Project

When a user starts the dev server from Snap:

```typescript
// apps/web/server/api/project/spawn.ts

import { spawn } from 'child_process'

export function spawnDevServer(projectPath: string, port: number) {
  const proc = spawn('npm', ['run', 'dev', '--', '--port', String(port)], {
    cwd: projectPath,
    env: { ...process.env, PORT: String(port) },
    shell: true,
  })

  proc.stdout.on('data', (data) => {
    // Stream to browser via WebSocket
    broadcastLog(projectPath, data.toString())
  })

  proc.on('exit', (code) => {
    updateProcessStatus(projectPath, code === 0 ? 'STOPPED' : 'CRASHED')
  })

  return proc
}
```

The spawned process's port is stored in the `DevProcess` table. The preview iframe in the Frontend Builder points to `http://localhost:[port]`.

Port allocation: Snap maintains a pool of ports (3100–3199) for user projects. Each project gets one assigned on first spawn, stored in `DevProcess.port`. Conflicts are avoided by checking which ports are in use before assignment.

---

## 10.7 The Full Data Flow — End to End

This ties everything together: what happens when a user drops a Button onto the canvas and connects it to an API route.

```
1. USER ACTION
   Drag "Button" component from sidebar → drop onto Hero section

2. ZUSTAND UPDATE (immediate, <1ms)
   BuilderSlice.pages[activePage].root.children[hero].children.push(newButton)

3. VISUAL RENDER (<16ms, next React render cycle)
   Frontend canvas re-renders via iframe postMessage
   Layers panel updates
   Inspector shows Button properties

4. VISUAL → CODE SYNC (<50ms)
   VisualToCode serializer reads updated visual model
   Builds JSX AST with @babel/types
   @babel/generator produces code string
   /api/project/write-file writes src/pages/index.jsx
   Monaco editor.getModel().setValue(newCode)

5. USER CREATES BINDING
   Inspector → Bind tab → + Add Action → onClick
   Selects POST /api/join route → maps fields
   BindingsSlice.bindings.push(newBinding)
   .snap/bindings.json updated
   BindingCodeGen generates useMutation hook + onClick handler
   Merged into src/pages/index.jsx via AST

6. USER EDITS BINDING IN CODE (Direction B)
   Types directly in Monaco, changes the fetch URL
   300ms debounce fires
   CodeToVisual parser reads the file
   Detects changed useMutation mutationFn URL
   Updates BindingsSlice with new route reference
   Inspector Bind tab reflects the change
   Backend canvas binding badge updates

7. PROJECT RUNS
   User clicks "Run" in toolbar
   /api/project/spawn starts child_process
   Process port stored in DB
   iframe in Frontend Builder points to localhost:[port]
   Terminal panel streams stdout
   "● LIVE" badge appears on backend route indicator
```

This loop — visual action → code → visual — is the product. Every other feature serves this loop.

---

## 10.8 Performance Targets Summary

| Operation | Target | Mechanism |
|---|---|---|
| Visual change → Monaco | <50ms | Direct AST build, no re-parse |
| Code edit → canvas | <300ms | Debounced, incremental AST parse |
| Project open (load all state) | <2s | Parallel: load .snap JSON + open Monaco |
| Dashboard load | <500ms | TanStack Query with stale-while-revalidate |
| AI response first token | <1.5s | Streaming, context assembled server-side |
| Node config change → code | <150ms | Debounced per-node, not full route re-gen |
| Canvas pan/zoom | 60fps | React Flow virtualization, no re-renders |
| Drag-drop component | 60fps | dnd-kit pointer events, optimistic UI |

---

## 10.9 Build & Dev Scripts

```json
// Root package.json (pnpm workspace)
{
  "scripts": {
    "dev":          "turbo dev",
    "build":        "turbo build",
    "test":         "turbo test",
    "lint":         "turbo lint",
    "db:push":      "prisma db push --schema apps/web/server/db/schema.prisma",
    "db:studio":    "prisma studio --schema apps/web/server/db/schema.prisma",
    "db:generate":  "prisma generate --schema apps/web/server/db/schema.prisma"
  }
}
```

`turbo dev` starts the Next.js app (Snap IDE) in development mode. The user's individual projects are spawned separately as child processes by Snap's runtime layer — they are not part of the monorepo build.

---

---

# PART 11 — Differentiators That Deliver Real Value

This part documents capabilities that go beyond the baseline IDE — but only ones with concrete, defensible, day-one value. Each exists for one reason: **Snap's app is a typed, structured model, not unstructured text.** Anything that doesn't cash in that advantage was deliberately left out.

Each entry states: what it is, the real problem it solves, the exact mechanism (how it plugs into the AST engine / structured model), and its build phase.

---

## 11.1 AI Operates on the Graph, Not the File

**The problem.** Every text-based AI coding tool generates a string of code and hopes it compiles, imports correctly, and wires to the rest of the app. It frequently doesn't. The developer becomes a reviewer of plausible-looking text.

**What Snap does instead.** Snap's AI does not emit code. It emits **validated model mutations**:

```typescript
type AIMutation =
  | { op: 'addNode';      routeId: string; node: BackendNode }
  | { op: 'connectPort';  edge: BackendEdge }
  | { op: 'setNodeField'; nodeId: string; field: string; value: unknown }
  | { op: 'addComponent'; pageId: string; parentId: string; component: Component }
  | { op: 'createBinding'; binding: Binding }
  | { op: 'addSchemaField'; model: string; field: PrismaField }
```

Every mutation is validated against the existing model **before** any file is written:
- A `connectPort` is rejected if the port types are incompatible.
- An `addComponent` is rejected if the target can't contain that child.
- A `createBinding` is rejected if the mapped fields don't exist.

Only after the mutation set passes validation does the normal code-generation pipeline (Part 7) run. The result: **AI output is structurally correct by construction** — it cannot produce a binding to a nonexistent route or a node graph that doesn't compile.

**Why this matters.** This is the single most important strategic feature. It is the reason Snap is not "low-code that AI makes obsolete." The AI is more reliable *because* it is constrained by the model, not in spite of it.

**Mechanism.** The existing Apply flow (Part 9.5) already gates changes behind review. This extends it: the AI's proposed mutation set is shown as a previewable diff on the canvas (added nodes highlighted, new edges dashed) **and** as a code diff. Accept per-mutation or wholesale.

**Phase.** Core. Build alongside the base AI layer (Part 9) — do not ship a text-only AI first; it would set the wrong expectation.

---

## 11.2 The Binding Is the Contract — Cross-Stack Type Safety

**The problem.** In normal full-stack development, the frontend and backend agree on a data shape only by convention. Rename a field in a DB query and the frontend that reads it breaks silently — you find out at runtime, in production.

**What Snap does.** Because a binding (Part 6) already carries a typed `inputMap` and `outputMap` between a frontend element and a backend node, Snap has a complete, machine-checkable contract across the network boundary. It uses this two ways:

1. **Generates an end-to-end typed client.** The binding's field types flow into the generated `useQuery`/`useMutation` hooks, so the frontend is typed against the actual backend response shape — no hand-maintained shared types.
2. **Live break detection.** When a backend node's output field is renamed or removed (in the canvas *or* in code), every binding that references it is flagged immediately: the bound frontend element shows a red error badge, the binding appears in the Problems panel, and the affected line is marked in Monaco.

**Real scenario.** You rename `user.fullName` → `user.name` in a Query node. Instantly, the three pages displaying `fullName` show broken-binding errors before you ever run the app. In a normal stack, you'd ship the bug.

**Mechanism.** Binding validation (Part 6.10) already runs on every save. This adds field-level dependency tracking: the binding store maintains a reverse index from `schema field → nodes using it → bindings using those nodes → frontend elements`. A change anywhere walks the index and marks downstream breaks.

**Phase.** High priority. Break detection first (cheap, enormous value); typed-client generation second.

---

## 11.3 Propagating Refactors Across the Stack

**The problem.** Renaming a concept (a field, a route, an entity) in a real app means touching the schema, the queries, the API response, the frontend fetch, and the display — across many files, by hand, hoping you caught them all. This is the single most error-prone routine task in full-stack work.

**What Snap does.** Because the schema, nodes, bindings, and components are one connected graph, a rename is a **single atomic operation** that propagates along the dependency index:

```
Rename schema field  users.fullName → users.name
   │
   ├─ Prisma schema updated + migration generated
   ├─ Every Query/Insert/Update node referencing the field re-points
   ├─ Every binding inputMap/outputMap re-points
   └─ Every frontend element displaying it updates
   → One confirmation dialog showing all affected locations. Apply atomically, or cancel.
```

**Real scenario.** "Rename the `waitlist` table to `signups`." One action updates the Prisma model, the migration, two API routes, and the dashboard table view together. No grep, no missed reference.

**Mechanism.** Reuses the reverse dependency index from 11.2. The refactor computes the full affected set, presents it for review, and applies all edits through the AST engine in a single transaction (all files written atomically, or none).

**Phase.** High priority — directly follows 11.2 since it shares the dependency index.

---

## 11.4 Migration Safety

**The problem.** Schema changes are the most dangerous edits in any app. A careless column rename or type change can drop data. Visual tools that hide this are actively harmful.

**What Snap does.** Any change to the schema (via the Database tab, a node, or `schema.prisma` directly) is routed through a **migration preview** before it touches the database:
- Snap runs `prisma migrate diff` to compute the exact SQL.
- It classifies each change as **safe** (add nullable column, add table), **review** (add non-null column → needs default), or **destructive** (drop/rename column, narrow type → potential data loss).
- Destructive changes require explicit confirmation and show the row count that would be affected.
- The generated migration is shown as readable SQL the developer can edit before applying.

**Why this matters.** It makes Snap *safe enough for real data*, which is the bar that separates a toy from a tool. It also reinforces the "you keep control" promise — Snap never silently mutates a database.

**Mechanism.** Wraps Prisma Migrate. The Database tab's "Migrations" sub-tab (Part 3.6) is where previews surface. No new engine work — it's orchestration around Prisma's existing diff/migrate commands plus a safety classifier.

**Phase.** Required before Snap is usable for anything with real data. Build with the Database tab.

---

## 11.5 Reverse Mode — Import an Existing Codebase

**The problem.** A tool that only works on projects it created itself has a tiny addressable market and a "throwaway prototype" reputation. The real market is the millions of existing codebases.

**What Snap does.** The AST engine already reads code → visual model (Part 7, Direction B). Reverse mode points that capability at an existing project:
- `src/pages/*.jsx` → reconstructed into the Frontend Builder component trees.
- API routes (`src/pages/api/*`, or Express/NestJS routes) → reconstructed as backend node graphs where recognizable patterns map to nodes (a `prisma.x.findMany` becomes a Query node, a validation block becomes a Validate node).
- `fetch`/`useQuery`/`useMutation` calls → reconstructed as bindings.
- `schema.prisma` → the Database tab.

**Honest limitations (documented, not hidden).** Reverse mode is best-effort, not perfect. Code that doesn't match known patterns is preserved verbatim and shown as **custom blocks** (the partial-sync model from Part 7.4) — visible in the tree as black boxes, fully editable in code, just not decomposed into nodes/components. Snap never rewrites code it doesn't understand. A project imports as "partially visual" and becomes more visual as the developer adopts Snap patterns.

**Why this matters.** It changes the addressable market from "new projects" to "any Next.js project," and it doubles as the fastest way to understand an unfamiliar codebase — you get a visual map of a repo you've never seen.

**Mechanism.** A pattern-recognition layer on top of the existing parser: a library of AST matchers (`prisma.<model>.findMany(...)` → Query node, etc.). Unmatched AST → custom block. This is additive to the engine, not a rewrite.

**Phase.** Medium-term, high-leverage. Ships after the core round-trip sync is rock-solid, because it stresses the same machinery harder.

---

## 11.6 Explain Mode — Bidirectional Code ↔ Visual Mapping

**The problem.** Understanding *why* a line of code exists, or *what code* a visual element produces, is normally guesswork. This is also the #1 barrier for developers learning a new codebase or learning full-stack patterns.

**What Snap does.** Because every generated line traces back to a model element via `data-snap-id` / node IDs / binding markers, Snap maps both directions:
- **Hover a line in Monaco** → the node or component that produced it highlights on the canvas.
- **Select a node/element** → the exact lines it generates highlight in Monaco.
- **Click a binding** → both endpoints (frontend element + backend node) and the generated hook all highlight together.

**Why this matters.** It's cheap to build (the mapping already exists for sync to work — this just surfaces it in the UI) and it delivers outsized value: faster debugging, faster onboarding, and a genuine teaching tool. It directly reinforces the "not a black box" promise.

**Mechanism.** The sync engine already maintains a source-map-like association between model elements and code ranges (it must, to do surgical edits). Explain mode is a read-only view over that existing association.

**Phase.** Low effort, ship early. It makes the two-way sync *legible*, which builds the trust the whole product depends on.

---

## 11.7 Architecture-Aware Diffs & Review

**The problem.** Reviewing a full-stack change as a raw text diff is slow and error-prone — 600 lines of churn hide the three decisions that actually matter.

**What Snap does.** Snap renders any change set as a **structural diff** in addition to the text diff:
- "Added route `POST /api/refund` (4 nodes)"
- "Changed auth flow: added Rate Limit node before JWT Auth"
- "Bound `RefundButton.onClick` → `POST /api/refund`"
- "Schema: added `refunds` table (3 fields)"

The reviewer reads intent first, drills into code second. Useful solo (reviewing your own AI-assisted change before applying) and essential for teams.

**Mechanism.** A diff between two snapshots of the structured model (`.snap/` JSON + schema) produces the structural summary; the existing git text diff sits underneath. No runtime dependency — it's a diff over data Snap already stores.

**Phase.** Medium-term. Pairs naturally with the AI Apply flow (11.1) — the AI's proposed change is shown as exactly this kind of structural diff.

---

## 11.8 Collaboration: CRDT on the Model (Deferred, but Designed For)

Collaboration is post-MVP (Part 2). But the architecture decision should be made now so it isn't painful later:

**When collaboration is built, CRDT the structured model — not the text buffer.** Most collaborative editors apply CRDTs to character ranges in text, which produces ugly merges for code. Snap's operations are semantic (`moveNode`, `setField`, `addComponent`), and semantic operations merge cleanly: two developers editing different nodes of the same route never conflict, because they're mutating different parts of a structured document.

**Mechanism (future).** Represent the visual model and node graph as a Yjs document. Operations already flow through Zustand as discrete mutations — they map directly onto Yjs shared-type updates. Text files remain a generated projection; the model is the synced artifact.

**Phase.** Deferred. Documented here only so the model layer (Part 10) is built CRDT-compatible from the start (discrete, serializable operations — which it already is).

---

## 11.9 What Was Deliberately Excluded

To keep Snap mature and focused, these were considered and cut for now:
- **Traffic animation / "live pulsing canvas"** — demo flash, marginal real value over a good request inspector.
- **Auto chaos/fuzz testing** — powerful but premature; belongs to a later, hardened product, not an MVP validating the core idea.
- **Architecture marketplace** — an ecosystem play that requires scale Snap doesn't have yet.
- **Cost/load "what-if" simulation** — speculative numbers that would mislead more than help at this stage.

These aren't bad ideas; they're the wrong ideas *now*. The list above is everything that earns its complexity today.

---


---

# PART 12 — Market Validation & Strategic Adjustments

This part records what community research (Reddit, Hacker News, developer blogs, vendor post-mortems, 2025–2026 surveys) revealed about real full-stack pain, and the concrete adjustments it forces on Snap's priorities. It exists so the product is built against evidence, not assumption.

## 12.1 The Validated Pains (and which Snap feature answers each)

| # | Community pain (real, recurring) | Snap's answer | Doc ref |
|---|---|---|---|
| 1 | **Frontend↔backend contract drift** — "backend changes one field, twelve tickets open, stale interfaces lie to TypeScript" | Binding = typed contract; break detection lights up every affected element | 6, 11.2 |
| 2 | **Data-fetching boilerplate** — useEffect/fetch/loading/error is "the new code smell" | Bindings auto-generate idiomatic TanStack Query hooks | 6.8 |
| 3 | **Framework churn / Next.js fatigue** — "a sledgehammer to hang a picture frame" | Framework-agnostic model + stack adapters (Snap absorbs the churn) | 12.3 |
| 4 | **Auth is a time-sink and a risk** — zero tolerance for mistakes, SSO blocks enterprise deals | First-class, production-grade auth scaffold | 12.4 |
| 5 | **Migrations "feel like defusing a bomb"** | Migration safety: classify safe/review/destructive, preview SQL | 11.4 |
| 6 | **Can't build a mental model of a codebase; C4 docs "decay into expensive wallpaper"** | Reverse mode + Explain mode + always-correct living docs | 11.5–11.7 |
| 7 | **AI builders produce demos, not systems** — "no consistent architecture, no plan for how components interact" | AI mutates a validated graph; cannot break architecture | 11.1 |
| 8 | **Documentation is the #1 meta-complaint everywhere** | The graph IS the documentation; correct by construction | 11.6–11.7 |

The meta-pattern across all eight: every pain is a **broken or invisible connection** (frontend↔backend, UI↔data, schema↔database, code↔architecture, AI↔structure). The industry keeps that map in developers' heads, where it is always wrong. Snap's reason to exist is that it holds the map as live, typed, structured data. The research confirms Snap is aimed at the deepest wound in full-stack development.

## 12.2 Adjustment 1 — The Contract Layer Is the Headline

Pains #1 and #2 are the most-felt, least-solved problems in full-stack work. Snap's binding system + cross-stack type safety + propagating refactors answer them exactly. These were originally framed as advanced "Part 11" extras. **They are re-designated as a primary pillar of the product.**

The canonical demo of Snap is no longer "drag a button." It is:
> Rename a database field → every affected frontend binding lights up red across every page → fix them all in one propagating action.

No competing tool can do this, because no competing tool has a typed link across the network boundary. This is the wedge. (See the updated headline pillars in Part 1.2.)

## 12.3 Adjustment 2 — Do Not Marry Next.js

Community signal shows significant and growing Next.js fatigue (App Router complaints, constant churn, teams migrating to TanStack Start / pure React). Snap's value — visual↔code sync over a structured model — is **framework-independent**. Tying Snap's identity to Next.js imports that fatigue as a liability.

**Decision:** The stack-adapter architecture becomes first-class, not aspirational.

- A **FrameworkAdapter** interface defines how the structured model maps to a framework's file/route conventions and code shape.
- Target adapters, in priority order: **Vite + React** (simplest, no meta-framework baggage — strong default for SPAs), **Next.js (Pages Router)**, **TanStack Start**, then Remix/others.
- The frontend builder, backend canvas, and binding system all emit through the active adapter. Switching frameworks is an adapter swap, not a rewrite.
- Positioning: *"Snap understands your app, whatever framework you chose."* Framework churn becomes something Snap absorbs on the user's behalf — a feature, not a risk.

This also de-risks the earlier router decision (Part 5.6/8.3): Pages Router is one adapter's convention, not Snap's identity.

## 12.4 Adjustment 3 — Auth Is First-Class and Production-Grade

Auth is a top-5 pain and a top enterprise dealbreaker. A toy auth scaffold would breach the trust threshold. The auth scaffold (Part 8.2) must produce genuinely production-grade output: secure sessions, token rotation, CSRF protection, OAuth providers, and a clear path to SSO/SAML later. "Correct, secure auth wired to the frontend in one step" is promoted to an explicit headline capability, not a checkbox in the wizard.

## 12.5 Adjustment 4 — AI's Defining Property Is "Cannot Break Architecture"

The #1 complaint about Cursor/v0/Lovable/Bolt is architectural chaos from text generation ("no plan for how components interact"). Snap's AI (11.1) mutates a validated graph, so it is structurally incapable of producing code that doesn't wire up. This property must be stated as the AI's defining characteristic everywhere it appears — it is the single reason a developer burned by a text-based AI builder would switch.

## 12.6 The Four Sacred Commitments (where Snap lives or dies)

Research into why developers abandon tools yields four non-negotiable commitments. Violating any one loses the user permanently.

1. **Sync correctness is existential.** One corruption event = permanent abandonment. Atomic writes, never touch untagged code, always degrade to partial-sync rather than fail. The sync engine's correctness is not a feature — it is the price of admission.

2. **Generated code must be senior-developer-grade.** Every AI builder fails because the output is *almost* right. Snap's code must be indistinguishable from idiomatic hand-written code, or developers reject it. This is harder than it sounds and is the line between adoption and rejection.

3. **Eject must be flawless and provable.** Lock-in fear is the #1 reason CTOs refuse these tools. A skeptic must be able to remove Snap and verify a 100%-intact codebase in under a minute. Eject (Part 8.5) is a trust instrument, not a feature.

4. **The model must never be a cage.** The vendor ceiling is what kills low-code. The instant a developer wants something Snap doesn't model, it must gracefully become "just custom code, edit it freely" (partial-sync, Part 7.4) — never block them.

## 12.7 Strategic Positioning (internal, not marketing copy)

Snap is **not** "low-code + AI." The research is unanimous that low-code dies in the AI era. Snap is:

> **The IDE where the program understands itself** — frontend, backend, database, and the connections between them held as one live, typed model, generating real code you fully own.

Every roadmap decision is tested against that sentence. If a feature doesn't deepen the model or cash in the structural advantage, it is bloat.

---

---

# PART 13 — Panel Review & MVP Pivot (Decision of Record)

An 11-role engineering panel reviewed this design. Decision: **GO, with a mandatory pivot to a narrow wedge.** This part is the binding decision of record; where it conflicts with the ambition in Parts 1–12, **this part wins for sequencing.**

## 13.1 The Three Hard Truths

1. **The documented scope is the north star, not the build plan.** Parts 4–12 describe a multi-year platform. Ship ~1/5 of it first.
2. **Bidirectional sync on arbitrary hand-edited code is a research problem, not an MVP feature.** In MVP, **the visual model is the source of truth.** Code→visual is *best-effort pattern recognition*; anything unrecognized is preserved untouched as a custom block (Part 7.4). Never promise perfect round-trip until it is proven.
3. **Lead with the defensible part.** The frontend builder is commoditized (v0, Webflow, Lovable). The **typed frontend↔backend contract + propagating refactor** is what no competitor has. Build that first; the builder can be minimal at the start.

## 13.2 What the MVP Is (and Isn't)

**In:** one hardcoded stack (Vite + React + TS + TanStack Query + Prisma + SQLite, local-run); backend canvas with a minimal node set (HTTP trigger, Validate, DB query/insert, Send Response); a minimal frontend surface (component tree + property panel — not full Webflow); the binding/contract layer with **break detection** and the **propagating-refactor** demo; Monaco with full visual→code and best-effort code→visual; flawless eject.

**Out (deferred):** `FrameworkAdapter` multi-framework layer (hardcode one framework; extract the interface only when the 2nd framework forces it — premature abstraction otherwise); reverse mode; all AI (Parts 9 & 11.1 — build the validated model first, or AI produces the very chaos Snap exists to prevent); collaboration/CRDT; hosted multi-tenant runtime (sandbox required before hosting); full pre-built section library; the full database editor (read-only viewer only in MVP).

## 13.3 The Canonical MVP Demo (success metric)

A working developer builds one real CRUD feature end-to-end, **hand-edits the generated code and the canvas survives it**, then renames a database field and watches the change propagate across frontend↔backend bindings in one action. If that demo makes 10 skeptical senior developers say "I want this," the thesis is validated. Nothing else in the MVP matters more than this moment.

## 13.4 Sequencing Rule

The AST engine is the critical path; **no parallel feature tracks until the Phase-0 engine spike (Part 14) passes its gates.** Order: engine → one generator → bindings → demo → design partners.

## 13.5 The Four Sacred Commitments (restated, binding)

1. Sync never corrupts code (atomic writes; never touch untagged code; degrade to custom block).
2. Generated code is senior-developer-grade or developers reject it.
3. Eject is flawless and provable in under a minute.
4. The model is never a cage — unmodeled intent always falls back to "just custom code."

---

# PART 14 — Phase 0: Engine De-Risking Spike (Start Here)

**Purpose:** Before any product is built, prove the one thing the whole company depends on — that a structured model can round-trip to real code, fast, without ever corrupting it. Timebox: **4–6 weeks, 1–2 engineers.** If the gates below fail, the core premise needs rethinking — and learning that now is the point.

This is throwaway code. Build it to learn, not to keep.

## 14.1 What to Build (minimum)

A headless library (no UI) that:
1. Defines a tiny model: `Component { snapId, type, props, styles, children }` for ~8 element types (div, section, h1, p, button, input, form, img).
2. **Generate:** model → React + Tailwind JSX string (`@babel/types` + `@babel/generator`).
3. **Parse:** JSX string → model (`@babel/parser` + `@babel/traverse`), keyed off `data-snap-id`.
4. **Source-map:** maintain a bidirectional map between each model node and its code range.
5. **Reconcile:** when re-parsing edited code, update the model for recognized nodes and preserve everything else verbatim as "custom blocks."
6. A test harness that round-trips and diffs.

Plus a thin slice of the contract: one `useMutation` binding generated from a model, and re-parsed back.

## 14.2 The Gates (concrete pass/fail)

| # | Experiment | Pass criterion | If it fails |
|---|---|---|---|
| G1 | **Round-trip fidelity.** Generate code from model, parse it back, regenerate. | Output is byte-identical after the 2nd cycle (idempotent) on 100% of 30 hand-authored test pages | Core abstraction leaks; rethink markers/normalization |
| G2 | **Non-destruction.** Take 20 *messy real* React files (arbitrary hand-written code, `cn()`, ternaries, fragments, comments, custom hooks). Parse → model → regenerate. | Untagged / unrecognized code is preserved **100% verbatim**. Zero corruption. | This is the existential failure. Stop and redesign the partial-sync model before anything else |
| G3 | **Performance.** Visual→code and code→visual on files of 100 / 500 / 1000 lines. | visual→code <50ms; code→visual <300ms at 1000 lines on a normal laptop | Re-architect (incremental/subtree parsing, or cap file size with graceful UX) |
| G4 | **Tailwind reversibility.** Map a class string → style props → back to class string. | Lossless for the documented utility set; arbitrary values (`px-[37px]`) survive untouched | Reduce the visually-editable style surface; treat the rest as code-only |
| G5 | **Binding round-trip.** Generate a `useMutation` from a binding model; hand-edit the URL; re-parse. | The binding model updates to reflect the edited URL, or cleanly marks it "custom" | Scope code→visual for bindings to read-only in MVP |
| G6 | **Conflict honesty.** Introduce a syntax error mid-edit, then unrecognized patterns. | Engine never writes; surfaces a clear conflict state; last-good model intact | Harden error recovery before exposing to users |

## 14.3 Decision After Phase 0

- **All gates pass** → proceed to Phase 1 (the vertical slice, Part 13.2). The premise is sound.
- **G2 or G3 fails hard** → the product as imagined is at risk. Options, in order: (a) narrow the editable surface, (b) make code→visual opt-in/manual instead of live, (c) reposition as "visual-primary with code escape hatch" rather than true two-way sync. Decide explicitly; do not paper over it.
- **Partial pass** → ship the MVP with honestly-scoped sync (visual source of truth) and a documented list of what code→visual does and doesn't recognize.

## 14.4 Why This Order

Every deferred feature (AI on the graph, reverse mode, multi-framework adapters, collaboration) is a *consumer* of the engine. If the engine's round-trip and non-destruction guarantees don't hold, those features inherit the failure. Six weeks here protects eighteen months everywhere else. This is the single highest-ROI work in the entire plan.

---


---

# PART 15 — 🔒 LOCKED: Final Decisions

> This section is frozen. It is the single source of truth for what Snap is and what gets built first. Everything above is detail; this is the contract. Date locked: 2026-06-14.

## 15.1 What Snap Is (locked, one sentence)

**Snap is a browser-based full-stack IDE where the visual layer and the code are one synchronized, typed model — making the connection between frontend, backend, and database explicit, refactorable, and always backed by real, ejectable code.**

## 15.2 The Moat (locked)

The typed, live **frontend↔backend contract** over a structured model. Rename a database field → every affected binding lights up across the app → fix in one propagating action. No competitor can do this. This is the wedge and the reason to exist.

## 15.3 Non-Negotiables (locked)

1. Code is always real, standard, and ejectable — zero Snap runtime in output.
2. Sync never corrupts code — atomic writes; untagged code is never touched.
3. The model is never a cage — unmodeled intent falls back to plain editable code.
4. Built for professional developers — not a no-code tool.
5. Eject is flawless and provable in under a minute.

## 15.4 MVP Scope (locked)

- **Stack:** Vite + React + TypeScript + TanStack Query + Prisma + SQLite. One stack, hardcoded, local-run.
- **Surfaces:** backend canvas (HTTP trigger, Validate, DB query/insert, Send Response) + minimal frontend surface (component tree + property panel) + the binding/contract layer with break detection + propagating refactor + Monaco with visual→code (full) and code→visual (best-effort).
- **Sync model:** visual is the source of truth; code→visual is best-effort pattern recognition; unrecognized code preserved verbatim.
- **Deferred (not in MVP):** AI, multi-framework adapters, reverse mode, collaboration/CRDT, hosted multi-tenant runtime, full Webflow-grade builder, full database editor.

## 15.5 First Action (locked)

Run **Phase 0 — the engine de-risking spike (Part 14)** before building product. Gates G1–G6 decide whether the premise holds. No parallel work until the engine passes.

## 15.6 Success Definition (locked)

The MVP succeeds if a working developer can build one real CRUD feature end-to-end, hand-edit the generated code without breaking the canvas, and watch a field rename propagate frontend↔backend in one action — and 10 skeptical senior developers say "I want this."

---

**🔒 IDEA LOCKED.** The concept, moat, scope, and first action are settled. Next step is execution: Phase 0, Part 14.

---

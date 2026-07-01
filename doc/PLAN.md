# StateForward — Engineering Plan & Build Handoff

> **Audience:** the coding AI agent (and human reviewers) who will build StateForward v2.
> **Status:** Authoritative implementation plan. Supersedes the legacy 3-file prototype.
> **Goal:** Turn the monolithic visual mockup into a real, modular, full-stack **web IDE** that can design, build, run, and ship full-stack websites in the browser.

---

## 0. How to Use This Document

This is a build spec, not prose. Implement it phase by phase (Section 12). Each phase has acceptance criteria — do not advance until they pass. When a decision is marked **[DECIDED]**, treat it as fixed unless you find a hard technical blocker, in which case document the blocker and propose an alternative. Items marked **[OPEN]** need a judgment call; pick the simplest option that satisfies the surrounding requirements and note your choice.

Read Sections 1–4 fully before writing any code.

---

## 1. The Problem With v1 (Why We Are Rebuilding)

The current app (`index.html` 134KB, `app.js` 80KB, `styles.css` 83KB) is a **static mockup**, not a working IDE. Concrete limitations:

| Limitation | Consequence |
|---|---|
| Everything lives in **3 monolithic files** | No module boundaries, no reuse, merge hell, untestable, ~40 global functions in one closure. |
| **No real file system** | "Projects" are illusions; nothing is saved to disk. |
| **No dashboard / project lifecycle** | App boots straight into a single hard-coded `my-project`. You cannot create, open, locate, or list projects. |
| **No real execution** | Backend nodes, DB queries, logs, and the terminal are all *simulated* with mock data. |
| **Regex-based HTML sync** | The visual↔code engine breaks on nested/complex markup; not reliable. |
| **No stack selection** | The output target is hard-assumed; users cannot choose what kind of site they build. |

**v2 keeps what is genuinely good about v1** — the visual-first philosophy (Frontend builder + Backend node canvas + Database + synchronized Code editor producing clean, portable, standard code) — and rebuilds it on a serious, modular foundation with a **real filesystem, real project lifecycle, real execution, and a VS Code-style entry workflow.**

---

## 2. Product Vision (One Paragraph)

StateForward is a browser-based, visual-first **full-stack web IDE**. A user lands on a **dashboard** (like the VS Code welcome screen), creates a project by naming it and **choosing a location and a stack**, then enters a **workspace** with synchronized tabs: a **Frontend** drag-and-drop builder, a **Backend** node-flow canvas, a **Database** designer, a **Code** editor (Monaco), and **Settings**. Every visual edit produces clean, standard code and vice-versa (true two-way sync). The project **actually runs** in-browser via WebContainers with a live preview and a real terminal, and is **persisted to a real folder** on the user's machine.

---

## 3. Tech Stack **[DECIDED]**

Chosen for being proven together (ref: `stackblitz/webcontainer`, `Aestheticsuraj234/vibecode-playground`), modular, and OSS-friendly.

| Layer | Choice | Rationale |
|---|---|---|
| **App framework** | **Next.js 15 (App Router) + React 19 + TypeScript** | Mature, file-based routing fits dashboard/workspace split, easy header config for cross-origin isolation, huge ecosystem. |
| **Styling** | **Tailwind CSS v4** + **CSS variables** for theming | Utility-first speed; CSS vars carry over the v1 `--accent` theming model. |
| **Component primitives** | **shadcn/ui** (Radix UI under the hood) | Unstyled, accessible, copy-in components we fully own. Dialogs, menus, tabs, tooltips, command palette. |
| **Icons** | **lucide-react** (primary) | Consistent, tree-shakeable. (RemixIcon optional for parity with v1, but standardize on lucide.) |
| **Code editor** | **Monaco** via **`@monaco-editor/react`** | The VS Code editor core: IntelliSense, multi-model, diagnostics. |
| **Terminal** | **xterm.js** (`@xterm/xterm` + `@xterm/addon-fit`) | Real interactive terminal wired to WebContainer processes. |
| **Runtime / execution** | **WebContainers** (`@webcontainer/api`) | Runs real Node.js + npm + dev servers fully in-browser. Free for OSS. **Requires COOP/COEP headers.** |
| **Local persistence** | **File System Access API** (`showDirectoryPicker`) + **IndexedDB** (via `idb`) | Real "project location" folder like VS Code; IndexedDB stores directory handles, recent projects, and cache. |
| **State management** | **Zustand** (+ `immer`) | Lightweight, store-per-domain, avoids prop drilling and the v1 god-object `State`. |
| **Visual builder canvas** | **dnd-kit** for drag-and-drop; custom renderer | Accessible, modern DnD; replaces v1 ad-hoc drag logic. |
| **Node-flow canvas (Backend)** | **React Flow** (`@xyflow/react`) | Battle-tested node/edge canvas; replaces v1 hand-drawn SVG bezier logic. |
| **HTML/CSS/JS AST sync** | **parse5** (HTML), **postcss** (CSS), **@babel/parser** or **acorn** (JS) | Real ASTs replace v1 regex parsing — the core reliability fix. |
| **Formatting** | **Prettier** (standalone/browser build) | Clean, portable output code on every sync. |
| **Validation/schemas** | **Zod** | Validate project manifests, settings, and component props. |
| **Testing** | **Vitest** + **React Testing Library** + **Playwright** | Unit/component + E2E for the dashboard→build→run flow. |
| **Packaging/build** | Next.js build; **pnpm** workspace | Monorepo-ready package management. |

> **Cross-origin isolation note [DECIDED]:** WebContainers require the page to be cross-origin isolated. Set `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (or `credentialless`) via `next.config.ts` headers. This is a hard requirement; verify in Phase 4 before building execution features.


---

## 4. High-Level Architecture

Five layers, strictly separated. Higher layers depend on lower ones, never the reverse.

```
┌─────────────────────────────────────────────────────────────┐
│  L5  SHELL / ROUTING                                          │
│      Dashboard (welcome, projects) · Workspace (IDE)          │
├─────────────────────────────────────────────────────────────┤
│  L4  FEATURES (tab modules)                                   │
│      Frontend builder · Backend flow · Database · Code · Settings │
├─────────────────────────────────────────────────────────────┤
│  L3  CORE SERVICES                                            │
│      VFS · Sync Engine · Runtime(WebContainer) · Project Mgr  │
│      Component Registry · Command/Action bus                  │
├─────────────────────────────────────────────────────────────┤
│  L2  STATE (Zustand stores)                                   │
│      project · files · editor · ui · runtime · selection      │
├─────────────────────────────────────────────────────────────┤
│  L1  PLATFORM ADAPTERS                                        │
│      FileSystemAccess · IndexedDB · WebContainer API · Monaco │
└─────────────────────────────────────────────────────────────┘
```

**Key principle:** the **Virtual File System (VFS)** is the single source of truth. The visual builder, the node canvas, the database designer, and the Monaco code editor are all just *views/editors over the VFS*. Sync = transforming between a view's model and the underlying files. This is the structural fix for v1's "which is the source of truth?" ambiguity.

### Dependency rules
- Features (L4) talk to Core Services (L3) and State (L2) only — never to platform adapters (L1) directly.
- Platform adapters (L1) are the *only* place that touches browser APIs (`window.showDirectoryPicker`, `indexedDB`, `WebContainer.boot`, `monaco`). This keeps the app testable and portable (e.g. an Electron/Tauri shell later).
- Cross-feature communication goes through the **command/action bus** or shared stores, never direct imports between feature folders.


---

## 5. Repository Structure **[DECIDED]**

Replace the 3 root files with a modular Next.js app. Target tree:

```
StateForward/
├─ PLAN.md                      # this document
├─ doc/                         # consolidated docs (see Section 13)
├─ package.json · pnpm-lock.yaml · tsconfig.json
├─ next.config.ts               # COOP/COEP headers live here
├─ tailwind.config.ts · postcss.config.mjs
├─ public/                      # static assets, stack icons, templates thumbnails
└─ src/
   ├─ app/                      # Next.js App Router (L5 shell/routing)
   │  ├─ layout.tsx
   │  ├─ page.tsx               # → Dashboard
   │  ├─ (dashboard)/           # welcome, recent, create-project wizard
   │  └─ workspace/[projectId]/ # the IDE shell
   │
   ├─ features/                 # L4 — one folder per tab, self-contained
   │  ├─ frontend-builder/      # drag-drop visual builder
   │  ├─ backend-flow/          # React Flow node canvas
   │  ├─ database/              # schema/table/ERD designer
   │  ├─ code-editor/           # Monaco wrapper, tabs, file tree
   │  ├─ preview/               # live preview iframe + device frames
   │  ├─ terminal/              # xterm.js panel
   │  └─ settings/              # project + editor settings
   │
   ├─ core/                     # L3 — framework-agnostic services
   │  ├─ vfs/                   # virtual file system (source of truth)
   │  ├─ sync/                  # AST-based bi-directional sync engine
   │  ├─ runtime/               # WebContainer orchestration
   │  ├─ project/               # project manager, manifest, templates
   │  ├─ components/            # component registry + catalog (Section 9)
   │  └─ commands/              # command bus + command palette registry
   │
   ├─ stores/                   # L2 — Zustand stores (one per domain)
   │  ├─ project.store.ts · files.store.ts · editor.store.ts
   │  ├─ ui.store.ts · runtime.store.ts · selection.store.ts
   │
   ├─ platform/                 # L1 — browser API adapters (only place touching window.*)
   │  ├─ fsa/                   # File System Access API wrapper
   │  ├─ idb/                   # IndexedDB (recent projects, handles, cache)
   │  ├─ webcontainer/          # boot + mount + spawn wrapper
   │  └─ monaco/                # monaco loader/config
   │
   ├─ components/ui/            # shadcn/ui primitives (owned, generated)
   ├─ components/shared/        # cross-feature shared components (panels, toolbars)
   ├─ lib/                      # pure utils (ids, formatting, debounce, paths)
   ├─ types/                    # shared TS types (Section 8)
   └─ styles/                   # globals.css, theme tokens (CSS vars)
```

**Rule:** no file over ~400 lines without a structural reason; split by responsibility. A feature folder owns its components, hooks, local state slices, and tests (`*.test.ts(x)` colocated).


---

## 6. Workflow A — Dashboard & Project Lifecycle (VS Code-referenced)

This is the **entry experience**. Modeled on the VS Code "Welcome / Get Started" page + "Open Folder" flow.

### 6.1 Dashboard screen (`/`)
Layout (two columns, like VS Code welcome):

- **Left — Start / Actions:**
  - `New Project…` → opens the Create Project wizard (6.2).
  - `Open Folder…` → `showDirectoryPicker()`; if the folder has a `stateforward.json` manifest, open it as a project; otherwise offer to initialize one.
  - `Clone from Git…` **[OPEN, phase 7]** → clone into a chosen folder via WebContainer git.
  - `Import template / starter` → pick a built-in starter (Section 7 stacks).
- **Right — Recent Projects:**
  - List from IndexedDB: name, path/location label, stack badge, last-opened time, thumbnail.
  - Click → re-open. Must re-request FS permission if the handle is stale (`handle.requestPermission`).
  - Per-row actions: open, reveal location label, remove from list, delete (with confirm).
- **Header:** brand, theme toggle, command palette trigger, settings.
- **Empty state:** if no recent projects, show a friendly hero with the 3 stack starters and a `New Project` CTA.

### 6.2 Create Project Wizard (multi-step modal/route)
Mirrors "set the location" requirement explicitly.

1. **Step 1 — Details:** project name (slug auto-derived + validated), optional description.
2. **Step 2 — Location:** button `Choose Location…` → `showDirectoryPicker()`. Show the chosen folder name. The project is created as a **subfolder** `location/<slug>/` (because the FSA API can only target a picked parent — document this clearly to the user). Persist the directory handle in IndexedDB. **[DECIDED]**
3. **Step 3 — Stack:** choose the website stack (Workflow B, Section 7). For now the primary path is **"Static Web (HTML + CSS + JavaScript + UI libs)"**, with stack cards laid out for future stacks.
4. **Step 4 — Options:** include starter content (sample page), Git init (later), package manager default.
5. **Create:** scaffold files into the VFS → flush to the chosen folder → register in recent projects → navigate to `/workspace/[projectId]`.

### 6.3 Project manifest — `stateforward.json`
Written at the project root. The contract that makes a folder a StateForward project.

```jsonc
{
  "schemaVersion": 1,
  "id": "uuid",
  "name": "My Site",
  "slug": "my-site",
  "stack": "static-web",          // see Section 7
  "createdAt": "ISO", "updatedAt": "ISO",
  "entry": { "html": "index.html", "dev": "npm run dev" },
  "uiLibraries": ["tailwind", "lucide"],   // user-selected libs
  "builder": {                    // metadata the visual builder needs (ids, bindings)
    "version": 1,
    "bindings": []                // frontend↔backend wiring (Section 9.4)
  }
}
```

Validated with Zod on load. If invalid/missing → treat folder as "not a StateForward project" and offer init.

### 6.4 Persistence model **[DECIDED]**
- **Real files** (HTML/CSS/JS/manifest) → the user's chosen folder via File System Access API.
- **Directory handles + recent-project index + thumbnails + last session** → IndexedDB (handles survive reload; permission may need re-grant).
- **Autosave:** debounce writes (e.g. 800ms) from VFS → disk; show a save/sync status indicator (carry over v1's sync badge).
- **Fallback [OPEN]:** browsers without FSA (Firefox/Safari) → operate fully in-memory/IndexedDB with **Download/Export ZIP** instead of live folder sync. Detect capability and degrade gracefully.


---

## 7. Workflow B — Stack Selection & Starters

After naming + location, the user picks **what kind of website** they're building. This sets which tabs are active, which component catalog loads, and how the project runs.

### 7.1 Stack model
A stack is a declarative descriptor (in `core/project/stacks/`):

```ts
interface Stack {
  id: string;                      // "static-web"
  label: string;                   // "Static Web"
  description: string;
  tags: string[];                  // ["HTML", "CSS", "JS"]
  icon: string;                    // lucide icon name
  files: TemplateFile[];           // scaffold files
  runner: RunnerConfig;            // how to run (static server | npm dev)
  enabledTabs: TabId[];            // which IDE tabs show
  uiLibraryOptions: UiLibrary[];   // selectable CSS/JS libs for this stack
  componentCatalogId: string;      // which Section 9 catalog to load
}
```

### 7.2 Stacks to ship

| Stack | Status | Tabs enabled | Runner |
|---|---|---|---|
| **`static-web`** — HTML + CSS + JS (+ UI libs) | **Phase 1 primary [DECIDED]** | Frontend, Database*, Code, Preview, Settings | Static dev server in WebContainer (e.g. `vite` or `serve`) |
| `node-fullstack` — Express/Hono API + static front | Phase 6 | + Backend, + Database | `npm run dev` |
| `react-spa` — Vite + React | Phase 7 | Frontend, Code, Preview | `vite` |

\* Database tab for `static-web` is optional/local-only (e.g. mock data + localStorage adapter) until a backend exists.

> Focus: **build the `static-web` stack end-to-end first.** It is the explicit current target ("javascript + html + css and some ui libs"). Other stacks reuse the same shell and registry.

### 7.3 UI library options for `static-web`
Presented as toggle cards in the wizard (Step 3/4) and editable later in Settings. Each injects the right `<link>`/`<script>` or npm dep and unlocks matching components in the catalog.

| Library | Type | How it's wired |
|---|---|---|
| **Tailwind CSS** | CSS utility | Tailwind via CDN (play) or build step; classes flow into builder. |
| **Bootstrap 5** | CSS framework | CDN link; component catalog variant. |
| **Alpine.js** | JS behavior | CDN script; for interactivity without a framework. |
| **lucide / Heroicons** | Icon set | Icon picker in the builder. |
| **Animate.css / GSAP** | Animation | Optional; presets in builder. |

Selection writes to `manifest.uiLibraries` and updates the component catalog + injected `<head>` tags. **[OPEN]** exact default set — recommend Tailwind + lucide on by default.

### 7.4 Scaffold output (static-web starter)
Clean, standard, portable (honors the no-lock-in philosophy):
```
my-site/
├─ stateforward.json
├─ index.html          # standard HTML, links styles.css + main.js + chosen CDN libs
├─ styles.css
├─ main.js
├─ assets/
└─ package.json        # dev server + prettier only (removable; site still works)
```


---

## 8. Core Data Models (`src/types/`)

These types are the contracts between layers. Define them first.

```ts
// ---- Virtual File System ----
interface VFSNode {
  id: string;
  path: string;              // "/index.html" (posix, project-root-relative)
  kind: "file" | "dir";
  name: string;
  content?: string;          // files only; binary stored separately as Blob ref
  language?: string;         // "html" | "css" | "javascript" | ...
  dirty?: boolean;           // unsaved vs disk
}

// ---- Builder element tree (Frontend tab view-model over HTML) ----
interface BuilderNode {
  id: string;                // stable data-sf-id, persisted into HTML attr
  tag: string;               // "section" | "button" | "img" ...
  componentType?: string;    // catalog component id if instantiated from catalog
  attrs: Record<string,string>;
  styles: Record<string,string>;   // inline/extracted style props
  classes: string[];
  children: BuilderNode[];
  text?: string;
  binding?: BindingRef;      // link to a backend node (Section 9.4)
}

// ---- Backend flow (Backend tab view-model) ----
interface FlowNode {
  id: string; type: NodeType; position: {x:number;y:number};
  data: Record<string, unknown>;   // route, validation rules, query, etc.
}
interface FlowEdge { id:string; source:string; target:string; sourceHandle?:string; targetHandle?:string; }
type NodeType = "route" | "validate" | "query" | "integration" | "response" | "function";

// ---- Database (Database tab) ----
interface DbTable { id:string; name:string; columns:DbColumn[]; }
interface DbColumn { name:string; type:string; pk?:boolean; fk?:{table:string;column:string}; nullable?:boolean; }

// ---- Frontend↔Backend binding ----
interface BindingRef { id:string; elementId:string; flowNodeId:string; event:string; /* "submit"|"click" */ payload?:Record<string,string>; }

// ---- Component catalog ----
interface CatalogComponent {
  id:string; label:string; group:string; icon:string;
  defaultProps:Record<string,unknown>;
  propsSchema: ZodSchemaRef;          // editable props in the inspector
  render(props):BuilderNode;          // → builder tree → HTML
  requires?:string[];                 // ui libs needed (e.g. ["tailwind"])
}
```

> **Sync invariant:** `BuilderNode.id` is written to the real HTML as `data-sf-id`. This is how the AST sync engine round-trips between visual edits and hand-edited code **without losing identity** — the core reliability upgrade over v1.


---

## 9. Workflow C — The Workspace, Tabs & Component Workflow

This is the heart of the product (the part you said matters most: *"the components in tabs and development workflow"*). The workspace shell is shared; each **tab is a feature module** that renders a view over the VFS.

### 9.0 Workspace shell layout
```
┌───────────────────────────────────────────────────────────┐
│ Top bar: brand · main tabs · sync/save status · run · deploy│
├──┬────────────┬───────────────────────────────┬────────────┤
│A │  Sidebar   │        Main canvas/editor      │ Inspector  │
│c │ (panel     │   (active tab's primary view)  │ (props of  │
│t │  switcher) │                                │  selection)│
│iv│            │                                │            │
│ty│            ├───────────────────────────────┤            │
│  │            │ Bottom dock: Terminal · Logs · Preview tabs │
└──┴────────────┴───────────────────────────────┴────────────┘
```
- **Activity bar (A):** tab-aware panel switcher (carry over v1's per-tab `.ab-set` idea, but data-driven).
- **Sidebar:** context panels for the active tab (layers, components, files, tables…).
- **Inspector:** edits props/styles of the current selection (replaces v1 props drawer).
- **Bottom dock:** Terminal (xterm), Logs, Problems, and Preview toggle.
- All panels resizable & collapsible; layout persisted per project in IndexedDB.

### 9.1 Frontend tab — Visual Builder (drag-and-drop)
**Purpose:** build pages visually; output = clean standard HTML/CSS/JS.

- **Canvas:** renders the live page (real DOM, not a screenshot) inside an isolated frame. Selection overlay shows handles/labels as an *overlay layer*, NOT wrapper elements injected into the markup (fixes v1's `.canvas-el` pollution problem). Use `data-sf-id` + an overlay positioned via `getBoundingClientRect`.
- **Sidebar panels:** **Layers** (tree of `BuilderNode`s), **Components** (catalog, 9.3), **Assets**, **Pages**, **Bindings** (9.4), **Design Tokens**.
- **Drag-and-drop (dnd-kit):** drag a catalog component onto a dropzone → instantiate `BuilderNode` → insert into tree → re-render → sync to HTML file in VFS.
- **Inspector:** edit layout (flex/grid), spacing, typography, colors (bound to design tokens / CSS vars), and component-specific props (from `propsSchema`).
- **Direct manipulation:** drag to reorder/resize; edits write to `BuilderNode.styles/classes`, then serialize.
- **Responsive:** device width presets (mobile/tablet/desktop) drive a preview viewport and responsive class authoring.

### 9.2 The Component Workflow (catalog → canvas → code)
The lifecycle of every component, end to end:

1. **Registry load:** on project open, the registry loads the catalog for `manifest.stack` + filters by enabled `uiLibraries`.
2. **Browse/search:** Components panel groups items (Layout, Content, Forms, Navigation, Media, Feedback…). Search + favorites.
3. **Instantiate:** drag onto canvas → `component.render(defaultProps)` → `BuilderNode` subtree with a fresh `data-sf-id`.
4. **Configure:** Inspector renders fields from `propsSchema`; changes update the node and re-render.
5. **Serialize:** the builder tree → HTML via the sync engine (Section 10) → written to the VFS file.
6. **Round-trip:** if the user hand-edits the HTML in the Code tab, the engine re-parses to a `BuilderNode` tree using `data-sf-id` to preserve identity and bindings.
7. **Persist:** VFS → disk (autosave). Output stays clean/portable — removing StateForward leaves valid HTML/CSS/JS.


### 9.3 Component catalog (the items in the Components panel)
Ship a real, useful catalog for `static-web` (each is a `CatalogComponent` producing standard HTML + optional Tailwind classes):

- **Layout:** Section, Container, Grid, Flex Row/Column, Spacer, Divider.
- **Content:** Heading, Paragraph, Rich Text, List, Quote, Badge, Stat.
- **Navigation:** Navbar, Sidebar, Tabs, Breadcrumb, Pagination, Footer, Link.
- **Forms:** Form, Input, Textarea, Select, Checkbox, Radio, Switch, Button, File Upload.
- **Media:** Image, Icon (lucide picker), Avatar, Gallery, Video embed.
- **Feedback:** Alert, Toast, Modal, Tooltip, Progress, Skeleton.
- **Composite presets:** Hero, Card, Feature grid, Pricing table, Testimonial, CTA, Contact section.

Each component declares `requires` (e.g. Tailwind). If a required lib isn't enabled, prompt to enable it. Catalog is **extensible**: adding a component = adding one descriptor file under `core/components/catalog/static-web/`.

### 9.4 Frontend↔Backend binding workflow
- In the **Bindings** panel (or via the inspector), select an element (e.g. a form's Submit button) and bind it to a backend `FlowNode` (e.g. a `route` node).
- Stored as `BindingRef`; serialized into HTML as a `data-sf-bind="<flowNodeId>"` attribute + generated fetch glue in `main.js` (standard, readable code — no proprietary runtime).
- Visible in both views: a badge on the element and a highlight on the flow node.

### 9.5 Backend tab — Node-flow canvas (React Flow)
- Replaces v1 hand-drawn SVG. Nodes: `route`, `validate`, `query`, `integration`, `response`, `function`.
- Editing a node edits `FlowNode.data`; the flow compiles to **real server code** (Express/Hono handlers) for `node-fullstack` stack. For `static-web`, this tab is hidden (per stack's `enabledTabs`).
- Connections = control/data flow; serialized to generated route files.

### 9.6 Database tab
- Visual schema/table designer + ERD (React Flow reused for ERD). Define `DbTable`/`DbColumn`.
- Generates migrations/schema files (e.g. SQL or an ORM schema) for backend stacks. For `static-web`, offer a local mock-data store only.
- Query panel runs against the running backend (real, via WebContainer) — not mocked.

### 9.7 Code tab — Monaco editor
- Full file tree (from VFS) + multi-tab editing + Monaco models per file.
- Diagnostics, formatting (Prettier on save), find/replace, command palette.
- **Two-way sync:** editing `index.html`/`styles.css`/`main.js` here updates the builder model and vice-versa via the sync engine (Section 10). A small "sync direction" guard prevents feedback loops (origin-tagging edits).

### 9.8 Preview + Terminal + Run
- **Preview:** the WebContainer dev server URL rendered in an iframe with device frames + reload + open-in-tab.
- **Terminal:** xterm.js bound to a WebContainer shell process; user can run npm/git/any command for real.
- **Run/Deploy:** `Run` boots/installs/starts the dev server; status reflects in the top bar. Deploy is **[OPEN, later]** (e.g. export, or push to a host).

### 9.9 Settings tab
- Project settings (name, stack, UI libraries toggle, entry, formatting rules) → writes `stateforward.json`.
- Editor/theme settings (accent color → CSS var `--accent`, carry over v1), keybindings, autosave interval.


---

## 10. The Sync Engine (`core/sync/`) — Replaces v1 Regex

The single most important reliability upgrade. **No regex parsing of HTML.**

### 10.1 Pipelines
- **HTML:** `parse5` → AST → transform to/from `BuilderNode` tree. Preserve `data-sf-id` for identity, comments, and whitespace where feasible. Serialize with `parse5` + Prettier.
- **CSS:** `postcss` → AST → read/write rules tied to selectors/design tokens.
- **JS:** `@babel/parser` (or `acorn`) → AST → manage generated binding glue without clobbering user code (use marked regions/comments like `/* sf:bindings:start */`).

### 10.2 Round-trip rules
1. **Visual → Code:** mutate `BuilderNode` tree → serialize → diff against current file → write minimal change to VFS.
2. **Code → Visual:** parse file → rebuild `BuilderNode` tree → reconcile with current selection by `data-sf-id`.
3. **Loop prevention:** every write carries an `origin` ("visual" | "code" | "disk"); the receiving side ignores echoes of its own origin within a debounce window.
4. **Conflict:** if disk changed under us (external edit), surface a non-destructive merge/reload prompt.

### 10.3 Acceptance
Round-trip must be **lossless** for: nested layouts, tables, grids, forms, SVG, comments, and arbitrary attributes. Add a fuzz/snapshot test suite (`core/sync/__tests__`) that parses → serializes → re-parses and asserts structural equality.

---

## 11. Runtime (`core/runtime/` + `platform/webcontainer/`)

- **Boot:** lazily `WebContainer.boot()` once per session (singleton; it can only boot once per tab).
- **Mount:** mirror the VFS into the WebContainer FS on project open; keep in sync on file writes.
- **Install/Run:** spawn `npm install` then the stack's dev command; stream stdout/stderr to the Terminal + Logs.
- **Server-ready:** listen for the `server-ready` event → set preview URL in `runtime.store`.
- **Constraints to honor:** requires COOP/COEP (Section 3); only one container per tab; no native binaries; treat user code as untrusted (it's sandboxed in the tab, which is the security model).
- **Fallback:** if WebContainers unsupported, disable Run/Terminal and show export-only mode (Section 6.4).

---

## 12. Implementation Roadmap (Phased, with Acceptance Criteria)

Build in order. Each phase ends in something demonstrable.

**Phase 0 — Foundation**
Scaffold Next.js 15 + TS + Tailwind + shadcn/ui + lucide. Set COOP/COEP headers. Set up Zustand stores, types (Section 8), lint/format/test.
✅ App boots cross-origin-isolated; `crossOriginIsolated === true`; CI runs Vitest.

**Phase 1 — Dashboard & Project Lifecycle**
Dashboard UI, Create wizard (name + location + stack), `stateforward.json`, FSA + IndexedDB persistence, recent projects, open folder.
✅ Create a `static-web` project to a real local folder, close, reopen from recents, files exist on disk.

**Phase 2 — VFS + Code tab**
VFS as source of truth; file tree; Monaco multi-file editing; autosave to disk; Prettier.
✅ Edit files in Monaco; changes persist to disk and reload correctly.

**Phase 3 — Sync Engine (HTML/CSS/JS AST)**
Implement Section 10 with the lossless round-trip test suite.
✅ Snapshot tests pass for nested/complex markup; no regex anywhere in parsing.

**Phase 4 — Runtime (WebContainer) + Preview + Terminal**
Boot, mount VFS, `npm install`, dev server, live preview iframe, xterm terminal.
✅ `static-web` project runs; preview shows the page; terminal executes real commands.

**Phase 5 — Frontend Visual Builder + Component Catalog**
Canvas with overlay selection (no wrapper pollution), dnd-kit, Layers, Inspector, the Section 9.3 catalog, two-way sync with Code tab.
✅ Drag components, edit props/styles, see clean HTML in Code tab and live changes in Preview; round-trips correctly.

**Phase 6 — Backend flow + Database + Bindings**
React Flow node canvas → generated Express/Hono code; DB designer → schema/migrations; frontend↔backend bindings. (Unlocks `node-fullstack` stack.)
✅ A form bound to a route node submits to a real running backend in WebContainer.

**Phase 7 — Polish & extras [OPEN]**
Git clone/import-export, additional stacks (react-spa), deploy, AI assist, themes, collaboration.

> **Definition of done per phase:** typed, tested, no file > ~400 lines without reason, feature isolated in its folder, no L4→L1 leaks, docs updated.


---

## 13. Migration from the v1 Prototype

The old `index.html` / `app.js` / `styles.css` are a **reference, not a base**. Do not port code; port *ideas*.

| v1 asset | Action in v2 |
|---|---|
| `index.html` layout (top bar, tabs, activity bar, panels) | Reference for the workspace shell (9.0); rebuild as React components. |
| `styles.css` (`--accent` theming, layout) | Extract the design tokens / CSS-variable theme into `styles/`; discard the rest. |
| `app.js` `switchTab`, panel logic | Becomes `ui.store` + routing + feature modules. |
| `updateCodeFromVisual` / `updateVisualFromCode` (regex) | Replaced entirely by the AST sync engine (Section 10). |
| Node canvas (hand-drawn SVG) | Replaced by React Flow (9.5). |
| Mock DB/logs/terminal | Replaced by real WebContainer execution (Section 11). |
| Command palette, toasts, context menu | Rebuild on shadcn/ui primitives. |

**Process:** keep the three v1 files in a `legacy/` folder (or git history) for visual reference during Phases 1 & 5, then delete once parity is reached.

---

## 14. Engineering Conventions (Quality Bar)

- **TypeScript strict**; no `any` without justification. Validate external/manifest data with Zod.
- **One responsibility per file**; co-locate tests. Keep files focused (~≤400 lines).
- **No browser API calls outside `platform/`** (L1). Features never import from `platform/` directly.
- **Stores are small and domain-scoped**; no god-object (the anti-pattern of v1's `State`).
- **Accessibility:** all interactive UI keyboard-navigable; use Radix/shadcn primitives; visible focus.
- **Generated user code must stay clean & portable** — standard HTML/CSS/JS, Prettier-formatted, no proprietary attributes beyond minimal `data-sf-*` (and those must be inert/optional).
- **Commits:** conventional commits; one phase = a series of small PRs.

---

## 15. Security Notes

- **Cross-origin isolation** is mandatory for WebContainers — set headers, verify `crossOriginIsolated`.
- **User project code is untrusted**; it runs sandboxed inside the WebContainer/iframe. Never `eval` user code in the app's own context.
- **File System Access:** only ever write inside the user-granted directory handle; never traverse outside. Re-request permission on stale handles; show clear consent UI.
- **Secrets:** if later adding auth/integrations, never commit secrets; use env files excluded from the project scaffold's writes.

---

## 16. Open Decisions (resolve during build)

- **[OPEN]** Default UI-library set for `static-web` (recommend Tailwind + lucide on).
- **[OPEN]** Firefox/Safari degraded mode UX (export-ZIP vs in-memory-only).
- **[OPEN]** Whether to ship `react-spa` before or after `node-fullstack`.
- **[OPEN]** Deploy targets and AI-assist scope (post-MVP).
- **[OPEN]** Monorepo (pnpm workspaces) vs single package — start single, split if needed.

---

## 17. Definition of "Serious Product, Not a Toy"

The build is only acceptable when a user can, with **no mock data anywhere**:
1. Open the dashboard, create a project, and **choose a real folder location**.
2. Pick the **static-web** stack with UI libraries.
3. **Drag real components** onto a canvas and edit them; see clean code update live.
4. Hand-edit that code in Monaco and see the **builder round-trip** correctly.
5. Click **Run** and get a **real live preview** served by a real dev server, with a **real terminal**.
6. Close the tab, reopen from **recent projects**, and find everything **persisted on disk**.

When all six work reliably for `static-web`, the foundation is real and the remaining stacks/tabs extend it.

# StateForward

> Design your system visually. Get real, production-grade code.

An open-source concept for a desktop IDE where your architecture *is* your codebase. Think IcePanel meets VS Code — a visual canvas with a live, two-way synced code editor alongside it.

Built as an **Electron desktop app** — real filesystem access, real codebases, not a sandbox.

---

## Vision — Where This is Headed

Programming has always moved toward higher levels of abstraction. Binary → assembly → high-level languages. Every step removed complexity and let developers focus more on solving problems than writing instructions.

The next step is moving beyond writing code altogether — not replacing code, but replacing the need to manually produce it.

Instead of writing thousands of lines, developers design systems. They connect architecture, define data flow, business logic, and interactions through visual C4-inspired node graphs. AI translates that architecture into production-ready code using proven libraries, frameworks, and patterns.

**Code becomes the implementation, not the interface.**

The node graph is the source of intent. AI handles the repetitive implementation while developers stay focused on system design, architecture, and product thinking. Not another low-code platform — a development environment where architecture *is* the programming language.

*This is what StateForward is truly building toward.*

---

## The Idea

- **Visual Builder** — drag-and-drop frontend + node-based backend canvas. Every node is real code.
- **Code Editor** — true two-way sync. Change the canvas → code updates. Change the code → canvas updates.
- **Frontend ↔ Backend Binding** — wire UI components directly to backend nodes. No mental mapping.

The output is plain, portable JavaScript. Remove StateForward and the codebase stays intact.

---

## C4 Architecture Canvas

StateForward's canvas is heavily inspired by [IcePanel](https://icepanel.io) and the [C4 model](https://c4model.com) — a way of visualizing software architecture at multiple zoom levels. The key difference: in IcePanel, diagrams are documentation. In StateForward, they generate and stay in sync with real code.

**The canvas operates at 4 levels:**

| Level | What you see | Maps to |
|---|---|---|
| System | Your entire product — services, databases, external APIs | Top-level architecture |
| Container | Inside a service — the apps, queues, caches that make it up | Infrastructure / deployment units |
| Component | Inside a container — route handlers, controllers, queries | Real code modules |
| Code | Inside a component — the actual function or class | Live Monaco editor |

Clicking any node **drills down** to the next level. The back button **zooms out**. You're always navigating the same canvas — just at different granularities.

**Canvas features (planned):**
- Animated data-flow arrows showing how requests and data move between nodes
- Color-coded node types: frontend components, API routes, DB queries, auth, external services
- Grouped zones (e.g. "Backend cluster", "Frontend app") with collapsible boundaries
- Node status indicators — live, draft, broken connection
- Pan, zoom, minimap for large systems
- Click any node at Component level → opens the corresponding file in Monaco

This is the core visual experience. Everything else — code generation, AI, two-way sync — builds on top of this canvas.

---

## Node-First Development

The long-term vision: you work entirely at the node level. Add a node, connect it, configure it — the system writes the code. Delete a node — the code is removed. No boilerplate, no context switching. You operate at the architecture layer; the code layer takes care of itself.

---

## AI Integration

AI wired into the canvas — not a generic sidebar. The IDE already knows your component tree, node graph, and data flows, so AI can act meaningfully: generate a node from a description, wire a component to a backend, refactor across both layers at once. Bring your own API key — no vendor lock-in, works with any major provider or locally via Ollama.

---

## Current State

**This is a UI prototype — an idea preview, not a working product.**

A static mockup (`index.html` + `styles.css` + `app.js`) showing what the IDE could look like. No working canvas, no code generation, no sync engine. I built it to communicate the vision, but don't have the skills to take it further alone.

**Start here:** `doc_dump/snap-design-doc.md` has the full architecture thinking.

---

---

## Tech Foundation

**Target stack:** Electron · React · React Flow · Monaco Editor

Built on proven open-source primitives: [React Flow](https://github.com/xyflow/xyflow) for the node canvas, [Monaco Editor](https://github.com/microsoft/monaco-editor) for the code editor, [Onlook](https://github.com/onlook-dev/onlook) as a two-way sync reference, and [Sandpack](https://github.com/codesandbox/sandpack) for live preview. The current prototype (`index.html`) is a visual spec — a layout reference, not a codebase to build on. See [ROADMAP.md](./ROADMAP.md) for the full milestone breakdown.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

---

## Visualizations / Concept Mockups

> ⚠️ **These are NOT the final project.** The screenshots below are early, rough mockups — a dumb visualisation built to imagine and communicate what the actual product *might* look like. The real implementation may look completely different.

### 🎨 Frontend Builder — Visual Design Canvas

A drag-and-drop interface where components, layout, and styling are built visually. Every element you place maps directly to real HTML and CSS — no generated soup, no lock-in. The properties panel on the right reflects the live component state, just like inspecting code.

![Frontend Builder — Visual Design Canvas](doc/img/Screenshot%202026-06-11%20195637.png)

### 🔀 Backend Canvas — Node-Based API Builder

The backend is a visual flow graph, not a wall of Express boilerplate. Each node is a real operation — HTTP trigger, input validator, database insert, email dispatch. Wire them together and the route code is generated in the panel on the right, live. This is what "architecture as code" looks like in practice.

![Backend Canvas — Node-Based API Builder](doc/img/nodes.png)

### 💻 Code Editor — Always in Sync

The Monaco-powered code tab is a full peer of the canvas, not a read-only view. Edit here and the visual canvas updates. Edit the canvas and the code updates. The file tree on the left is your actual project structure — no abstraction layer hiding what's really on disk.

![Code Editor — Always in Sync](doc/img/codes.png)

### 🗄️ Database — Visual SQLite Explorer

A built-in database viewer so you never leave the IDE to inspect your data. Browse tables, check row counts, run queries, and manage schema — all in one place. The database is a real SQLite file on disk, not a managed cloud service.

![Database — Visual SQLite Explorer](doc/img/Screenshot%202026-06-11%20195659.png)

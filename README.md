# StateForward

> Design your system visually. Get real, production-grade code.

An open-source concept for a desktop IDE where your architecture *is* your codebase. Think IcePanel meets VS Code — a visual canvas with a live, two-way synced code editor alongside it.

Built as an **Electron desktop app** — real filesystem access, real codebases, not a sandbox.

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

AI wired into the canvas like [Onlook](https://github.com/onlook-dev/onlook) — not a generic sidebar. The IDE already knows your component tree, node graph, and data flows, so AI can act meaningfully: generate a node from a description, wire a component to a backend, refactor across both layers at once.

Bring your own API key — no vendor lock-in:

**Paid:** OpenAI · Anthropic  
**Free:** [Google AI Studio](https://aistudio.google.com) · [Groq](https://console.groq.com) · [NVIDIA NIM](https://build.nvidia.com) · [Cerebras](https://cloud.cerebras.ai) · [DeepSeek](https://platform.deepseek.com) · [Mistral](https://console.mistral.ai) · [OpenRouter](https://openrouter.ai)  
**Local:** [Ollama](https://ollama.com) — fully offline, no external calls

---

## Current State

**This is a UI prototype — an idea preview, not a working product.**

A static mockup (`index.html` + `styles.css` + `app.js`) showing what the IDE could look like. No working canvas, no code generation, no sync engine. I built it to communicate the vision, but don't have the skills to take it further alone.

**Start here:** `doc_dump/snap-design-doc.md` has the full architecture thinking.

---

## What Needs Building

- [ ] Two-way sync engine (canvas ↔ code editor)
- [ ] C4-level node canvas with zoom/drill-down navigation
- [ ] Animated data-flow connections between nodes
- [ ] Frontend drag-and-drop builder
- [ ] Code generation (nodes → JS/TS)
- [ ] Electron packaging

See [ROADMAP.md](./ROADMAP.md) for the full milestone breakdown.

---

## Key Open Source Building Blocks

[React Flow](https://github.com/xyflow/xyflow) (canvas) · [Monaco Editor](https://github.com/microsoft/monaco-editor) (code editor) · [GrapesJS](https://github.com/GrapesJS/grapesjs) or [Puck](https://github.com/puckeditor/puck) (frontend builder) · [Onlook](https://github.com/onlook-dev/onlook) (two-way sync reference) · [Sandpack](https://github.com/codesandbox/sandpack) (live preview) · [Appsmith](https://github.com/appsmithorg/appsmith) (UI-backend binding reference)

---

## Development Direction

**Target stack:** Electron + React + React Flow + Monaco Editor

The prototype is a visual spec, not a codebase to build on. Start fresh — use `index.html` only as a layout reference.

Web version is not a separate track. Once the desktop app works, a web build is a straightforward next step.

---

## Getting Started

```bash
git clone https://github.com/rrb-rushikesh/StateForward.git
cd StateForward
# Open index.html in your browser to see the UI reference
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

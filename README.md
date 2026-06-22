# StateForward

> Architecture-first, visual full-stack development platform — design your system visually and get real, production-grade code.

StateForward (codenamed **Snap**) is an open-source IDE concept that bridges the gap between system design and actual code. Think IcePanel meets VS Code: a visual canvas where what you build *is* what runs.

![StateForward Screenshot](./doc_dump/screenshot.png)

## What It Does

Two synchronized environments, one codebase:

- **Visual Builder** — drag-and-drop frontend (Webflow-style) + node-based backend canvas (IcePanel/C4-style). Every node maps to real code.
- **Code Editor** — live two-way sync. Edit visually → code updates. Edit code → canvas updates.
- **Frontend ↔ Backend Binding** — wire UI components to backend nodes through a tagging system. No more mental mapping.

It is **not** a no-code tool. The output is standard, readable, portable JavaScript. Removing StateForward from a project leaves the codebase intact.

## Current State

This is an early-stage UI prototype built as a single-page web app (`index.html` + `styles.css` + `app.js`). The interface is inspired by VS Code and targets a future Electron desktop app.

**What's in the repo:**
- `index.html` — full IDE shell with tab system, activity bar, panels
- `styles.css` — complete styling
- `app.js` — frontend logic
- `doc_dump/` — design documentation and architecture notes

## Getting Started

No build step required — open `index.html` directly in a browser.

```bash
git clone https://github.com/YOUR_USERNAME/StateForward.git
cd StateForward
# Open index.html in your browser
```

## Roadmap / Open Problems

This project needs contributors. Key areas:

- [ ] Real two-way sync engine between visual canvas and code editor
- [ ] Node-based backend canvas (drag-and-drop logic/API/DB nodes)
- [ ] Frontend drag-and-drop builder with component library
- [ ] Code generation layer (visual → JS/TS)
- [ ] Electron packaging for desktop
- [ ] Python, TypeScript, Go project support
- [ ] AI integration for architecture-aware code generation

## Open Source We Can Build On

Rather than writing everything from scratch, StateForward can be assembled from mature, battle-tested open source projects. Each one solves a hard problem we'd otherwise spend months on. These are **recommendations for contributors to evaluate** — not decisions that have been made.

---

### 🎨 Visual Frontend Builder

**[GrapesJS](https://github.com/GrapesJS/grapesjs)** — MIT — ⭐ 23k+  
An embeddable drag-and-drop web builder framework. Handles component trees, CSS editing, canvas rendering, and HTML/CSS export. Designed to be embedded in your own app — not a finished product. This maps almost directly to our frontend builder tab.

**[Puck](https://github.com/puckeditor/puck)** — MIT — ⭐ 9k+  
A lightweight visual editor for React. You define which components are available; Puck handles the drag-and-drop UI. Less opinionated than GrapesJS — better fit if we go React-based.

**[Onlook](https://github.com/onlook-dev/onlook)** — Apache 2.0 — ⭐ 13k+  
The single closest open source project to what StateForward is trying to be. Onlook is a desktop visual editor (Electron) that connects to a real React codebase and writes changes back to code in real time, through DOM instrumentation. Its two-way sync approach and architecture are directly relevant — this is the hard problem we need to solve and Onlook has solved it for the frontend side. Worth reading the source closely.

---

### 🔌 Node-Based Backend Canvas

**[React Flow (xyflow)](https://github.com/xyflow/xyflow)** — MIT — ⭐ 25k+  
The gold standard for node-based editors in React. Handles nodes, edges, handles, zoom/pan, selection, and custom node rendering. Flowise, Langflow, and dozens of production tools are built on it. This is the natural foundation for our backend canvas tab.

**[Flowise](https://github.com/FlowiseAI/Flowise)** — MIT — ⭐ 34k+  
A complete drag-and-drop node canvas built on React Flow, for wiring LLM workflows. It's not what we're building, but it's a proven reference implementation: how nodes are structured, how edges carry data, how the sidebar works. Worth studying and borrowing patterns from.

**[Langflow](https://github.com/langflow-ai/langflow)** — MIT — ⭐ 45k+  
Another node-based visual workflow builder, similar to Flowise but more polished UI. Its component sidebar, canvas layout, and node design patterns are directly applicable to StateForward's backend canvas.

---

### 💻 Embedded Code Editor

**[Monaco Editor](https://github.com/microsoft/monaco-editor)** — MIT  
The exact editor that powers VS Code, available as a standalone embeddable library. Syntax highlighting, IntelliSense, multi-file support, diff view — everything we need for the code editor pane. The obvious choice.

**[Sandpack (by CodeSandbox)](https://github.com/codesandbox/sandpack)** — Apache 2.0 — ⭐ 4.5k+  
A component toolkit from CodeSandbox for creating live-running code editing experiences in the browser. Bundles and executes modern JS frameworks client-side with no backend needed. Ideal for the live preview panel — pair it with Monaco and you have a full in-browser IDE experience.

**[CodeSandbox SDK](https://github.com/codesandbox/codesandbox-sdk)** — see repo  
CodeSandbox's newer SDK for programmatically spinning up sandboxes, now targeting AI/agent use cases. Relevant if we eventually want a hosted execution environment for user projects rather than pure in-browser bundling.

---

### 🏗️ Architecture & Workflow Reference

**[Windmill](https://github.com/windmill-labs/windmill)** — AGPLv3 — ⭐ 12k+  
An open-source developer platform that turns scripts into workflows and UIs with a visual builder. Scripts are nodes, connections carry data, and the output is real running code — structurally the closest real-world implementation to what StateForward's backend canvas should feel like. AGPLv3 means it can't be embedded directly in a commercial product without open-sourcing everything, but its architecture and UX are excellent reference material.

**[Retool (open source alternative: Appsmith)](https://github.com/appsmithorg/appsmith)** — Apache 2.0 — ⭐ 35k+  
A visual app builder where you wire UI widgets to backend queries and APIs. StateForward's frontend-to-backend binding system is solving a similar problem — Appsmith's binding model (how a button connects to a query, how data flows from an API into a component) is directly worth studying.

**[n8n](https://github.com/n8n-io/n8n)** — fair-code (sustainable use license) — ⭐ 50k+  
A visual workflow automation tool with a mature, polished node canvas. The UX of n8n's canvas — node sidebar, connection handles, inline node configuration — is a strong reference for how a professional node-based editor should feel. License restricts commercial use, so study don't embed.

---

> Licenses should be verified before any integration. MIT and Apache 2.0 can be embedded freely. AGPLv3 and fair-code licenses may have commercial restrictions — use these as architecture references only unless the project is staying open source.

## Contributing

Contributions are very welcome — this project exists because I couldn't build it alone.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE)

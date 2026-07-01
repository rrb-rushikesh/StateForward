# StateForward

> **Design your system visually. Get real, production-grade code.**

---

Programming has always moved toward higher levels of abstraction. We started with binary. Then assembly. Then high-level languages. Every step removed complexity and let developers focus more on solving problems than writing instructions.

I believe the next step is moving beyond writing code altogether. The goal isn't to replace code, it is to replace the need to manually produce it.

Instead of writing thousands of lines, developers design systems. They connect architecture, define data flow, business logic, and interactions through visual C4-inspired node graphs. AI translates that architecture into production-ready code using proven libraries, frameworks, and patterns.

> ### 💡 Code becomes the implementation, not the interface.
> The node graph is the source of intent. AI handles the repetitive implementation while developers stay focused on system design, architecture, and product thinking.

This is the direction Snap is built toward, not another low-code platform, but a development environment where architecture becomes the programming language:

*   **🎨 Visual Builder:** Drag-and-drop frontend + node-based backend canvas. Every node is real code.
*   **💻 Code Editor:** True two-way sync. Change the canvas → code updates. Change the code → canvas updates.
*   **🔌 Frontend ↔ Backend Binding:** Wire UI components directly to backend nodes. No mental mapping.

---

### ⚙️ Core Philosophy

*   **No Lock-in:** The output is plain, portable JavaScript. Remove StateForward and the codebase stays intact.
*   **Desktop Native:** Built as an **Electron desktop app** with real filesystem access, real codebases, and not a sandbox.

---

## C4 Architecture Canvas

StateForward's canvas is heavily inspired by [IcePanel](https://icepanel.io) and the [C4 model](https://c4model.com), a way of visualizing software architecture at multiple zoom levels. The key difference is that in IcePanel, diagrams are documentation. In StateForward, they generate and stay in sync with real code.

**The canvas operates at 4 levels:**

| Level | What you see | Maps to |
|---|---|---|
| System | Your entire product, services, databases, external APIs | Top-level architecture |
| Container | Inside a service, the apps, queues, caches that make it up | Infrastructure / deployment units |
| Component | Inside a container, route handlers, controllers, queries | Real code modules |
| Code | Inside a component, the actual function or class | Live Monaco editor |

Clicking any node **drills down** to the next level. The back button **zooms out**. You're always navigating the same canvas, just at different granularities.

**Canvas features (planned):**
*   Animated data-flow arrows showing how requests and data move between nodes
*   Color-coded node types: frontend components, API routes, DB queries, auth, external services
*   Grouped zones (e.g. "Backend cluster", "Frontend app") with collapsible boundaries
*   Node status indicators: live, draft, broken connection
*   Pan, zoom, minimap for large systems
*   Click any node at Component level → opens the corresponding file in Monaco

This is the core visual experience. Everything else, including code generation, AI, and two-way sync, builds on top of this canvas.



---

## Current State & Visualizations

**This is a UI prototype: an idea preview, not a working product.**

A static mockup (`index.html` + `styles.css` + `app.js`) showing what the IDE could look like. No working canvas, no code generation, no sync engine. I built it to communicate the vision, but don't have the skills to take it further alone.

> ⚠️ **These are NOT the final project.** The screenshots below are early, rough mockups: a dumb visualisation built to imagine and communicate what the actual product *might* look like. The real implementation may look completely different.

### 🎨 Frontend Builder

![Frontend Builder](img/Screenshot%202026-06-11%20195637.png)

### 🔀 Backend Node Canvas

![Backend Node Canvas](img/nodes.png)

### 💻 Code Editor

![Code Editor](img/codes.png)

### 🗄️ Database Viewer

![Database Viewer](img/Screenshot%202026-06-11%20195659.png)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

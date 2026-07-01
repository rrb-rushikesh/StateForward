# Roadmap

This is the build order. Each milestone unblocks the next.

---

## Milestone 1 — Foundation
**Goal:** A real Electron + React app that looks like the prototype.

- [ ] Bootstrap Electron + React + Vite project
- [ ] Reproduce the IDE shell: top bar, tab system, activity bar, side panels
- [ ] Embed Monaco Editor in the code editor pane

**Reference:** `index.html` is the visual spec. Match the layout, not the code.

---

## Milestone 2 — Node Canvas
**Goal:** A working node-based backend canvas.

- [ ] Integrate React Flow in the backend tab
- [ ] Basic draggable nodes: API route, DB query, function, middleware
- [ ] Node sidebar with available node types
- [ ] Edges connecting nodes with data flow

---

## Milestone 3 — Frontend Builder
**Goal:** A drag-and-drop frontend page builder.

- [ ] Integrate GrapesJS or Puck in the frontend tab
- [ ] Component sidebar (buttons, forms, layout containers)
- [ ] Canvas renders real HTML/CSS output

---

## Milestone 4 — Two-Way Sync
**Goal:** Changes in the canvas reflect in the code editor and vice versa.

- [ ] Canvas → code: any visual change updates the corresponding file
- [ ] Code → canvas: editing code updates the visual representation
- [ ] Reference: study how [Onlook](https://github.com/onlook-dev/onlook) handles DOM instrumentation

This is the hardest milestone. It's also the core of the product.

---

## Milestone 5 — Code Generation
**Goal:** Nodes on the backend canvas generate real, runnable code.

- [ ] Each node type has a code template
- [ ] Connecting nodes generates the wiring code
- [ ] Output is standard JS/TS — no custom runtime

---

## Milestone 6 — AI Integration
**Goal:** AI that understands the canvas and acts on it.

- [ ] Settings panel: plug in any API key (OpenAI, Anthropic, Groq, NVIDIA NIM, Ollama, etc.)
- [ ] AI can generate a node from a text description
- [ ] AI can wire a frontend component to a backend node
- [ ] Context-aware: AI reads the current canvas state before acting

---

## Future
- Python, TypeScript, Go project support
- Web build (Electron → browser, low effort once core is done)
- Multi-file project support
- Git integration inside the IDE

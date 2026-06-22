# StateForward

> Design your system visually. Get real, production-grade code.

StateForward (codenamed **Snap**) is an open-source concept for a desktop IDE that bridges the gap between system design and actual development. Think IcePanel meets VS Code — a visual canvas where what you build *is* what runs.

The target is an **Electron desktop app**, not a web app. The reason: real two-way sync between a visual canvas and actual code on disk requires filesystem access — something only a desktop app can do properly.

---

## The Idea

Two synchronized environments, one codebase:

- **Visual Builder** — drag-and-drop frontend builder + node-based backend canvas. Every node maps to real code.
- **Code Editor** — true two-way sync. Edit visually → code updates. Edit code → canvas updates.
- **Frontend ↔ Backend Binding** — wire UI components to backend nodes directly. No mental mapping.

Not a no-code tool. The output is standard, readable JavaScript. Remove StateForward from a project and the codebase stays intact.

---

## Current State

**This is an early UI prototype — an idea preview, not a finished product.**

What exists today is a static single-page mockup (`index.html` + `styles.css` + `app.js`) that shows what the IDE interface could look like. There's no working canvas, no code generation, no sync engine. The codebase exists to communicate the vision, not to run a real workflow.

I built this to explore the concept, but I don't have the skills or bandwidth to take it further alone. That's why it's open source — the idea is solid, and I'd rather it get built properly with community contributions than sit unfinished.

**If you're a contributor:** read `doc_dump/snap-design-doc.md` for the full vision and architecture thinking. That's where the real depth is.

---

## What Needs Building

- [ ] Two-way sync engine (visual canvas ↔ code editor)
- [ ] Node-based backend canvas (logic / API / DB nodes)
- [ ] Frontend drag-and-drop builder
- [ ] Code generation layer (nodes → real JS/TS)
- [ ] Electron packaging
- [ ] Language support: TypeScript, Python, Go

---

## Open Source Building Blocks

Rather than starting from scratch, most of the hard problems here are already solved by mature open source projects:

| What we need | Project | License |
|---|---|---|
| Frontend visual builder | [GrapesJS](https://github.com/GrapesJS/grapesjs) | MIT |
| React-based page builder | [Puck](https://github.com/puckeditor/puck) | MIT |
| Two-way sync reference | [Onlook](https://github.com/onlook-dev/onlook) | Apache 2.0 |
| Node canvas engine | [React Flow](https://github.com/xyflow/xyflow) | MIT |
| Node canvas reference | [Flowise](https://github.com/FlowiseAI/Flowise) | MIT |
| Node canvas reference | [Langflow](https://github.com/langflow-ai/langflow) | MIT |
| Embedded code editor | [Monaco Editor](https://github.com/microsoft/monaco-editor) | MIT |
| In-browser live preview | [Sandpack](https://github.com/codesandbox/sandpack) | Apache 2.0 |
| Workflow architecture ref | [Windmill](https://github.com/windmill-labs/windmill) | AGPLv3 |
| UI-to-backend binding ref | [Appsmith](https://github.com/appsmithorg/appsmith) | Apache 2.0 |

> AGPLv3 projects like Windmill are reference only — don't embed them directly.

---

## Getting Started

No build step — open `index.html` in a browser to see the UI prototype.

```bash
git clone https://github.com/rrb-rushikesh/StateForward.git
cd StateForward
# Open index.html in your browser
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

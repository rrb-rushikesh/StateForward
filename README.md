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

## Node-First Development

The long-term vision goes beyond visual editing. Instead of writing code, you work entirely at the node level — adding, connecting, configuring, and deleting nodes. The system handles all code generation underneath. No boilerplate, no scaffolding, no context switching. You operate at the architecture layer; the code layer takes care of itself.

---

## AI Integration

AI should work like it does in [Onlook](https://github.com/onlook-dev/onlook) — context-aware and wired into the canvas, not a generic chat sidebar. Since the IDE already understands your component tree, node graph, and data flows, AI can act meaningfully: generate a node from a description, wire a component to a backend, refactor across both layers at once.

The settings panel will let you bring your own API key from any provider:

**Paid:** OpenAI · Anthropic  
**Free tier:** [Google AI Studio](https://aistudio.google.com) · [Groq](https://console.groq.com) · [NVIDIA NIM](https://build.nvidia.com) · [Cerebras](https://cloud.cerebras.ai) · [DeepSeek](https://platform.deepseek.com) · [Mistral](https://console.mistral.ai) · [OpenRouter](https://openrouter.ai)  
**Local / offline:** [Ollama](https://ollama.com)

No vendor lock-in. Ollama support means fully offline usage with no external calls.

---

## Current State

**This is a UI prototype — an idea preview, not a working product.**

What's here is a static mockup (`index.html` + `styles.css` + `app.js`) showing what the IDE could look like. No working canvas, no code generation, no sync engine.

I built this to explore the concept but don't have the skills to take it further alone. The idea is solid — I'd rather see it built properly through open source than sit unfinished.

**Start here:** `doc_dump/snap-design-doc.md` has the full architecture thinking.

---

## What Needs Building

- [ ] Two-way sync engine (canvas ↔ code editor)
- [ ] Node-based backend canvas (logic / API / DB nodes)
- [ ] Frontend drag-and-drop builder
- [ ] Code generation (nodes → JS/TS)
- [ ] Electron packaging
- [ ] TypeScript, Python, Go support

---

## Open Source Building Blocks

| What we need | Project | License |
|---|---|---|
| Frontend visual builder | [GrapesJS](https://github.com/GrapesJS/grapesjs) | MIT |
| React page builder | [Puck](https://github.com/puckeditor/puck) | MIT |
| Two-way sync reference | [Onlook](https://github.com/onlook-dev/onlook) | Apache 2.0 |
| Node canvas engine | [React Flow](https://github.com/xyflow/xyflow) | MIT |
| Node canvas reference | [Flowise](https://github.com/FlowiseAI/Flowise) · [Langflow](https://github.com/langflow-ai/langflow) | MIT |
| Code editor | [Monaco Editor](https://github.com/microsoft/monaco-editor) | MIT |
| Live preview | [Sandpack](https://github.com/codesandbox/sandpack) | Apache 2.0 |
| Workflow reference | [Windmill](https://github.com/windmill-labs/windmill) | AGPLv3 ⚠️ |
| UI-backend binding ref | [Appsmith](https://github.com/appsmithorg/appsmith) | Apache 2.0 |

> ⚠️ AGPLv3 = reference only, do not embed directly.

---

## Getting Started

```bash
git clone https://github.com/rrb-rushikesh/StateForward.git
cd StateForward
# Open index.html in your browser
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

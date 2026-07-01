<div align="center">

# ⚡ StateForward

### Build Full-Stack Apps — Visually & In Code

*A browser-based, visual-first full-stack web IDE where every visual edit produces real code and every code change reflects on the canvas — instantly.*

[![Status](https://img.shields.io/badge/status-concept%20%2F%20WIP-orange?style=flat-square)](https://github.com/rrb-rushikesh/StateForward)
[![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20TypeScript%20%7C%20Tailwind-blue?style=flat-square)](./doc/PLAN.md)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)

</div>

---

> [!WARNING]
> **⚠️ This is NOT the final project.**
> The screenshots and UI shown below are **early concept visualizations** — a rough, "dumb" prototype built to imagine and communicate what the actual product *might* look like. Think of it as a napkin sketch turned into pixels. The real implementation is planned and documented in [`doc/PLAN.md`](./doc/PLAN.md). Expect everything to change.

---

## 🧠 What is StateForward?

StateForward is a **browser-based, visual-first full-stack web IDE**. You create a project, then design, build, run, and ship a website from **four synchronized tabs**:

| Tab | What it does |
|---|---|
| 🎨 **Frontend** | Drag-and-drop visual builder — move a button, get clean HTML/CSS |
| 🔀 **Backend** | Node-flow canvas — wire HTTP triggers, DB inserts, validators, email nodes |
| 🗄️ **Database** | Visual table designer with schema, query, and migrations |
| 💻 **Code** | Monaco-powered editor — edit code, watch the canvas update live |

> **Visual ↔ Code sync is bidirectional.** Edit visually → code updates. Edit code → canvas updates. No lock-in. Standard output. Remove StateForward — your codebase still runs.

---

## 🖼️ Concept Visualizations

> These are **early mockups** — rough illustrations of the envisioned UI. Not final. Not production. Just a way to *see* the idea before building it.

### 🎨 Frontend Builder — Visual Design Canvas

The drag-and-drop frontend editor. Components panel on the left, live preview in the center, and property inspector on the right. Every element maps 1:1 to real HTML/CSS.

![Frontend Builder — Visual Design Canvas](doc/img/Screenshot%202026-06-11%20195637.png)

---

### 🔀 Backend Canvas — Node-Based API Builder

Wire together your backend logic visually. Each node is a real operation — HTTP trigger, middleware validator, DB insert, email sender. Connect them, and StateForward generates the actual Express route code shown in the panel on the right.

![Backend Canvas — Node-Based API Builder](doc/img/nodes.png)

---

### 💻 Code Editor — Synchronized with the Canvas

The Monaco-based code editor tab. Write or edit code here and the visual canvas reflects the changes. The project structure on the left mirrors your actual file system — no magic, no abstraction.

![Code Editor — Synchronized with the Canvas](doc/img/codes.png)

---

### 🗄️ Database Viewer — Built-in SQLite Explorer

Browse your SQLite database visually. See tables, row counts, data, schema, and run queries — all inside the IDE, no external tool needed.

![Database Viewer — Built-in SQLite Explorer](doc/img/Screenshot%202026-06-11%20195659.png)

---

## 🏗️ Architecture (Planned)

```
StateForward
├── Frontend Builder   — drag-and-drop (dnd-kit + React Flow)
├── Backend Canvas     — node flow (React Flow)
├── Database Designer  — schema + query UI
├── Code Editor        — Monaco
└── Sync Engine        — AST-level bidirectional sync (parse5 / Babel / postcss)
```

**Tech Stack:**
`Next.js 15` · `TypeScript` · `Tailwind CSS` · `shadcn/ui` · `Monaco` · `xterm.js` · `WebContainers` · `File System Access API` · `Zustand` · `React Flow` · `dnd-kit`

Full rationale → [`doc/PLAN.md §3`](./doc/PLAN.md)

---

## 📁 Current State of the Repo

| File / Folder | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | **v1 prototype** — monolithic static mockup, UI only, simulated data. Kept as visual reference only. |
| `doc/PLAN.md` | **The real spec** — full architecture, roadmap, acceptance criteria |
| `doc/README.md` | Internal docs entry point |
| `doc/img/` | Concept screenshots (what you see above) |

---

## 📋 Roadmap

- [ ] Phase 1 — Project shell, dashboard, routing
- [ ] Phase 2 — Frontend builder (core components)
- [ ] Phase 3 — Code editor + AST sync engine
- [ ] Phase 4 — Backend canvas + route generation
- [ ] Phase 5 — Database designer + WebContainers runtime
- [ ] Phase 6 — Deploy pipeline

Full phased plan → [`doc/PLAN.md §12`](./doc/PLAN.md)

---

## 📖 Docs

| Topic | Link |
|---|---|
| Full plan & architecture | [`doc/PLAN.md`](./doc/PLAN.md) |
| Internal docs | [`doc/README.md`](./doc/README.md) |

---

<div align="center">

**StateForward** — *Visual + Code. Always Synchronized.*

*This project is in early concept stage. Everything shown is a work-in-progress visualization.*

</div>

# StateForward — Documentation

StateForward is a browser-based, visual-first **full-stack web IDE**. You create a project (name + real folder location + stack), then design, build, run, and ship a website from synchronized tabs — a **Frontend** drag-and-drop builder, a **Backend** node-flow canvas, a **Database** designer, and a **Code** editor — where every visual edit produces clean, standard, portable code and vice-versa.

> **The authoritative build spec is [`../PLAN.md`](../PLAN.md).** It is the single source of truth for vision, architecture, tech stack, workflows, data models, the sync engine, the phased roadmap, and acceptance criteria. Start there.

---

## Core principles

- **Visual-first, code-honest.** The visual builder and the Code editor are two views over the same files. Output is standard HTML/CSS/JS — no lock-in, no proprietary runtime. Remove StateForward and the codebase still works.
- **Real, not mocked.** Real local folder persistence (File System Access API), real execution (WebContainers run Node.js in the browser), real terminal (xterm.js), real preview.
- **VS Code-style entry.** A dashboard with project create/open/recent and explicit location selection.
- **Modular by design.** Five layers (shell → features → core services → state → platform adapters); each tab is a self-contained feature module. See PLAN.md §4–5.

## Tech stack (decided)

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) · lucide-react · Monaco editor · xterm.js · WebContainers · File System Access API + IndexedDB · Zustand · React Flow · dnd-kit · parse5 / postcss / Babel (AST sync). Full rationale in PLAN.md §3.

## Status

Migrating from a v1 prototype (a monolithic 3-file static mockup: `index.html`, `app.js`, `styles.css` — UI only, mostly simulated data, no real filesystem or execution) to the modular v2 architecture defined in PLAN.md. The v1 files are kept only as a visual reference during the rebuild (PLAN.md §13).

## Where to read next

| Topic | Location |
|---|---|
| Full plan & architecture | [`../PLAN.md`](../PLAN.md) |
| Dashboard & project lifecycle | PLAN.md §6 |
| Stack selection & starters | PLAN.md §7 |
| Workspace, tabs & component workflow | PLAN.md §9 |
| AST sync engine | PLAN.md §10 |
| Phased roadmap & acceptance criteria | PLAN.md §12 |

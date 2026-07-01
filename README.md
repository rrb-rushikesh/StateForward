# StateForward

*Design the system. Let the code follow.*

---

Programming has always moved toward higher abstraction.

Binary → assembly → high-level languages. Each step let developers stop thinking about *how* and start thinking about *what*.

The next step is to stop writing code altogether — not to replace it, but to stop producing it by hand. You design the system. AI fills in the implementation. **Code becomes the output, not the work.**

StateForward is a desktop IDE built around this idea. Your architecture canvas *is* your codebase. Every node you place, every connection you draw — generates real, portable code. Edit the code, and the canvas reflects it back.

No lock-in. No proprietary runtime. Remove StateForward and your project still runs.

*This is not another low-code tool. It's a development environment where architecture becomes the programming language.*

---

## The Canvas

Inspired by the [C4 model](https://c4model.com) — one canvas, four zoom levels:

| Zoom in | You're looking at |
|---|---|
| **System** | Your whole product — services, databases, external APIs |
| **Container** | Inside a service — apps, queues, caches |
| **Component** | Route handlers, controllers, queries |
| **Code** | The actual function — live in Monaco |

Click any node to drill down. Back to zoom out. You're always in the same canvas — just at a different depth.

Every node is a real operation. Wire an HTTP trigger to a validator, a DB insert, an email sender — and the route code writes itself in the panel beside it. AI lives inside the canvas too, not in a sidebar. It already knows your architecture, so it can act on it meaningfully.

---

## Where it is now

**This is a UI prototype. Not a working product.**

A static mockup (`index.html` + `app.js` + `styles.css`) built to make the idea visible and communicable — not to ship. No sync engine, no code generation, no real filesystem yet.

The full architecture thinking is in [`doc_dump/snap-design-doc.md`](./doc_dump/snap-design-doc.md). The roadmap is in [ROADMAP.md](./ROADMAP.md).

---

## Concept snapshots

> Early mockups — rough, imperfect, not final. Here to make the idea visible, not to demonstrate a product.

<br>

**🎨 Frontend — Visual Builder**
*Drag components onto a canvas. Get real HTML and CSS. The properties panel is live — change a value here, see it in code.*

![Frontend Builder](doc/img/Screenshot%202026-06-11%20195637.png)

<br>

**🔀 Backend — Node Canvas**
*Each node is a real backend operation. Wire them together and the Express route appears on the right, generated and in sync.*

![Backend Canvas](doc/img/nodes.png)

<br>

**💻 Code — Always Synced**
*A full Monaco editor, not a read-only view. Edit here, the canvas updates. Edit the canvas, the code updates. The file tree is your real project on disk.*

![Code Editor](doc/img/codes.png)

<br>

**🗄️ Database — Built In**
*Browse tables, inspect rows, run queries — without leaving the IDE. A real SQLite file on disk, nothing managed or hidden.*

![Database Viewer](doc/img/Screenshot%202026-06-11%20195659.png)

---

## Built on

**Electron · React · [React Flow](https://github.com/xyflow/xyflow) · [Monaco Editor](https://github.com/microsoft/monaco-editor)**

Also referencing [Onlook](https://github.com/onlook-dev/onlook) for two-way sync and [Sandpack](https://github.com/codesandbox/sandpack) for live preview.

---

[Contributing](./CONTRIBUTING.md) · [MIT License](./LICENSE)

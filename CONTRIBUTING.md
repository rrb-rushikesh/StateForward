# Contributing to StateForward

Thanks for your interest! This project is in early prototype stage — there's a lot of open ground to cover and all contributions are welcome.

## What We Need Most

- **Canvas engine** — the node-based backend canvas (logic/API/DB nodes)
- **Two-way sync** — keeping the visual canvas and code editor in sync
- **Frontend builder** — drag-and-drop UI component system
- **Code generation** — translating visual nodes → real JS/TS code
- **Electron packaging** — turn this into a desktop app
- **Bug fixes & UI polish** — things that look broken or feel off

## How to Contribute

1. Fork the repo
2. Create a branch: `git checkout -b your-feature-name`
3. Make your changes
4. Open a pull request with a clear description of what you did and why

## Project Structure

```
index.html   — IDE shell (tabs, panels, activity bar)
styles.css   — all styling
app.js       — frontend logic
doc_dump/    — design docs and architecture notes (read these first)
```

## Guidelines

- Read `doc_dump/snap-design-doc.md` before making architectural decisions — it explains the vision in detail.
- Keep code readable and standard. No new frameworks without discussion.
- Open an issue first for large changes so we can align before you invest time.

## Questions?

Open a GitHub issue. That's it.

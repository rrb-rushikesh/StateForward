# Contributing to StateForward

This project is an early-stage idea prototype. The concept is solid but the implementation barely exists — that's exactly why contributions matter here. You're not polishing a finished product, you're helping build the foundation.

## Where to Start

Read `doc_dump/snap-design-doc.md` before anything else. It has the full vision and architecture thinking.

## What's Most Needed

- **Canvas engine** — node-based backend canvas (logic / API / DB nodes)
- **Two-way sync** — keeping the visual canvas and code editor in sync
- **Frontend builder** — drag-and-drop UI component system
- **Code generation** — visual nodes → real JS/TS
- **Electron packaging** — turn this into a desktop app

## How to Contribute

1. Fork the repo
2. Create a branch: `git checkout -b your-feature`
3. Make your changes
4. Open a pull request with a clear description

## Project Structure

```
index.html        — IDE shell (current UI prototype)
styles.css        — styling
app.js            — frontend logic
doc_dump/         — design docs and architecture notes
```

Open an issue first for large changes so we can align before you invest time.

# Chill CV

An interactive CV / portfolio with two screens:

- **Home** — a Chill-FM-inspired retro radio dashboard. Music page is preserved as the brand vibe.
- **Stack** — a 3D card stack of personal projects. Click a card to peek, click again for the full case study.

The AI assistant is repurposed as a resume archivist powered by LongCat (`LongCat-Flash-Chat`). Visitors can ask questions about the owner's experience, skills, and projects through `/api/ask-resume`.

## Quick start

```fish
npm install
npm run build:stack            # builds the 3D project stack into public/
vercel dev --listen 0.0.0.0:43100
```

For local AI testing, set `LONGCAT_API_KEY` in a local `.env` file (see `.env.example`).

## Architecture

This project is forked from the `chill-fm` codebase. See `AGENTS.md` and `docs/` for the file map, decisions, and conventions.

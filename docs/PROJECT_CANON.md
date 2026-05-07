# Project Canon

This file defines stable project rules for Chill CV. It should change rarely and only with explicit human approval.

## Product Identity

Chill CV is an interactive personal CV / portfolio that wears a retro radio interface. The vibe is jazz hip-hop late-night archive terminal; the function is a credible recruiter-readable resume.

## Core Experiences

- The main FM screen is the brand vibe and entry. Music playback should continue across UI transitions whenever possible.
- The launch radio screen is an intentional entry ritual; only the radio should trigger entry.
- The right-side gallery and player controls remain visually integrated with the radio concept.
- The `3d-album-stack` workspace is the project showcase, loaded through an iframe to preserve its own interaction model.
- The AI assistant is a resume archivist for questions about the owner's experience, skills, and projects — not a generic chatbot, not a music chatbot.

## Music Direction (Home vibe only)

The Home screen retains the jazz hip-hop catalog from chill-fm. This is intentional brand vibe; do not drift the catalog toward generic pop, and do not remove the music page unless explicitly requested.

## Visual Direction

Preserve the retro radio / dot-matrix / archive terminal mood:

- tactile controls
- restrained contrast
- noir or late-night atmosphere
- canvas or dot-matrix display elements
- intentional motion rather than generic animation

Avoid:

- generic SaaS dashboard styling
- default purple gradients
- unrelated futuristic glassmorphism

## Technical Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS via `@tailwindcss/vite`
- `motion`
- `lucide-react`
- npm workspaces

The root package owns dependency installation and the root `package-lock.json`. `3d-album-stack` is an npm workspace package; do not add a separate `3d-album-stack/package-lock.json`.

## Architecture Principles

- Prefer incremental refactors over large rewrites.
- Keep behavior stable while extracting modules.
- Preserve iframe isolation for `3d-album-stack` unless the human explicitly approves a deeper integration.
- Keep playback state stable and avoid remounting the playback host during visual UI changes.
- Keep AI provider logic behind `src/services/aiService.ts` and `api/ask-resume.js`.

## AI Rules

- The AI assistant uses LongCat with `LongCat-Flash-Chat` (OpenAI-compatible API at `https://api.longcat.chat/openai/v1`).
- The assistant persona is archival, factual, and concise. It must not invent facts beyond `RESUME_SUMMARY` in `api/ask-resume.js`.
- Do not hardcode real API keys in source files.
- AI calls must cross the `/api/ask-resume` server boundary. Provider keys must never reach browser bundles.

## Project Card Rules (Stack screen)

- Each project card is a curated case study with: project name, role / context, year, tech stack pills, short description, multi-paragraph story, and one external link via `WIKI_CONTEXT`.
- Card data lives in `3d-album-stack/src/App.tsx` (`ALBUMS` and `WIKI_CONTEXT` — names are historical).
- Preserve the original interaction pattern: idle stack → first-click peek → second-click full content.
- Keep the stack iframe-isolated unless a future decision explicitly changes this.

## Verification Rules

- `npm run lint` and `npm run build`
- For `3d-album-stack/` changes also `npm run lint:stack`
- For interaction-heavy UI, prefer a browser/dev-server check when practical.

## Documentation Rules

- Update `docs/ARCHITECTURE.md` when module boundaries or data flow change.
- Update `docs/DECISIONS.md` when a notable architecture choice is made.
- Update `docs/CODEBASE_INDEX.md` when important files move.
- Update `docs/memory.md` after completing work so the next session can continue without chat history.
- `docs/PROJECT_CANON.md` should only change with explicit human permission.

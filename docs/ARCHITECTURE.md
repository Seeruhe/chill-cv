# Architecture

Chill CV is a Vite + React single page app forked from `chill-fm`. It keeps the music FM as the Home screen vibe, and repurposes the 3D Stack screen as a personal projects showcase. The AI assistant is a server-side LongCat archivist for resume questions.

## Main App Flow

- `src/main.tsx` mounts React.
- `src/App.tsx` owns the main runtime state: playback, theme, language, layered screen routing, gallery selection, project panels, and the AI modal.
- `src/services/aiService.ts` owns the browser-side assistant request wrapper and calls `/api/ask-resume`. Provider-neutral by design.
- `api/ask-resume.js` owns the LongCat (OpenAI-compatible) request, prompt construction with `RESUME_SUMMARY`, and server-side `LONGCAT_API_KEY` access.
- `3d-album-stack/` is built as an npm workspace and copied into the main static output by `scripts/build-with-stack.mjs`. It hosts the 3D project card stack.
- The root `package.json` owns dependency installation and the single root `package-lock.json`.

## Module Boundaries

- `src/types/` stores shared TypeScript shapes.
- `src/data/` stores the music library data inherited from chill-fm (kept for the Home screen vibe).
- `src/lib/` stores browser/API helpers that are not React components.
- `src/utils/` stores small pure helpers.
- `src/components/` stores reusable UI islands extracted from `App.tsx`.

## Integration Rules

- Keep the YouTube playback host mounted outside collapsed UI so playback continues while the radio is hidden.
- Keep the 3D project stack in an iframe to preserve its own interaction model (idle stack → peek → full).
- Home and Stack are independent layered screens, not a shared horizontal `200vw` layout. Home may stay mounted for playback continuity, while Stack appears as a fixed overlay.
- Stack theme changes are coordinated from the parent `StackScreen` to the iframe via `postMessage` with `type: "STACK_THEME"`; the iframe owns its own CSS theme rendering.
- LongCat access must cross a server boundary through `/api/ask-resume`; do not inject `LONGCAT_API_KEY` into Vite or frontend bundles.
- The stack workspace should not inject AI provider keys into its iframe bundle.
- Use npm workspaces for dependency sharing; do not add a separate `3d-album-stack/package-lock.json`.
- Project card data lives in `3d-album-stack/src/App.tsx` (`ALBUMS` and `WIKI_CONTEXT`). The variable names are historical; the data they hold is project / portfolio content.

active_area: bootstrap
current_task: Initial scaffold of chill-cv as a fork of chill-fm.
relevant_files:
  - api/ask-resume.js
  - src/services/aiService.ts
  - src/App.tsx
  - 3d-album-stack/src/App.tsx
  - AGENTS.md
  - docs/
assumptions:
  - The project uses LongCat (Meituan) for the AI assistant via the OpenAI-compatible endpoint.
  - LongCat calls must stay server-side because the repo is public and frontend bundles are inspectable.
  - Home screen keeps the music FM interface as brand vibe; Stack screen is the project showcase.
done:
  - 2026-05-08: Forked /root/claude/MyChill into /root/claude/chill-cv via tar pipe (excluded node_modules, .git, dist, public, .vercel, .env, package-lock.json).
  - 2026-05-08: Renamed package fields to chill-cv; updated index.html title and metadata.json; rewrote README.
  - 2026-05-08: Replaced 3d-album-stack ALBUMS array with 6 placeholder project cards and WIKI_CONTEXT with one Chill-CV self-reference plus a usage comment block.
  - 2026-05-08: Removed unused 3d-album-stack/src/data/albums.ts.
  - 2026-05-08: Renamed api/ask-artist.js → api/ask-resume.js and rewrote the route to a resume archivist with editable OWNER_NAME and RESUME_SUMMARY constants. Model is instructed not to invent beyond the summary.
  - 2026-05-08: Updated src/services/aiService.ts to export askAboutResume(question, language, topic?). Updated src/App.tsx import + handleAiConsult to pass artist as topic hint.
  - 2026-05-08: Changed Home screen CTA from "Boring? Click and View More Story" to "Browse My Projects →".
  - 2026-05-08: Rewrote AGENTS.md, docs/ARCHITECTURE.md, docs/CODEBASE_INDEX.md, docs/PROJECT_CANON.md, docs/DECISIONS.md for CV context.
in_progress:
  - none
blockers:
  - Owner needs to fill in OWNER_NAME and RESUME_SUMMARY in api/ask-resume.js before the assistant gives meaningful answers.
  - Owner needs to replace the 6 placeholder projects in 3d-album-stack/src/App.tsx with real entries.
next_step: Verify with npm run lint + npm run build; init git; create GitHub repo; deploy to Vercel.

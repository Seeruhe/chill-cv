# Decisions

## 2026-05-08: Forked from chill-fm; Stack repurposed as project showcase

Decision: Bootstrap `chill-cv` as a fork of the `chill-fm` codebase. Keep the Home screen (music FM interface) as brand vibe. Replace the Stack screen's album cards with personal project cards. Repurpose the AI assistant from a music archivist to a resume archivist via a new server route `/api/ask-resume`.

Reason: The `chill-fm` two-screen architecture (radio Home + 3D card Stack) is well-suited to a portfolio: Home gives a memorable visual identity; Stack hosts curated project case studies; the AI assistant becomes a Q&A surface for visitors. Forking lets the CV inherit a working iframe sandbox, playback continuity, and theme messaging without rebuilding from scratch.

Impact:
- New API route `api/ask-resume.js` reads `LONGCAT_API_KEY` and uses an editable `RESUME_SUMMARY` constant as authoritative ground truth. The model is instructed not to invent facts outside the summary.
- `src/services/aiService.ts` exports `askAboutResume(question, language, topic?)` and posts to `/api/ask-resume`.
- `src/App.tsx` updates the AI hook to call `askAboutResume`, retaining the music-page entry as a topic-hint passthrough so the existing UI keeps working.
- `3d-album-stack/src/App.tsx` replaces the `ALBUMS` and `WIKI_CONTEXT` content with 6 placeholder project cards. The interface and variable names (`Album`, `ALBUMS`) are kept for now to minimize churn; the *data* is portfolio content.
- The unused `3d-album-stack/src/data/albums.ts` (dead code from the upstream) was removed.
- Visible CTA on the Home screen changed from "Boring? Click and View More Story" to "Browse My Projects →".

Follow-ups (not yet done):
- Owner needs to fill in `OWNER_NAME` and `RESUME_SUMMARY` in `api/ask-resume.js`.
- Owner needs to replace the 6 placeholder projects with real entries (`ALBUMS` array) and matching `WIKI_CONTEXT` external links.
- Optional: rename `Album` / `ALBUMS` identifiers to `Project` / `PROJECTS` for clarity (cosmetic; deferred).

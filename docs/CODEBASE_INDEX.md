# Codebase Index

- `src/App.tsx`: Main shell, playback state, canvas visualizer, gallery coordination, queue, story, AI modal, and project panel coordination.
- `src/components/IntroOverlay.tsx`: Centered radio launch overlay.
- `src/components/StackScreen.tsx`: Second-screen iframe wrapper for `3d-album-stack`, including the mini player overlay and stack theme toggle.
- `src/components/gallery/MusicGalleryItem.tsx`: Vertical gallery card for the Home screen.
- `src/components/gallery/galleryConstants.ts`: Shared gallery sizing constants.
- `src/data/musicLibrary.ts`: Local track and artist catalog inherited from chill-fm (powers the Home vibe).
- `src/lib/dotMatrix.ts`: Dot-matrix segment map and canvas text drawing helper.
- `src/lib/youtubeIframeApi.ts`: YouTube IFrame API script loader and window typing.
- `src/services/aiService.ts`: Browser-side resume assistant wrapper that calls `/api/ask-resume`.
- `src/types/music.ts`: Shared music-related types.
- `src/utils/time.ts`: Time formatting helper.
- `api/ask-resume.js`: Vercel serverless route for LongCat (OpenAI-compatible) calls and server-only `LONGCAT_API_KEY` access. Holds the editable `RESUME_SUMMARY` ground truth.
- `3d-album-stack/`: Workspace package for the 3D project card stack loaded by iframe; receives parent theme messages via `postMessage`. Card data lives inside `3d-album-stack/src/App.tsx`.
- `scripts/build-with-stack.mjs`: Builds the stack workspace, copies it to `public/3d-album-stack/`, then builds the main app.
- `package.json`: Root app package and npm workspace owner for `3d-album-stack`.

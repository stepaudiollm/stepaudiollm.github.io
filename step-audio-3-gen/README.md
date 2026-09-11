# StepAudio 3 Gen

Bilingual product showcase for StepAudio 3 Gen, with human-like TTS, voice design, singing, full-scene audio generation, sound effects, music, and benchmark results.

Live page: https://stepaudiollm.github.io/step-audio-3-gen/

## Preview locally

From the repository root, run `python3 -m http.server 4191` and open http://localhost:4191/step-audio-3-gen/. No build step is required. Use HTTP because the page loads JavaScript modules.

## Files

- `index.html`, `product.css`, `product.js`, and `product-copy.js`: page structure, styles, interactions, and bilingual copy.
- `audio/`, `video/`, `assets/`, `fonts/`, and `vendor/`: bundled media and runtime dependencies.
- `MEDIA_ASSETS.md` and `media-manifest.json`: audio/video naming conventions, paths, and checksums.

The page uses relative asset paths and is served from the repository's `main` branch by GitHub Pages. Music and Realtime navigation links point to the sibling product pages. The Experience Center is marked Coming soon; this directory contains the static showcase.

# StepAudio 3 Gen

Bilingual product showcase for StepAudio 3 Gen: speech synthesis, voice design, vocal generation, full-scene audio, sound effects, music, and benchmark results.

Live page: https://stepaudiollm.github.io/step-audio-3-gen/

## Showcase

- Text to speech: 13 voices (six Chinese and seven English), with voice names on the left and generated speech on the right.
- Voice design: five examples in a voice carousel.
- Vocal generation: four separately playable songs with illustrated album covers, immediately below Voice Design.
- Full-scene audio: six scenes, including a synchronized teahouse crosstalk video.

The page uses relative asset paths and JavaScript modules, with no build step. Serve this directory over HTTP. For video seeking, use a static server that supports HTTP byte-range requests (such as nginx or a current Node static-file server).

## Files

- `index.html`, `product.css`, `product.js`, and `product-copy.js`: page structure, styling, interactions, and bilingual copy.
- `tts-showcase.js` and `vocal-cards.js`: voice selection, paging, and vocal player controls.
- `audio/`, `video/`, `assets/`, `fonts/`, and `vendor/`: bundled media and runtime dependencies.
- `MEDIA_ASSETS.md`, `media-manifest.json`, and `full-scene-sources.json`: media conventions, checksums, and scene credits.

Music and Realtime navigation links point to sibling product pages. The Experience Center is marked Coming soon on this static showcase.

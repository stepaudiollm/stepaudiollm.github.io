# Audio and video assets

Filenames use lowercase ASCII words separated by hyphens: `<type>-<scene-or-voice>[-<purpose>].<extension>`. Types: `tts`, `vd`, `vocal`, `vibespeech`, `sfx`, `music`, `gen`. TTS reference/generated pairs share the same voice stem. Scene videos use the same scene stem as audio and end in `-preview.mp4`. No export IDs, random hashes, camelCase, or temporary download names.

See `media-manifest.json` for all 48 assets, previous paths and SHA256 checksums. Only the summer night food stall audio changes in this update; the other audio and all seven videos preserve their original bytes. Current product pages use these canonical paths. Old deployed URLs remain available for cached clients and other existing site entries.

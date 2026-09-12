# Audio and video assets

Media use semantic, lowercase ASCII filenames separated by hyphens. Scene audio, preview video, and poster share the scene name. Public manifests contain only published asset paths, checksums, media properties, and public credits.

## Full-scene showcase

The six scenes use the restored food-stall video, four stock videos credited in `full-scene-sources.json`, and a supplied generated teahouse crosstalk video. The first five videos are silent decorative previews that loop while the separate scene audio plays. The 12-second teahouse visual loops while the complete 49.44-second scene recording plays. Its visual stream is preserved without re-encoding; the full audio recording is preserved byte for byte. The loop follows seeking, pausing, and completion.

## Speech and vocals

The TTS showcase presents 13 named voices (six Chinese and seven English) and generated speech; no reference-audio players are displayed. The separate Voice Design carousel contains five examples. Four Vocal cards present The Warmth of Goodbye (Chinese male), Coconut Afternoon (English female), Home Is Fine (English female), and Be Well (Chinese female). The vocal gallery uses original illustrated covers. The added Be Well recording is distributed without transcoding.

`media-manifest.json` records current asset paths, byte sizes, and SHA-256 checksums, including retained legacy assets for existing URLs. Entries marked `legacy_not_in_full_scene_showcase` are not used in the current scene carousel. Internal source filenames and production records are not part of this distribution.

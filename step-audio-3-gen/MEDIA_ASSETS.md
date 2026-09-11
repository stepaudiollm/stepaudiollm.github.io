# Audio and video assets

Filenames use lowercase ASCII words separated by hyphens: `<type>-<scene-or-voice>[-<purpose>].<extension>`. TTS reference/generated pairs share the voice stem. Scene audio, preview video and poster share the scene stem.

The full-scene showcase has five user-selected Coverr videos (A3, B3, C2, D3, E1), paired with the first five recordings in 3-GEN ShowCase. Teahouse crosstalk is omitted. Videos are silent 720p / 24 fps H264 loops with a 1 Mbps maximum bitrate; generated speech plays separately. Full-scene sources are recorded in full-scene-sources.json. No paid previews are included.

media-manifest.json records audio/video hashes, including retained legacy assets for existing URLs and hidden examples. Entries marked legacy_not_in_full_scene_showcase are not used by the current scene carousel. The showcase also includes the updated Lisa and Jake recordings.

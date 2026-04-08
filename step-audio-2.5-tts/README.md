# Contextual TTS Demo Page

Static demo site for the Contextual TTS product page and audio showcase. The information architecture is designed for a `github.io` style deployment: product narrative on top, listening gallery below, and all sample content controlled from one data file.

## Files

- `index.html`: page shell
- `styles.css`: visual system and responsive layout
- `demo-data.js`: page copy, section structure, and demo asset paths
- `app.js`: renders the data and handles navigation state
- `assets/audio/`: place your real samples here

## Local Preview

```bash
cd /home/zhousiyi/open/tts2.5-demo-page
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080`.

## Replace Demo Assets

1. Edit `demo-data.js`.
2. For each audio block, replace the empty `src` value with your real relative file path.
3. Put the audio files under `assets/audio/` or any other relative path you prefer.

Example:

```js
{
  label: "Output",
  src: "assets/audio/zero-shot/cn-narration-output.wav",
  pathHint: "assets/audio/zero-shot/cn-narration-output.wav"
}
```

When `src` is empty, the page shows a placeholder card with a copyable target path.

## Deploy To GitHub Pages

1. Push the repo to GitHub.
2. In repository settings, open `Pages`.
3. Choose `Deploy from a branch`.
4. Select `main` and `/ (root)`.
5. Save and wait for the published URL.

If you want the site at `https://<your-name>.github.io/`, the repository itself should be named `<your-name>.github.io`. Otherwise GitHub Pages will publish it as a project site, for example `https://<your-name>.github.io/tts2.5-demo-page/`.

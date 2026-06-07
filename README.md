# StreamSaver

StreamSaver is a static video helper website. It creates download actions for direct video file URLs that the user owns or has permission to save, and it previews YouTube links without extracting or bypassing YouTube streams.

## Features

- Responsive landing page and video URL form.
- Download button for direct `.mp4`, `.webm`, `.ogg`, `.ogv`, and `.mov` links.
- YouTube URL detection for watch, share, embed, and Shorts links.
- YouTube-safe preview mode with an embedded player and official page link.
- No backend and no stored user URLs.

## Usage

Open `index.html` in a browser, or serve the directory locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Compliance note

This project intentionally does not download YouTube videos or bypass platform controls. Only download content you own, created, licensed, or have permission to save.

# ClipForge AI

ClipForge AI is a production-minded MVP for generating short clips from legally permitted videos and exporting each clip as MP4, MP3, or WAV.

## Features

- Upload MP4, MOV, or MKV files, or register a direct downloadable video URL.
- Requires users to confirm that they own or are legally allowed to process the video.
- FFmpeg-powered default detection using scene changes, black frames, and audio silence.
- Optional Python AI detection service using PySceneDetect and librosa.
- Adjustable target clip length from 5 to 60 seconds.
- Clip dashboard with thumbnails, previews, and download buttons for:
  - MP4 720p
  - MP4 1080p
  - MP3 audio
  - WAV audio
- Dark/light modern SaaS UI built with Next.js and TailwindCSS.

## Repository structure

```text
/client       Next.js + TailwindCSS frontend
/server       Node.js + Express API, upload handling, FFmpeg pipeline
/ai-service   Optional FastAPI scene/audio detection microservice
```

## Requirements

- Node.js 20+
- npm 10+
- FFmpeg/FFprobe. The server includes `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe` for local development, but production deployments should install system FFmpeg when possible.
- Python 3.11+ for the optional AI service.

## Environment variables

Copy the example file and adjust values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Browser-facing URL of the Express API. |
| `PORT` | Express server port. |
| `CLIENT_ORIGIN` | CORS origin for the frontend. |
| `STORAGE_DIR` | Rendered clip output directory. |
| `UPLOAD_DIR` | Uploaded/source video directory. |
| `MAX_UPLOAD_MB` | Multer upload limit in MB. |
| `ENABLE_URL_INPUT` | Set to `false` to disable URL ingestion. |
| `FFMPEG_PATH` / `FFPROBE_PATH` | Optional explicit binary paths. |
| `AI_SERVICE_URL` | Optional FastAPI service base URL. |

## Local setup

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the API runs at `http://localhost:4000`.

## Optional AI service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Express API sends AI-mode detection requests to `AI_SERVICE_URL` and falls back to FFmpeg if the service is unavailable.

## API

### `POST /upload`

Multipart form-data field: `video`.

Returns:

```json
{
  "video": {
    "id": "abc123",
    "originalName": "demo.mp4",
    "previewUrl": "/media/uploads/demo.mp4"
  }
}
```

### `POST /url`

Registers and downloads a direct video URL. Protected streaming services and DRM bypasses are not supported.

```json
{
  "url": "https://example.com/my-owned-video.mp4",
  "rightsConfirmed": true
}
```

### `POST /process`

```json
{
  "videoId": "abc123",
  "mode": "auto",
  "targetSeconds": 20
}
```

Returns generated clips and download URLs.

### `GET /download/:clipId/:format`

Supported formats: `mp4`, `mp4-720`, `mp4-1080`, `mp3`, `wav`.

## Legal and safety notes

ClipForge AI is designed only for videos the user owns or has permission to process. The app intentionally expects direct downloadable URLs and does not implement DRM bypass, credentialed scraping, protected stream ripping, or circumvention of streaming platforms.

## Deployment guide

### Frontend on Vercel

1. Create a Vercel project from this repository.
2. Set the root directory to `client`.
3. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed Node API URL.
4. Build command: `npm run build`.
5. Output: Next.js default.

### Node server

Deploy `/server` to a Node host that supports persistent disk and FFmpeg, such as Render, Fly.io, Railway, ECS, or a VM.

1. Install FFmpeg and FFprobe on the host.
2. Set `PORT`, `CLIENT_ORIGIN`, `STORAGE_DIR`, and `UPLOAD_DIR`.
3. Ensure `STORAGE_DIR` and `UPLOAD_DIR` point to persistent volumes.
4. Run `npm install --omit=dev` in the server workspace or install from the repository root.
5. Start with `npm run start --workspace server`.

### Optional AI service deployment

Deploy `/ai-service` separately with Python 3.11+ and FFmpeg/OpenCV-compatible libraries. Mount the same video storage path into both the Node server and AI service if using local paths, or adapt the payload to shared object storage URLs for cloud-native deployments.

## Production hardening checklist

- Move local storage to S3, Cloudinary, or another durable object store.
- Add authentication and per-user job isolation.
- Add a background queue for long FFmpeg jobs.
- Persist video/job/clip metadata in Postgres or MongoDB.
- Add rate limiting, virus scanning, and content moderation.
- Add automatic cleanup for expired uploads and renders.

# StreamDesk Video Platform

StreamDesk is a YouTube-style demo web application for video browsing, user sign-up, admin video uploads, and company-owner controls.

## Quick start

No package installation is required because this prototype has no external dependencies.

```bash
npm run start
```

Then open:

```text
http://localhost:4173
```

You can also open `index.html` directly in a browser because the app uses relative asset paths and a normal deferred script.

## Demo accounts

- Owner: `owner@streamdesk.local` / `Owner@123`
- Admin: `admin@streamdesk.local` / `Admin@123`

## Features

- Public home page with category filtering, search, a video player area, and video cards.
- User account creation and login stored locally in the browser.
- Admin panel for uploading videos, publishing review videos, and deleting videos.
- Owner dashboard for platform metrics, promoting users to admin, demoting admins, and blocking or unblocking users.

## Build and preview

```bash
npm run build
npm run preview
```

## Vercel deployment

This repository includes `vercel.json` so Vercel runs `npm run build`, serves the generated `dist/` folder, and rewrites all routes to `index.html` to avoid Vercel `404: NOT_FOUND` responses for direct page loads.

> This is a front-end prototype using `localStorage`. For production, add a secure backend, real authentication, database storage, video transcoding, CDN delivery, and moderation workflows.

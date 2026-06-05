# StreamDesk Video Platform

StreamDesk is a YouTube-style demo web application for video browsing, user sign-up, admin video uploads, and company-owner controls.

## Features

- Public home page with category filtering, search, a video player area, and video cards.
- User account creation and login stored locally in the browser.
- Admin panel for uploading videos, publishing review videos, and deleting videos.
- Owner dashboard for platform metrics, promoting users to admin, demoting admins, and blocking or unblocking users.
- Seeded demo accounts:
  - Owner: `owner@streamdesk.local` / `Owner@123`
  - Admin: `admin@streamdesk.local` / `Admin@123`

## Run locally

```bash
npm install
npm run start
```

## Build

```bash
npm run build
```

> This is a front-end prototype using `localStorage`. For production, add a secure backend, real authentication, database storage, video transcoding, CDN delivery, and moderation workflows.

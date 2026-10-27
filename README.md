# NexaCard

QR Code Generator & Digital Business Card platform.

Lightweight MVP built with React (Vite + Tailwind), Express, MongoDB, and JWT auth.

## Features

- User registration, login, logout, and account settings
- QR code creation for website, vCard, PDF, images, social, Wi-Fi, text, business page, app, and menu
- Live QR preview with color customization
- PNG and SVG downloads
- Save, list, search, filter, edit, and delete QR codes
- Digital business card editor with live mobile preview
- Public profile pages at `/p/:slug` with vCard download
- Website & Ads management for promotional banners
- Light/dark theme preference (local)
- Secure file uploads for images and PDFs

## Project structure

```
nexacard/
  client/          # React + Vite frontend
  server/          # Express + MongoDB API
  .env.example     # Environment variable template
  README.md
```

## Requirements

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy the example env files:

```bash
cp .env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/nexacard` |
| `JWT_SECRET` | Secret for signing JWTs | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Set `true` in HTTPS production | `false` |

Edit `client/.env`:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | API base path | `/api` |

With the Vite proxy configured, `/api` and `/uploads` are forwarded to the backend during development.

### 3. Start MongoDB

Make sure MongoDB is running and reachable at `MONGODB_URI`.

### 4. Run in development

From the project root:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:server
npm run dev:client
```

- Frontend: http://localhost:5173
- API: http://localhost:5001
- Health check: http://localhost:5001/api/health

### 5. Production build

```bash
npm run build
npm start
```

Serve the built client (`client/dist`) with your preferred static host, or reverse-proxy it in front of the API. Point `CLIENT_URL` and CORS accordingly.

## Main API endpoints

**Auth**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`

**QR codes** (authenticated)

- `POST /api/qr`
- `GET /api/qr`
- `GET /api/qr/:id`
- `PUT /api/qr/:id`
- `DELETE /api/qr/:id`
- `POST /api/qr/preview`
- `GET /api/qr/stats/summary`

**Business profiles** (authenticated)

- `POST /api/profiles`
- `GET /api/profiles/my`
- `GET /api/profiles/:id`
- `PUT /api/profiles/:id`
- `DELETE /api/profiles/:id`

**Public**

- `GET /api/public/profiles/:slug`
- `GET /api/public/profiles/:slug/vcard`

**Advertisements** (authenticated)

- `GET /api/ads`
- `GET /api/ads/active`
- `POST /api/ads`
- `PUT /api/ads/:id`
- `DELETE /api/ads/:id`

**Uploads** (authenticated)

- `POST /api/upload`

## Notes

- Passwords are hashed with bcrypt and never stored in plain text.
- Auth uses HttpOnly cookies plus a Bearer token for the SPA.
- Uploaded files are stored under `server/uploads/` and served at `/uploads/...`.
- Public profile endpoints do not expose private user account data.

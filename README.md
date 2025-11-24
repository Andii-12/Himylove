# Love Date Playground

Playful two-part experience (React frontend + Node/Express backend + MongoDB) for asking the most important question of date night: **“Do you love me?”** Complete with a slippery “No” button, floating hearts, random dares, and a place to stash cute notes forever.

## Tech stack

- React (Create React App, JavaScript only)
- Node.js + Express
- MongoDB via Mongoose
- Styling with custom CSS animations (no external UI kit)

## Getting started

### 1. Backend

```bash
cd server
cp env.sample .env   # update MONGO_URI if needed
npm install          # already run once, but safe to re-run
npm run dev          # starts on http://localhost:5001
```

The server exposes:

- `GET /health` – quick status check
- `GET /api/love/prompts` – playful prompt + fun facts
- `GET /api/love/dares/random` – randomized dare/idea
- `POST /api/love/responses` – saves a “yes” (or “maybe”) + optional note
- `GET /api/love/responses/latest` – shows the latest saved answers
- `POST /api/admin/login` – authenticate as the seeded admin
- `GET /api/admin/responses` – list every stored response (requires Bearer token)

### 2. Frontend

```bash
cd client
npm install   # if it isn’t already installed
npm start     # opens http://localhost:3000
```

If the backend runs on another host/port, create `client/.env`:

```
REACT_APP_API_URL=http://localhost:5001
```

Restart the React dev server after editing `.env`.

## MongoDB

Set `MONGO_URI` in `server/.env` (copied from `env.sample`). The default points at `mongodb://127.0.0.1:27017/love-date`.

### Admin panel

- A default admin account (`admin` / `Andii0817@`) is seeded automatically when the server boots (see `seedAdmin`).
- Protect JWTs with `ADMIN_JWT_SECRET` (configure in `.env`; sample provided).
- Visit `http://localhost:3000/admin` to log in and review all saved answers.

## Deployment notes

- Frontend can be built with `npm run build` and hosted statically.
- Backend only needs the compiled React assets or an environment variable pointing at the backend.
- Remember to configure `CLIENT_URL` (comma-separated if multiple origins) for proper CORS handling.

Have fun! <3


# Routine App (Next.js + Prisma + MySQL)

A minimal, modern habit-tracking app scaffold. Built with Next.js (App Router) + Tailwind CSS + Prisma (MySQL). It ships a clean UI, dark mode, Google sign-in, and basic streak/history views.

## Features

- Google sign-in with NextAuth (JWT session)
- User‑scoped routines API (ownership checks)
- Add/delete routines, toggle today’s completion, streak calculation
- History visualization (inline last 4 weeks) and a monthly calendar page
- Dark/light/system theme toggle
- Avatar upload (local filesystem) with fallback to Google profile image or initials

## Tech Stack

- Next.js 14 (App Router), React 18, Tailwind CSS
- Prisma ORM + MySQL (via Docker by default)
- NextAuth v4 (Google provider)
- API: Next.js Route Handlers (`app/api/*`)

## Quick Start (Docker MySQL)

1) Install dependencies

```bash
npm i
```

2) Configure env

```bash
cp .env.example .env
# Default DATABASE_URL points to Docker MySQL (localhost:3307)
```

3) Start DB (Docker)

```bash
npm run db:up
# Optional: follow logs → npm run db:logs
```

4) Generate Prisma Client and apply migrations

```bash
npm run prisma:generate
npm run prisma:migrate
# If this is your first setup and no migrations exist yet,
# Prisma will prompt you to create an initial migration.
```

5) Start the dev server

```bash
npm run dev
```

6) Open the app

- App: http://localhost:3000
- Calendar: http://localhost:3000/calendar

## Using your own MySQL (no Docker)

1) Update `DATABASE_URL` in `.env` to your MySQL instance (e.g., `mysql://USER:PASS@localhost:3306/DB`)
2) Ensure DB is running
3) Generate and migrate

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Environment Variables

Put these in `.env` (see `.env.example`):

- `DATABASE_URL` – MySQL connection string
- `NEXTAUTH_URL` – e.g., `http://localhost:3000` in dev
- `NEXTAUTH_SECRET` – long random string (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` – from Google Cloud Console

## Google OAuth (NextAuth)

1) In Google Cloud Console, create OAuth consent screen (External, test mode is fine) and add your Google account as a test user
2) Create OAuth client credentials (Web application)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Authorized JavaScript origins: `http://localhost:3000`
3) Set the credentials in `.env` and restart the dev server
4) Sign in from the top‑right “Sign in with Google” button

All API endpoints are protected and scoped to the signed‑in user. A `User` record is created/updated on first access.

## Avatar Uploads (local)

- Open the user menu (top‑right) → “Upload Image” to upload JPG/PNG/WEBP/GIF up to 5MB
- Files are saved under `public/uploads/avatars/<userId>/...` (excluded from Git by `.gitignore`)
- Uploaded image takes precedence over the Google profile image; fallback is initials
- Note: local filesystem uploads are not suitable for serverless production. Use S3/Cloudinary/etc. in such deployments.

## Scripts

- `npm run dev` – start Next.js dev server
- `npm run build` / `npm start` – production build/run
- `npm run prisma:generate` – generate Prisma Client
- `npm run prisma:migrate` – apply/create migrations in dev
- `npm run prisma:studio` – Prisma Studio
- `npm run db:up` / `npm run db:down` / `npm run db:logs` – Docker MySQL helpers

## Notes & Hardening

- Upload validation includes MIME/type and size checks. For stricter validation, add magic‑byte detection (e.g., `file-type`) and server‑side resize (e.g., `sharp`).
- Set `NEXTAUTH_URL` to your production domain when deploying.
- If you ever committed `.env` by mistake, rotate secrets and purge from history.

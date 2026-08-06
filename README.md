# Noir Brew

A dark, design-led café website built with Next.js, TypeScript, and PostgreSQL (Drizzle ORM).

## Features

- Cinematic landing page for the Noir Brew café brand
- Interactive “Ask Noir” chat concierge UI
- Streaming chat API route with OpenAI support
- Offline fallback replies when no OpenAI key is configured
- Health check endpoint backed by PostgreSQL

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- PostgreSQL + `pg`
- Drizzle ORM + Drizzle Kit
- ESLint

## Project Structure

This repository contains the app in:

- `/home/runner/work/noir-brew/noir-brew/noir-brew`

Key source folders:

- `src/app` — UI and API routes
- `src/db` — database connection and schema entrypoint

## Prerequisites

- Node.js 20+
- PostgreSQL database

## Environment Variables

Create a `.env.local` file inside `/home/runner/work/noir-brew/noir-brew/noir-brew`:

```bash
DATABASE_URL=******HOST:5432/DB_NAME

# Optional (enables live AI responses)
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Notes:
- `DATABASE_URL` is required.
- If `OPENAI_API_KEY` is not set, chat uses built-in offline responses.

## Getting Started

```bash
cd /home/runner/work/noir-brew/noir-brew/noir-brew
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

Run these from `/home/runner/work/noir-brew/noir-brew/noir-brew`:

```bash
npm run dev       # Start local development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript checks
```

## API Endpoints

- `GET /api/health` — returns `{ ok: true }` when DB is reachable
- `POST /api/chat` — streams concierge response text

## Database

Drizzle is configured in `drizzle.config.json` with schema at `src/db/schema.ts`.

Example push command:

```bash
npx drizzle-kit push
```
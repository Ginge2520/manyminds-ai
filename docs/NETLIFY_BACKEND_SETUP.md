# Netlify Backend Setup

Last updated: 2026-05-04

This is the backend setup plan for running ManyMinds AI on Netlify with GitHub deploys, user accounts, chat history, and agent run history.

## Recommended Architecture

Netlify should control the deployed backend by running the Next.js app and API routes. Netlify Database should store production data.

Flow:

1. GitHub repo pushes trigger Netlify deploys.
2. Netlify builds the Next.js app.
3. Next.js API routes run on Netlify’s server runtime.
4. Netlify Database stores users, conversations, messages, agent runs, and memory snapshots.
5. Environment variables in Netlify hold secrets such as `AUTH_SECRET` and future AI provider keys.

## Why Netlify Database

Netlify Database is managed Postgres built into Netlify. It supports production data, deploy-preview branches, and automatic migrations stored in the repo.

Netlify Blobs can work for simple key/value or unstructured storage, but chat history and user accounts need relational queries, unique emails, user-owned conversations, usage counts, and safer structure. Use Netlify Database for this app.

## Files Added

Migration:

```text
netlify/database/migrations/202605040001_manyminds_core.sql
```

This creates:

- `users`
- `conversations`
- `conversation_messages`
- `agent_runs`
- `agent_memory_snapshots`

## What Steven Needs To Do In Netlify

1. Open the ManyMinds AI project in Netlify.
2. Go to the project’s Database area.
3. Create or connect Netlify Database.
4. Confirm the project is still connected to the GitHub repo.
5. Add required environment variables.
6. Trigger a deploy from GitHub.

On deploy, Netlify should detect migrations in:

```text
netlify/database/migrations/
```

and apply them before publishing the production deploy.

## Required Environment Variables

Set these in Netlify project environment variables:

```env
AUTH_SECRET=use-a-long-random-secret
PROTOTYPE_UNLOCK_ALL=true
NEXT_PUBLIC_PROTOTYPE_UNLOCK_ALL=true
NEXT_PUBLIC_DEMO_MODE=true
```

Later, when hosted AI is enabled:

```env
OPENAI_API_KEY=
OPENAI_DEFAULT_MODEL=gpt-5.5
```

For local Ollama only:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1
```

Do not put private keys in frontend variables unless they are intentionally public.

## Local Setup Option

When ready to wire real database queries into the app, run Netlify’s database setup locally:

```bash
netlify database init
```

Choose direct SQL or Drizzle when prompted. Direct SQL is the simpler next step for this app.

Netlify’s setup will install the database package and configure local development. After that, replace the file-backed user store in `lib/users.ts` with a database-backed adapter.

## Backend Wiring Still Needed

This commit prepares the Netlify Database schema, but the app still needs the runtime adapter that reads and writes to Netlify Database.

Next implementation tasks:

- Replace `.data/users.json` storage with database queries.
- Save new conversations when a user sends the first task.
- Save user and agent messages in `conversation_messages`.
- Save each completed/failed agent run in `agent_runs`.
- Load recent chat history for the account page or dashboard.
- Add a “history” panel in Agent Lab.

## Current Production Warning

The current `lib/users.ts` file uses local file storage for development. That is useful locally but not suitable as the production account system on Netlify serverless runtime. Production accounts should use Netlify Database before public testing with real users.

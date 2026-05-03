# ManyMinds AI

ManyMinds AI is a visible multi-agent collaboration app concept. The repo now includes:

- A production-minded Next.js/TypeScript scaffold with auth, free accounts, onboarding, and usage limits
- A local agent test lab powered by backend Ollama calls

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

To test local AI agents, install Ollama, pull `llama3.1` or `mistral`, then open `/agent-test`. More detail is in `docs/LOCAL_AGENTS.md`.

## Deploy

This app should be deployed as a Next.js app on Vercel, Netlify, or another Next-compatible host. Static file hosting or an uploaded `index.html` bundle will not run the login/session flow.

Set this environment variable before deploying auth:

- `AUTH_SECRET`

Paid tiers are intentionally switched off for now.

# ManyMinds AI

ManyMinds AI is a visible multi-agent collaboration app concept. The repo now includes:

- The original static prototype (`index.html`, `styles.css`, `app.js`)
- A production-minded Next.js/TypeScript scaffold with auth, free accounts, onboarding, and usage limits

## Run locally

For the static prototype, open `index.html` in a browser.

For the Next.js app:

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy

The static prototype can be hosted by any static web host.

The SaaS scaffold should be deployed as a Next.js app on Vercel, Netlify, or another Next-compatible host.

Set this environment variable before deploying auth:

- `AUTH_SECRET`

Paid tiers are intentionally switched off for now.

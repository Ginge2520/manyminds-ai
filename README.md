# ManyMinds AI

ManyMinds AI is a visible multi-agent collaboration app concept. The repo now includes:

- The original static prototype (`index.html`, `styles.css`, `app.js`)
- A production-minded Next.js/TypeScript SaaS scaffold with auth, pricing, billing placeholders, and usage limits

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

Set these environment variables before enabling paid upgrades:

- `AUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_POWER_PRICE_ID`

No Stripe secret keys are exposed to the frontend.

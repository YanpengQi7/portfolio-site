Portfolio site built with Next.js 16 App Router, Tailwind CSS v4, and Vercel AI SDK.

## Local Development

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values you need:

```bash
cp .env.example .env.local
```

- `GOOGLE_GENERATIVE_AI_API_KEY`: primary chat model
- `GROQ_API_KEY`: optional fallback model
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: optional chat rate limiting and conversation persistence
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`: optional Vercel KV-compatible Redis variables for conversation persistence

## Implemented

- App Router portfolio pages
- MD content-backed project detail pages
- AI chat with grounded resume/project context
- Provider fallback: Gemini -> Groq
- Optional Upstash rate limiting for `/api/chat`
- Optional Redis/KV conversation persistence for `/api/chat`

## Deploy

The site is set up for Vercel. Add the same environment variables in the Vercel project before deploying.

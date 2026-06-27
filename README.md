# AutoFix GH

Ghana's automotive repair, roadside assistance, and insurance claims platform.

## Monorepo Structure

```
apps/
  mobile/          React Native (Expo) — vehicle owner app
  garage-portal/   Next.js 15 — garage web portal
packages/
  shared/          Shared TypeScript types
supabase/
  migrations/      Database schema migrations
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run mobile app
pnpm mobile

# Run garage portal
pnpm garage-portal
```

## Environment Variables

Copy `.env.example` to `.env.local` in each app and fill in your Supabase credentials.

## Tech Stack

- React Native (Expo) + React Native Reanimated 3 + Skia
- Next.js 15 + Tailwind CSS
- Supabase (Auth, DB, Realtime, Storage)
- Paystack + MTN MoMo
- Arkesel SMS
- Google Maps Platform

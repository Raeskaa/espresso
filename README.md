# Espresso

AI-powered photo enhancement SaaS.

## Structure

```
apps/
  web/          # Next.js web app
  mobile/       # Expo React Native app
packages/
  ui/           # Shared UI components
  api/          # tRPC routers, API logic
  db/           # Drizzle ORM schema
  utils/        # Shared utilities
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Tech Stack

- **Web**: Next.js 14, Tailwind, shadcn/ui
- **Mobile**: Expo, React Native, NativeWind
- **Backend**: tRPC, Drizzle ORM
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Payments**: Stripe
- **AI**: Google Imagen 3

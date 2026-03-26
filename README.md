# Lumina — Tarot Consultation MVP

A premium tarot consultation web app built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Prisma, and PostgreSQL.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod |
| State | Zustand (persisted) |

---

## User Flow

1. **Splash** → Brand intro, auto-redirect
2. **Onboarding** → Name + date of birth collection
3. **Question Input** → Free-text question + category
4. **Reader Selection** → Filter and select a specialist
5. **Checkout** → Order review + simulated payment
6. **Session Format** → Choose Live Chat or Written Reading
7. **Branch:**
   - **Live Chat** → Polling-based real-time message thread
   - **Async Submitted** → Confirmation screen
8. **Async Status** → Live progress tracking
9. **Result Document** → Full reading output
10. **Insights** → Editorial article feed
11. **Insight Detail** → Full article view

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted)
- pnpm or npm

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo>
cd tarot-mvp
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/tarot_mvp"
```

### 3. Database setup

```bash
# Push schema to database (dev)
npm run db:push

# Or run migrations (production-safe)
npm run db:migrate
```

### 4. Seed demo data

```bash
npm run db:seed
```

This creates:
- 5 tarot readers across all tiers
- 5 insight articles
- 1 demo user with completed sessions

### 5. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Database GUI

```bash
npm run db:studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555)

---

## Project Structure

```
/app                          Next.js App Router pages
  /onboarding                 User registration
  /question                   Question input
  /readers                    Reader selection
  /checkout                   Payment flow
  /session-format             LIVE vs ASYNC selection
  /chat                       Live chat session
  /async/submitted            Async confirmation
  /async/status               Status tracking
  /result                     Reading result document
  /insights                   Article feed
  /insights/[id]              Article detail
  /api                        REST endpoints

/server/actions               Server Actions (all DB logic)
/shared
  /ui                         Reusable UI components
  /lib                        Prisma client, Zod schemas, Zustand store, utils
  /animations                 Framer Motion variants
/entities                     Domain types
/hooks                        Custom React hooks
/prisma
  schema.prisma               Full data model
  seed.ts                     Demo data seeder
```

---

## API Endpoints

All business logic is also available as REST endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/readers` | List all readers |
| POST | `/api/users` | Create user |
| GET | `/api/users?id=` | Get user |
| POST | `/api/sessions` | Create session |
| GET | `/api/sessions?id=` | Get session |
| POST | `/api/orders` | Create order |
| GET | `/api/messages?sessionId=` | Get messages |
| POST | `/api/messages` | Send message |
| GET | `/api/insights` | List insights |
| GET | `/api/insights?id=` | Get insight |
| GET | `/api/async?sessionId=` | Get async reading status |
| POST | `/api/async` | Create async reading |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial"
git remote add origin <your-repo>
git push -u origin main
```

### 2. Create Vercel project

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Framework: **Next.js** (auto-detected)

### 3. Add Vercel Postgres

In your Vercel project dashboard:
- Go to **Storage** → **Create Database** → **Postgres**
- Connect it to your project
- Vercel auto-populates `DATABASE_URL` and `POSTGRES_PRISMA_URL`

### 4. Environment variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=<from Vercel Postgres>
```

If using Vercel Postgres with connection pooling, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### 5. Deploy

```bash
vercel --prod
```

Or push to `main` to trigger auto-deploy.

### 6. Run migrations + seed on Vercel

```bash
vercel env pull .env.production.local
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts
```

---

## What is Mocked vs Real

### Real (production-ready)
- All database operations via Prisma
- Full schema with proper relations and constraints
- User creation and persistence
- Question storage
- Session management (LIVE + ASYNC)
- Order creation with status tracking
- Message storage and retrieval
- Async reading state machine (PENDING → IN_PROGRESS → COMPLETED)
- Insight articles with full content
- All API routes
- Zustand state persisted in localStorage
- Input validation via Zod

### Simulated for MVP
| Feature | Current behavior | Production path |
|---------|-----------------|-----------------|
| Payment | Fake success after 800ms delay | Stripe or Paddle integration |
| Reader responses | Pre-written rotating responses auto-saved to DB | Real-time WebSocket + actual reader accounts |
| Async completion | Auto-completes after 20s for demo; manual trigger button | Reader dashboard with response editor |
| Authentication | None — userId stored in Zustand | NextAuth.js with email/OAuth |
| Email notifications | Not implemented | Resend or SendGrid |
| File upload | Not implemented | Vercel Blob or S3 |
| Reader dashboard | Not implemented | Separate admin/reader portal |

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#FDFBF7` (ivory-50) |
| Surface | `#FFFFFF` (white) |
| Gold accent | `#C9A35A` (gold-400) |
| Primary text | `#292524` (stone-800) |
| Secondary text | `#78716C` (stone-500) |
| Display font | Cormorant Garamond (serif) |
| Body font | Jost (sans-serif) |

---

## Development Notes

- All server actions use `'use server'` directive and run on the server
- Zustand state is persisted in localStorage for session continuity across reloads
- Messages are fetched via polling (2s interval) — replace with Pusher or Ably for production
- The async reading "auto-complete" after 20s is demo-only; in production a reader submits via dashboard
- `generateStaticParams` is used on insight detail for static generation at build time

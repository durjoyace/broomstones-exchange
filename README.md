# Broomstones Equipment Exchange

Free equipment lending system for the **Little Rockers** junior curling program at [Broomstones Curling Club](https://juniors.broomstones.org).

Parents register their kids, browse available equipment, and request shoes or brooms. The equipment coordinator (Scott) manages inventory, checkouts, returns, and the waitlist.

## Tech Stack

- **Next.js 16** (App Router, React 19)
- **Drizzle ORM** + **Neon PostgreSQL** (serverless)
- **Tailwind CSS 4** + **shadcn/ui** (Base UI primitives)
- **Zod** validation on all mutations
- **Vercel** deployment

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with these variables:
DATABASE_URL=postgresql://...          # Neon connection string
AUTH_SECRET=<random-64-char-hex>       # Cookie signing secret (openssl rand -hex 32)
COORDINATOR_PASSWORD=<your-password>   # Login password for equipment coordinator
```

### Database

```bash
# Push schema to database (creates/updates all tables)
npm run db:push

# Open Drizzle Studio to browse data
npm run db:studio
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### For Parents
- **Register** a child for the equipment exchange
- **Request** shoes or brooms by size
- **Look up** what equipment your child has checked out
- **Join waitlist** when desired sizes are unavailable

### For Coordinators
- **Equipment management** — add, edit, retire items with photos
- **Kids management** — view all registered kids with parent contact info
- **Checkouts** — check out equipment, return single or bulk, view history
- **Match tool** — side-by-side view of kids needing sizes vs available equipment
- **Waitlist** — see who's waiting for what, notify when available
- **Print sheets** — printable checkout and inventory lists
- **Dashboard** — real-time stats, low stock alerts, size demand vs supply

### Security
- Signed cookies (HMAC-SHA256) — no forgeable auth
- Middleware-enforced route protection for all admin pages
- Rate limiting on login (5 attempts / 15 minutes)
- Zod validation on every API mutation
- Soft deletes preserve audit trail

## Project Structure

```
app/                    # Next.js App Router pages + API routes
components/
  ui/                   # shadcn/ui primitives (18 components)
  layout/               # Header, Footer
  data-display/         # StatCard, StatusBadge, ConditionBadge, EmptyState
  forms/                # SearchInput
  dialogs/              # ConfirmDialog
lib/
  db/                   # Drizzle schema + client
  queries/              # Reusable query functions (kids, equipment, checkouts, stats, etc.)
  validations/          # Zod schemas
  auth.ts               # Cookie signing, rate limiting
  constants.ts          # Shared enums and options
middleware.ts           # Route protection
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

Deployed on Vercel. Push to `main` to deploy.

Environment variables needed in Vercel:
- `DATABASE_URL`
- `AUTH_SECRET`
- `COORDINATOR_PASSWORD`

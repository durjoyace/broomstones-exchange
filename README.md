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

- Node.js 24 LTS
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
- **Register** a child through a guided, mobile-first flow
- **Browse live availability** for shoes and brooms by size
- **Request** in-stock equipment or join the waitlist
- **Look up** current equipment with child name + registered parent email
- **Keep family information private** — the roster is never sent to public clients

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
- Proxy-enforced protection for coordinator pages **and API routes**
- Parent identity matching for requests, waitlists, and equipment lookup
- Public stats omit child-level activity and responses are never shared-cacheable
- Rate limiting on login (5 attempts / 15 minutes)
- Zod validation on public mutations and lookups
- Soft deletes preserve audit trail

### Launch quality
- 2026–27 season-specific, responsive visual system
- Keyboard-visible focus states, skip link, and reduced-motion support
- Parent-first navigation with a separate coordinator mode
- GitHub Actions gate runs lint and a production build on every pull request

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
proxy.ts                # Route and API protection
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

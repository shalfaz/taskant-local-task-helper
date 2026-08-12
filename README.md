# TaskAnt — Small Tasks. Big Impact.

On-demand local task & service marketplace for Bangladesh (university System Design & Analysis demo).

## Run

```bash
bun install     # or npm install
bun run dev     # http://localhost:8080
bun run build   # production build
```

## Demo accounts (password `123456`)

| Role | Email |
| --- | --- |
| Task Poster | poster@taskant.demo |
| Task Worker | worker@taskant.demo |
| Admin | admin@taskant.demo |

## Demo flow

Login as poster → Post a task in Pabna → open `/tasks` → log in as worker → submit a bid →
switch back to poster → select the worker (task becomes **Assigned**) → chat in `/messages` →
worker marks **In Progress** then **Completed** → poster **Confirms** → **Demo Payment**
(bKash / Nagad / Card) → both sides leave a 5-star rating → worker dashboard and `/admin` update.

## Architecture

- React 19 + TypeScript + Tailwind CSS + TanStack Router (file-based routes in `src/routes`).
- `src/lib/store.tsx` is the single **service/repository layer** (auth, tasks, bids, chat,
  notifications, reviews, payments, reports, verification). It persists to `localStorage` with
  seeded Bangladesh demo data (`src/lib/seed.ts`) and exposes the same interface an
  Express + MongoDB + JWT backend would, so it can be swapped for HTTP calls without UI changes.
- Domain models in `src/lib/types.ts`: User, Task, Bid, Message, Conversation, Notification,
  Review, Payment, Report, Verification status.
- Design system tokens live in `src/styles.css` (no hardcoded colors in components).

## Notes

- Payments are clearly labelled **Demo Payment** — no real money moves; ready for bKash /
  Nagad / SSLCommerz integration later.
- Verification documents are never uploaded or stored.

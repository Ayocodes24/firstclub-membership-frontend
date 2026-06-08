# FirstClub Membership — Frontend

A React + TypeScript demo UI for the FirstClub Membership backend. Designed
to make the upgrade/downgrade/cancel flows easy to demonstrate live.

> **Backend repo:** https://github.com/Ayocodes24/firstclub-membership
> **Stack:** Vite · React 19 · TypeScript · Tailwind CSS · React Router · Axios

---

## What's in the UI

| Page | What you can do |
|---|---|
| **Home** (`/`) | Marketing-style landing — hero, plan cards, tier comparison, CTA |
| **Subscribe** (`/subscribe`) | Pick a plan + tier, send `POST /users/{userId}/subscriptions` |
| **My Membership** (`/membership`) | See current tier, plan, expiry, unlocked benefits, and pending notifications. Confirm upgrades, downgrade, cancel. |
| **Simulator** (`/simulator`) | Send a completed order to the backend to trigger tier re-evaluation |

A **user switcher** in the top-right lets you act as any of the four seeded
demo users (`Aarav`, `Diya`, `Rohan`, `Ishita`). Diya, Rohan, and Ishita
have cohorts (`GOLD_INVITEE`, `VIP`, `EMPLOYEE`) — those are the easiest
ones for triggering upgrades.

---

## How to run

### 1. Start the backend first

The backend lives in [`firstclub-membership`](https://github.com/Ayocodes24/firstclub-membership).
Clone and run it on port `8080`:

```bash
git clone https://github.com/Ayocodes24/firstclub-membership.git
cd firstclub-membership
./mvnw spring-boot:run
```

Verify it's up: `curl http://localhost:8080/api/v1/plans` should return JSON.

### 2. Run this frontend

```bash
git clone https://github.com/Ayocodes24/firstclub-membership-frontend.git
cd firstclub-membership-frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## How the frontend talks to the backend

The frontend makes API calls to `/api/v1/...` paths. In dev, **Vite's proxy**
forwards anything under `/api` to `http://localhost:8080` (the backend).
This means:

- The browser only ever talks to `localhost:5173`
- No CORS configuration is needed on the backend
- The proxy rule lives in `vite.config.ts`

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
  },
}
```

If you change the backend port, edit that one line.

---

## End-to-end demo flow

With both servers running, open `http://localhost:5173` and:

1. Click the user switcher (top-right) → pick **Diya** (cohort: `GOLD_INVITEE`).
2. Go to **Subscribe**, pick the Monthly plan + Silver tier, click **Confirm subscribe**.
3. You'll land on **My Membership** showing her SILVER tier.
4. Go to **Simulator**, click **Place order** (any amount).
5. Go back to **My Membership** (or click "Refresh") — you'll see a notification:
   *"You are now eligible to upgrade to GOLD."*
6. Click **Confirm upgrade** → tier flips to GOLD, benefits update to show
   "Free delivery on every order" and "5% off".
7. Try **Cancel** to test the cancellation flow.

For a faster auto-downgrade demo:
- Subscribe Diya at **PLATINUM** (she doesn't qualify).
- Trigger an order — she'll be auto-downgraded to GOLD with a reason notification.

---

## Project layout

```
src/
├── api/                    one file per backend domain
│   ├── client.ts           axios instance pointed at /api/v1
│   ├── catalog.ts          plans, tiers
│   ├── subscriptions.ts    subscribe / upgrade / downgrade / cancel
│   ├── membership.ts       membership / benefits / notifications
│   └── orders.ts           order trigger
├── components/
│   ├── Header.tsx
│   ├── Layout.tsx
│   ├── TierBadge.tsx       reusable tier chip
│   ├── Toast.tsx           lightweight toast context
│   └── UserSwitcher.tsx    demo user dropdown
├── context/
│   └── UserContext.tsx     current demo user (persisted to localStorage)
├── pages/
│   ├── Home.tsx
│   ├── Subscribe.tsx
│   ├── Membership.tsx
│   └── Simulator.tsx
├── types/
│   └── api.ts              TypeScript mirrors of backend DTOs
├── App.tsx                 routes
├── main.tsx                providers + router setup
└── index.css               Tailwind directives + component classes
```

---

## Connections you need to know

| Connection | Where | Default | How to change |
|---|---|---|---|
| Frontend port | Vite dev server | `5173` | `vite.config.ts` → `server.port` |
| Backend port | Spring Boot | `8080` | `vite.config.ts` → `server.proxy['/api'].target` |
| API base path | Axios client | `/api/v1` | `src/api/client.ts` → `baseURL` |
| Demo users | Hard-coded list | `Aarav / Diya / Rohan / Ishita` | `src/types/api.ts` → `DEMO_USERS` (must match backend seed data) |
| Active user persistence | `localStorage` | key: `firstclub.demoUserId` | `src/context/UserContext.tsx` |

---

## Troubleshooting

**Plans/Tiers don't load on the home page**
The backend isn't running on `:8080`. Start it from the
[backend repo](https://github.com/Ayocodes24/firstclub-membership):
`./mvnw spring-boot:run`.

**Subscribe returns 409 Conflict**
This is expected — the user already has an active subscription. Either
cancel it on the My Membership page or switch to a different demo user.

**Notification doesn't appear after placing an order**
- Make sure you're looking at the same user in both Simulator and My Membership
  (the user switcher state persists across pages).
- Hit **Refresh** on My Membership — the tier evaluator runs asynchronously.
- Verify the user actually qualifies for a higher tier (Diya/Rohan/Ishita
  qualify via cohort; Aarav needs 5+ orders or ≥ ₹5,000 spent).

**Port 5173 already in use**
Edit `vite.config.ts` → `server.port` to anything else.

---

## Out of scope

- **Authentication.** Everything sends `userId` directly in the URL. A real
  app would slot in auth in the axios client + add a login screen.
- **Production deploy.** The Vite proxy only works in dev. For prod, either
  build the frontend and serve it from the backend, or add CORS support to
  the backend.
- **Server state syncing.** This UI uses simple `useEffect` + manual reload
  on actions. A real app would use React Query / SWR for caching and
  automatic refetching.

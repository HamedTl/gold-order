# Gold Order — Next.js Frontend

Persian RTL demo interface for the Laravel gold-trading test project.

## Features

- View each demo user's rial and gold balance.
- Switch between seeded demo user IDs `1` and `2` (on a fresh database).
- Buy or sell gold with client-side validation and a precision-safe order preview.
- See Laravel API validation errors, request state, and successful order details.
- Update balances after successful orders; manual refresh and retry are available.

## Run the complete project (recommended)

From the **repository root**:

```bash
# Docker, Compose, MySQL, Laravel and Next.js
# API requests are proxied by Next.js to Docker's nginx service.
docker compose up --build
```

Visit http://localhost:3000. The API is separately accessible at http://localhost:8000.

## Local frontend development

With Laravel API already running at http://localhost:8000:

```bash
cd next-app
npm ci
npm run dev
```

The frontend uses same-origin requests (`/api/wallet` and `/api/orders`), which are proxied through the `rewrites()` in `next.config.mjs`.

- Local default: `http://localhost:8000`
- Docker build: `API_INTERNAL_URL=http://api` (already set in `docker/frontend/Dockerfile`)

No frontend `.env` file or additional packages are required. To run the included financial calculation tests, use `npm test` (Node.js 22+). Test user IDs are set in `src/components/gold-trading-dashboard.jsx`; if the seeded user IDs differ in an existing database, update them there.

**Important:** This is an evaluation/demo app. `X-User-Id` is not real authentication. Price is provided by the user as required by the assignment; no live pricing or real payments are implemented.

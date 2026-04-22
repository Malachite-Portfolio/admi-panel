# Clarivoice Admin Panel
Production-style admin console for Clarivoice, focused on host/listener control, pricing, moderation, wallet oversight, referrals, and live session operations.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- TanStack Query
- Axios
- React Hook Form + Zod
- Recharts
- Sonner toast notifications

## Setup
1. Install dependencies:
```bash
npm install
```
2. Configure env:
```bash
cp .env.example .env.local
```
Set values in `.env.local`:
- `NEXT_PUBLIC_API_BASE_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`
- `NEXT_PUBLIC_SOCKET_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`

For production builds, create `.env.production`:
- `NEXT_PUBLIC_API_BASE_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`
- `NEXT_PUBLIC_SOCKET_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`

3. Start dev server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000)

## Vercel Production Configuration
1. Open Vercel Dashboard -> your `admin-panel` project.
2. Go to **Settings -> Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_API_BASE_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`
   - `NEXT_PUBLIC_SOCKET_URL=https://clarivoice-backend-final-1032786255556.asia-south1.run.app`
   - `NEXT_PUBLIC_ADMIN_LEGACY_LOGIN_FIELD_RETRY=true`
4. Save and redeploy the project.

If your Cloud Run URL changes, update both variables and redeploy.

## Required Backend Endpoints
- `POST /admin/auth/login`
- `POST /admin/auth/refresh`
- `POST /admin/auth/logout`
- `GET /admin/me`
- `GET /admin/dashboard/summary`
- `GET /admin/dashboard/revenue-series`
- `GET /admin/dashboard/top-hosts`
- `GET /admin/dashboard/recent-sessions`
- `GET /admin/dashboard/recent-recharges`
- `GET /admin/hosts`
- `POST /admin/hosts`
- `GET /admin/hosts/:id`
- `PATCH /admin/hosts/:id`
- `POST /admin/hosts/:id/approve`
- `POST /admin/hosts/:id/reject`
- `POST /admin/hosts/:id/suspend`
- `POST /admin/hosts/:id/reactivate`
- `POST /admin/hosts/:id/hide`
- `POST /admin/hosts/:id/show`
- `POST /admin/hosts/:id/force-offline`
- `POST /admin/hosts/:id/reset-password`
- `GET /admin/users`
- `POST /admin/users/:id/credit-wallet`
- `POST /admin/users/:id/debit-wallet`
- `POST /admin/users/:id/suspend`
- `GET /admin/wallet/overview`
- `GET /admin/wallet/transactions`
- `POST /admin/wallet/manual-adjustment`
- `GET /admin/referrals`
- `PATCH /admin/referral-settings`
- `GET /admin/sessions/live`
- `POST /admin/sessions/:id/end`
- `GET /admin/support/tickets`
- `PATCH /admin/support/tickets/:id`
- `GET /admin/settings`
- `PATCH /admin/settings`

## Route Map
- `/login`
- `/dashboard`
- `/host-kyc`
- `/host-kyc/[id]`
- `/hosts`
- `/hosts/[id]`
- `/users`
- `/wallet`
- `/referrals`
- `/sessions`
- `/support`
- `/settings`

## Project Structure
```txt
admin-panel/
  src/
    app/
      (auth)/login/page.tsx
      (admin)/
        layout.tsx
        dashboard/page.tsx
        host-kyc/page.tsx
        host-kyc/[id]/page.tsx
        hosts/page.tsx
        hosts/[id]/page.tsx
        users/page.tsx
        wallet/page.tsx
        referrals/page.tsx
        sessions/page.tsx
        support/page.tsx
        settings/page.tsx
      layout.tsx
      globals.css
      page.tsx
    components/
      layout/
      charts/
      hosts/
      ui/
    constants/
      app.ts
      navigation.ts
    features/
      auth/
      dashboard/
      hosts/
      users/
      wallet/
      referrals/
      sessions/
      support/
      settings/
    hooks/
    providers/
    services/
    types/
    utils/
  middleware.ts
```

## Notes
- JWT token is stored in local storage and mirrored to a cookie for middleware protection.
- Role-based access is enforced in navigation and sensitive pages (`hosts`, `wallet`, `settings`).
- Pages call the configured backend directly; no mock KYC data is rendered.
- App startup validates `NEXT_PUBLIC_API_BASE_URL`. If missing, the UI shows a warning banner and logs:
  - `API base URL is not configured`

## Backend CORS Requirement
Your backend must allow this admin panel origin. In Clarivoice backend, set:
- `CORS_ORIGIN=https://admin-panel-ivory-eight-58.vercel.app,http://localhost:3000`

The existing backend CORS setup uses `CORS_ORIGIN` and credentials mode, so wildcard (`*`) is not required for production.

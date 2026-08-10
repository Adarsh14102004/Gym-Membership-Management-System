# Deployment Guide — Vercel (frontend) + Railway/Render (backend)

FitZone is a two-part deployment: the React/Vite client is a static build that
deploys cleanly to Vercel, but the Express server needs a **persistent Node
process** — it holds a live Socket.IO connection for chat and runs a daily
cron job for membership-expiry reminders. Vercel's serverless functions are
stateless and cold-started per request, so they can't host either of those.
The pattern below (static frontend on Vercel, always-on backend on
Railway/Render) is the standard way to ship a Vercel-hosted MERN app that uses
WebSockets or background jobs.

## 1. Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so Railway/Render
   can reach it — or restrict to their published IP ranges if you prefer.
4. **Connect → Drivers** → copy the connection string, e.g.:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gym-management?retryWrites=true&w=majority`

## 2. Backend — Railway or Render

Either works the same way; steps shown for Railway.

1. Push this repo to GitHub (if not already).
2. Railway → **New Project → Deploy from GitHub repo** → select the repo.
3. **Root directory**: `server` (so it only builds/runs the backend).
4. **Start command**: `node server.js` (Railway auto-detects `npm start`, which
   already maps to this).
5. **Environment variables** — add everything from `server/.env.example`:

   | Variable | Value |
   |---|---|
   | `PORT` | Railway sets this automatically — leave unset or match `process.env.PORT` (already handled) |
   | `MONGO_URI` | The Atlas connection string from step 1 |
   | `JWT_SECRET` | A long random string — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `JWT_EXPIRE` | `30d` |
   | `CLIENT_URL` | Your Vercel URL once deployed, e.g. `https://fitzone.vercel.app` (comma-separate if you also want your local dev origin allowed) |
   | `ANTHROPIC_API_KEY` | Optional — enables the AI assistant |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Optional — enables outgoing email |
   | `ADMIN_NOTIFICATION_EMAIL` | Optional — where contact-form messages are emailed |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional — from your Razorpay dashboard (test or live keys) |
   | `EXPIRY_REMINDER_DAYS` | `3` |
   | `MEMBERSHIP_CRON_SCHEDULE` | `0 8 * * *` (daily 08:00 server time) |

6. Deploy. Confirm it's up: `https://<your-railway-app>.up.railway.app/api/health`
   should return `{"status":"ok"}`.

## 3. Frontend — Vercel

1. Vercel → **Add New… → Project** → import the same GitHub repo.
2. **Root directory**: `client`.
3. Framework preset: Vite (auto-detected). Build command `npm run build`,
   output directory `dist` — Vercel fills these in automatically for Vite.
4. **Environment variables**:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-railway-app>.up.railway.app/api` |

5. Deploy. `client/vercel.json` is already committed — it rewrites all routes
   to `index.html` so client-side routes (`/member/dashboard`,
   `/reset-password/:token`, etc.) don't 404 on refresh.

## 4. Wire the two together

- Go back to Railway and set `CLIENT_URL` to your real Vercel URL (e.g.
  `https://fitzone.vercel.app`), then redeploy the backend — this is what the
  CORS allow-list and password-reset email links use.
- If you use a custom domain on Vercel, add it to `CLIENT_URL` too
  (comma-separated): `CLIENT_URL=https://fitzone.vercel.app,https://www.yourdomain.com`.

## 5. Razorpay (optional, once you have keys)

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API
   Keys → generate a **test mode** key pair first.
2. Add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to the backend's env vars and
   redeploy.
3. Until these are set, the member Payment page automatically falls back to
   the built-in demo checkout — the app stays fully usable/demoable without a
   Razorpay account.

## 6. Smoke-test checklist

- [ ] `GET /api/health` on the backend returns `{"status":"ok"}`
- [ ] Register a member on the deployed frontend, log in, log out
- [ ] Forgot password → email arrives (if SMTP configured) with a working
      `https://<vercel-url>/reset-password/<token>` link
- [ ] Submit the contact form → `POST /api/contact` succeeds
- [ ] Member → Payment → demo (or Razorpay test-mode) checkout completes and
      the membership becomes active
- [ ] Admin login → Analytics/Reports pages load data
- [ ] Trainer ↔ Member chat delivers messages in real time (confirms
      Socket.IO is reachable through Railway/Render, not just REST)
- [ ] Refresh the browser on a deep client route (e.g. `/member/progress`) —
      confirms `vercel.json`'s SPA rewrite is working

## Notes on the "all-on-Vercel" alternative

It's possible to run everything on Vercel by converting the Express app to
serverless functions, but it requires reworking two things this project
relies on:
- **Socket.IO chat** would need to become HTTP polling or an external realtime
  service (e.g. Pusher/Ably) — a persistent WebSocket can't survive a
  serverless function's request-scoped lifetime.
- **The membership-reminder cron** (`server/cron/membershipCron.js`) would
  need to move to [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
  calling a dedicated serverless endpoint on a schedule, instead of an
  in-process `node-cron` scheduler.

Neither is done here — the Railway/Render split above ships both features
unchanged and is the standard MERN + Vercel deployment shape.

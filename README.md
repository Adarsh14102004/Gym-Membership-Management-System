# FitZone — Gym Membership Management System

A full-stack gym management platform built with the MERN stack, covering everything from membership billing and class booking to AI-powered fitness coaching and business analytics. Built as an end-to-end project across 12 phases, with separate dashboards for **Admin**, **Trainer**, and **Member** roles.

## Project Overview

FitZone digitizes the day-to-day operations of a gym: member onboarding and billing, trainer-member assignment, class scheduling, QR-based attendance, workout/diet plans, fitness progress tracking with photo evidence, an AI fitness assistant, and admin-facing analytics and reporting. It is designed as a realistic, demo-ready system suitable for a college submission, portfolio piece, or interview walkthrough.

Public sign-up always creates a **member** account — trainer and admin accounts are provisioned by an administrator (`Admin → Trainers → Add Trainer`, or a member promoted the same way), never chosen by the person registering. This mirrors how a real gym works (customers self-signup; staff are provisioned by management) and keeps the role boundary enforced at the one place it can't be bypassed: the server.

## Features

### Admin
- Member & trainer management (CRUD, activate/deactivate)
- Membership plans (create/edit/pricing/duration)
- Membership lifecycle management (assign, renew, auto-expiry)
- Class scheduling and management
- Attendance oversight (manual QR scan-in, full history)
- **Analytics dashboard** — revenue trends, member growth, attendance patterns, peak gym hours, popular classes, trainer performance
- **Reports** — PDF and Excel export for members, payments, and attendance, with date filtering
- Notification broadcasting to members/trainers

### Trainer
- View and manage assigned members
- Build workout plans and diet plans per member
- Exercise library and video library
- Review and approve/reject member progress submissions, with before/after comparison
- Member Updates feed (progress submissions, bookings, cancellations)
- In-app chat with assigned members

### Member
- Browse and purchase/renew membership plans — real Razorpay checkout (with a built-in demo/offline fallback when no gateway keys are configured), receipts and payment history
- Book/cancel group classes; view booking history
- QR-code self check-in and attendance history
- View assigned workout and diet plans
- **Progress tracking** — weight, BMI, body measurements, progress photos, goals (weight loss / muscle gain / strength / endurance / general fitness), before/after slider, timeline view
- **AI Fitness Assistant** — personalized workout & diet recommendations, BMI analysis, progress prediction, and a conversational fitness chatbot (Claude-powered), plus an always-available rule-based quick-answer widget
- Notification center with read/unread state and delete
- In-app chat with assigned trainer

### Cross-cutting
- JWT authentication with role-based access control (admin / trainer / member)
- Self-service password reset (email a time-limited, single-use reset link)
- Public contact form with an admin inbox (`Admin → Contacts`)
- Razorpay payment gateway — signature-verified checkout, server-derived pricing, demo fallback when unconfigured
- Real-time chat via Socket.IO
- Email notifications (membership expiry, renewal, booking confirmation/cancellation, password reset, contact form, announcements) — gracefully disabled if SMTP isn't configured
- **Scheduled membership-expiry reminder** (`server/cron/membershipCron.js`, daily via `node-cron`) — proactively notifies members even if they never open the app, on top of the reactive check that already ran on page load
- Security hardening: Helmet security headers, CORS allow-listed to `CLIENT_URL`, NoSQL-injection input sanitization, `express-validator` request validation on public-facing endpoints, rate-limited auth/contact/AI endpoints
- Secure file uploads (image type + size validated) for progress photos

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for the full REST API reference, [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for the data model, and [docs/DEPLOYMENT_VERCEL.md](docs/DEPLOYMENT_VERCEL.md) to deploy (Vercel frontend + Railway/Render backend).

## Modules Explanation

| Module | What it does |
|---|---|
| **Authentication & Authorization** | JWT-based login/register, bcrypt password hashing, server-enforced role checks (`protect` + `authorize`) on every non-public route |
| **Admin Management** | CRUD for members, trainers, and membership plans |
| **Membership & Payments** | Plan purchase/renewal, automatic expiry sweep, payment history, mock payment + receipts |
| **Class Scheduling & Booking** | Admin/trainer-created classes, member booking/cancellation with live seat tracking |
| **QR Attendance** | Per-member QR code, self check-in, admin/trainer scan-in, attendance history |
| **Workout & Diet Plans** | Trainer-authored weekly workout schedules and diet plans, member-facing views, workout completion history |
| **Fitness Progress Tracking** | Member-logged weight/BMI/measurements/photos, goal setting, trainer approval workflow, before/after comparison, timeline |
| **AI Fitness Assistant** | Claude-powered workout/diet recommendations, BMI analysis, progress prediction, conversational chatbot, plus a zero-config rule-based quick-answer widget |
| **Analytics & Reporting** | Admin-only revenue/membership-growth/attendance/class/trainer analytics; PDF & Excel export with date filtering |
| **Notifications** | Shared, role-agnostic notification API — bell dropdown (all roles), full notification center (member), Member Updates feed (trainer), email delivery for key events |
| **Real-time Chat** | Socket.IO-based member ↔ trainer messaging |

## Technology Stack

**Frontend:** React 19, React Router 7, Vite, Tailwind CSS 4, Framer Motion, Chart.js / react-chartjs-2, Axios, Socket.IO client

**Backend:** Node.js, Express 5, MongoDB with Mongoose 9, JWT (jsonwebtoken), bcryptjs, Socket.IO, Multer (file uploads), PDFKit + ExcelJS (reports), Nodemailer (email), Razorpay (payments), node-cron (scheduled jobs), Helmet (security headers), express-validator, express-rate-limit, Anthropic Claude SDK (AI features)

**Database:** MongoDB

## Folder Structure

```
Gym Membership Management System/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── admin/                 # Admin-only layouts, pages, shared UI components
│       │   ├── components/        # Sidebar, Topbar, NotificationBell, DataTable, Modal, StatCard, Chart...
│       │   ├── layouts/
│       │   └── pages/
│       ├── trainer/                # Trainer-only layouts & pages
│       ├── member/                 # Member-only layouts, pages & components (chatbot widget)
│       ├── components/             # App-wide shared components (Navbar, Toast, Loader, ProtectedRoute...)
│       ├── context/                 # AuthContext, ToastContext
│       ├── layouts/                 # Public MainLayout
│       ├── pages/                   # Public pages (Home, Login, Register, Dashboard router, 404)
│       ├── routes/AppRoutes.jsx     # Central route table (lazy-loaded, role-protected)
│       └── services/                # api.js (axios instance), socket.js
│
└── server/                        # Express backend
    ├── config/                    # db.js (Mongo connection)
    ├── controllers/                # One file per resource (auth, admin, trainer, member, progress, ai, analytics, report, notification, contact...)
    ├── middleware/                 # authMiddleware (JWT + role guard), uploadMiddleware (multer), validateMiddleware (express-validator), sanitizeMiddleware (NoSQL-injection guard), errorMiddleware
    ├── models/                     # Mongoose schemas
    ├── routes/                     # One router per resource, mounted in app.js
    ├── services/                   # aiService, analyticsService, emailService, reportService
    ├── cron/                       # membershipCron — daily expiry-reminder sweep (node-cron)
    ├── utils/                      # aiFormatter
    ├── uploads/                    # Uploaded progress photos (served at /uploads)
    ├── socket.js                   # Socket.IO auth + chat event handling
    ├── app.js                      # Express app, middleware & route mounting
    └── server.js                   # HTTP server bootstrap, DB connect, Socket.IO init, cron start
```

## Database Overview

Key MongoDB collections (see `server/models/`):

| Collection | Purpose | Key relationships |
|---|---|---|
| `User` | All roles (admin/trainer/member) in one collection | `assignedTrainer` → User (member→trainer) |
| `MembershipPlan` | Plan catalogue (price/duration/features) | — |
| `Membership` | A member's active/expired membership record | `member` → User, `plan` → MembershipPlan |
| `Payment` | Payment/transaction history | `member` → User, `plan` → MembershipPlan, `membership` → Membership |
| `Class` | Scheduled group classes | `trainer` → User |
| `Booking` | Member's class bookings | `member` → User, `class` → Class |
| `Attendance` | Daily check-in records | `member` → User |
| `WorkoutPlan`, `WorkoutHistory`, `Exercise`, `ExerciseVideo` | Workout program data | `trainer`/`member` → User |
| `DietPlan` | Trainer-assigned diet plans | `trainer`/`member` → User |
| `ProgressLog` | Member weight/measurement/photo entries, trainer-reviewed | `member`/`trainer`/`approvedBy` → User |
| `Goal` | Member fitness goals | `member` → User |
| `AIHistory` | Stored AI interactions (workout/diet/bmi/prediction/chat) | `user` → User |
| `Notification` | In-app notifications, role-agnostic | `user` → User |
| `Message` | Chat messages | sender/recipient → User |
| `Contact` | Public contact-form submissions | — |

Indexes are set on the high-traffic query paths: `User.role`, `User.assignedTrainer`, `Notification{user, createdAt}`, `ProgressLog{member, createdAt}` / `{trainer, status}`, `Payment{member}` / `{paymentDate}`, `Class{date, startTime}` / `{trainer}`, `Membership{member}` / `{status, endDate}`, `Attendance{member, date}` (unique) / `{date}`, `Booking{member, class}` (unique, partial).

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full system control — members, trainers, plans, classes, membership, attendance oversight, analytics, reports, notification broadcasting |
| **Trainer** | Scoped to assigned members only — workout/diet plans, exercise/video library, progress approval, member updates, chat |
| **Member** | Scoped to own data only — membership, bookings, attendance, plans, progress, AI assistant, notifications, chat |

Role is enforced server-side on every route via `protect` (JWT verification) + `authorize(...roles)` middleware — the frontend route guards are a UX convenience, not the security boundary.

## Installation Guide

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)

### 1. Clone and install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables — see **Environment Setup** below

### 3. Run

```bash
# Terminal 1 — backend
cd server
npm run dev        # nodemon, or `npm start` for plain node

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend: `http://localhost:5173` · Backend health check: `http://localhost:5000/api/health`

### 4. Build for production
```bash
cd client && npm run build   # outputs client/dist
```

## Environment Setup

Create `server/.env` (see `server/.env.example` for the full annotated list):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gym-management
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173

# Optional — AI Fitness Assistant (workout/diet/BMI/prediction/chat generation)
# Without this, the app still runs; AI endpoints return a graceful 503
ANTHROPIC_API_KEY=

# Optional — outgoing email (expiry reminders, booking confirmations,
# password reset, contact form, announcements)
# Without these, emails are silently skipped; in-app notifications still work
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_NOTIFICATION_EMAIL=

# Optional — Razorpay payment gateway; without these, checkout automatically
# falls back to the built-in demo/offline payment flow
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Optional — membership expiry-reminder cron
EXPIRY_REMINDER_DAYS=3
MEMBERSHIP_CRON_SCHEDULE=0 8 * * *
```

Create `client/.env` (optional — defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Required? | Purpose |
|---|---|---|
| `PORT` | Yes | Backend port (default 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signing secret for auth tokens — use a long random value |
| `JWT_EXPIRE` | No (defaults `30d`) | Token lifetime |
| `CLIENT_URL` | No (defaults to `http://localhost:5173`) | Comma-separated frontend origin(s) — used for CORS allow-listing and password-reset email links |
| `ANTHROPIC_API_KEY` | No | Enables live AI generation; omitted → graceful 503 on AI endpoints only |
| `SMTP_HOST/PORT/USER/PASS/FROM` | No | Enables outgoing email; omitted → emails silently skipped, in-app notifications unaffected |
| `ADMIN_NOTIFICATION_EMAIL` | No | Where contact-form submissions are emailed; falls back to `SMTP_FROM`/`SMTP_USER` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | No | Enables real Razorpay checkout; omitted → member checkout uses the demo/offline flow |
| `EXPIRY_REMINDER_DAYS` | No (defaults `3`) | How many days before expiry the reminder cron notifies a member |
| `MEMBERSHIP_CRON_SCHEDULE` | No (defaults `0 8 * * *`) | Cron expression for the daily expiry-reminder sweep |
| `VITE_API_URL` (client) | No (defaults to `http://localhost:5000/api`) | Where the frontend points its API calls |

## Deployment

See **[docs/DEPLOYMENT_VERCEL.md](docs/DEPLOYMENT_VERCEL.md)** for the full
walkthrough: MongoDB Atlas → backend on Railway/Render (needed for the
persistent Socket.IO connection and the cron job) → frontend on Vercel
(`client/vercel.json` is already set up for SPA routing).

## Future Scope

- Push notifications (web push / mobile) alongside in-app + email
- Trainer availability calendar and class waitlists
- Mobile app (React Native) reusing the existing REST API
- Multi-gym / multi-branch support with branch-scoped admin roles
- Scheduled report emails (weekly/monthly analytics digest to admins)
- Unit/integration test suite (Jest + Supertest / React Testing Library)

## Screenshots

_Add screenshots of the Login page, Admin Analytics dashboard, Trainer Progress Approval, and Member AI Assistant here before submission — capture from `npm run dev` on both client and server._

---

Built across 13 iterative development phases — authentication → dashboards → membership/classes/attendance → workout & diet plans → fitness progress tracking → AI assistant → analytics & notifications → final testing/optimization → final audit & documentation.

# API Documentation

Base URL: `{VITE_API_URL}` (local: `http://localhost:5000/api`)

## Conventions

- **Auth**: `Bearer <token>` in the `Authorization` header, obtained from
  `/auth/login` or `/auth/register`. Enforced by `protect` middleware
  ([server/middleware/authMiddleware.js](../server/middleware/authMiddleware.js)).
- **Roles**: enforced server-side by `authorize(...roles)` on top of `protect`
  — never trust a frontend route guard as the security boundary.
- **Errors**: `{ "message": "..." }` with an appropriate HTTP status code.
  Validation failures (express-validator) return `400` with a combined
  message string.
- **Rate limits**: `/auth/*`, `/contact`, and `/ai/*` (except `/ai/rule-chat`)
  are rate-limited; a 429 with `{ "message": "..." }` is returned once
  exceeded.
- **Pagination** (list endpoints that support it): query params `page`,
  `limit`, `search`/`status` filters; response shape
  `{ data, total, page, pages }`.

---

## Auth — `/api/auth` (public unless noted)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/register` | — | `{ name, email, password }` | Always creates a `member` account |
| POST | `/login` | — | `{ email, password }` | Returns `{ _id, name, email, role, token }` |
| GET | `/me` | ✅ | — | Current user profile |
| POST | `/forgot-password` | — | `{ email }` | Always 200 with a generic message (no account enumeration); emails a reset link if the account exists |
| PUT | `/reset-password/:token` | — | `{ password }` | Token is the raw value from the emailed link; expires in 30 minutes |

## Admin — `/api/admin` (role: `admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/stats`, `/activity` | Dashboard summary widgets |
| GET/POST | `/members`, PUT/DELETE `/members/:id` | Member CRUD |
| GET/POST | `/trainers`, PUT/DELETE `/trainers/:id` | Trainer CRUD |
| GET/POST | `/plans`, PUT/DELETE `/plans/:id` | Membership plan CRUD |
| GET/POST | `/memberships`, PUT/DELETE `/memberships/:id` | Membership record CRUD |
| PUT | `/memberships/:id/renew` | Manual renew |
| GET | `/memberships/check-expiry` | Force-run the expiry sweep |
| GET | `/attendance`, `/attendance/today` | Attendance oversight |
| POST | `/attendance/scan` | Mark attendance from a scanned member QR code |
| GET | `/contacts` | Paginated contact-form inbox (`?status=new\|read`) |
| PUT | `/contacts/:id/read` | Mark a submission read |
| DELETE | `/contacts/:id` | Delete a submission |
| GET | `/analytics/overview`, `/analytics/membership`, `/analytics/revenue`, `/analytics/classes`, `/analytics/attendance` | Analytics dashboard data |
| GET | `/reports/pdf`, `/reports/excel` | Downloads a generated report file |

## Trainer — `/api/trainer` (role: `trainer`)

| Method | Path | Notes |
|---|---|---|
| GET/PUT | `/profile` | Own profile |
| GET | `/members`, `/members/available` | Assigned members / unassigned pool |
| PUT | `/members/:id/assign`, `/members/:id/unassign` | Manage member assignment |
| GET/POST | `/exercises`, GET/PUT/DELETE `/exercises/:id` | Exercise library |
| GET/POST | `/workout-plans`, GET/PUT/DELETE `/workout-plans/:id` | Per-member workout plans |
| GET/POST | `/diet-plans`, PUT/DELETE `/diet-plans/:id` | Per-member diet plans |
| GET/POST | `/videos`, PUT/DELETE `/videos/:id` | Exercise video library |
| GET | `/progress`, `/progress/member/:memberId` | Review member progress submissions |
| PUT | `/progress/:id/review` | Approve/reject a submission |
| GET | `/attendance` | Assigned-members attendance |

## Member — `/api/member` (role: `member`)

| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard` | Dashboard summary |
| GET | `/trainer` | Assigned trainer's public profile |
| GET/PUT | `/profile` | Own profile |
| PUT | `/change-password` | `{ currentPassword, newPassword }` |
| GET | `/membership` | Membership summary; also triggers the reactive expiry-reminder check |
| GET | `/plans` | Active membership plans (public catalogue for logged-in members) |
| GET | `/workout-plan`, `/workout-plan/today` | Assigned weekly schedule / today's status |
| POST | `/workout-plan/complete` | Mark today's workout done |
| GET | `/workout-history` | Completion history |
| GET | `/diet-plan` | Assigned diet plan |
| GET | `/attendance`, `/attendance/today`, `/attendance/monthly` | Attendance views |
| GET | `/attendance/qr` | Own QR code (base64 image) for self check-in |
| POST | `/attendance/checkin` | Self check-in via scanned/entered code |
| GET | `/notifications` | (Also see the shared `/api/notifications` router) |
| PUT | `/notifications/:id/read` | Mark read |
| GET/POST | `/goal`, PUT/DELETE `/goal/:id` | Fitness goal |

## Progress — `/api/progress` (role: `member`)

| Method | Path | Notes |
|---|---|---|
| POST | `/` | Submit a progress log (multipart, `uploadProgressImage`) |
| GET | `/mine` | Own progress history |
| GET | `/bmi` | BMI calculation from latest entry |
| PUT | `/:id` | Edit a submission (multipart) |
| DELETE | `/:id` | Delete a submission |

## Payment — `/api/payment` (role: `member`)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/` | — | Own payment history |
| GET | `/gateway-status` | — | `{ razorpayConfigured: boolean }` — drives the client's checkout UI |
| POST | `/razorpay/order` | `{ plan }` | Creates a Razorpay order; amount is derived server-side from the plan, never trusted from the client. 503 if Razorpay isn't configured |
| POST | `/razorpay/verify` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }` | Verifies the HMAC-SHA256 signature, then grants/renews the membership and records the payment |
| POST | `/demo` | `{ plan }` | Offline/demo checkout — always available, no real charge, used when Razorpay isn't configured |
| GET | `/:id` | — | Receipt for one payment |

## Contact — `/api/contact` (public)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/` | `{ name, email, subject, message }` | Rate-limited (5 / 15 min per IP); stores the submission and emails `ADMIN_NOTIFICATION_EMAIL` if configured |

Admin-side inbox management is under `/api/admin/contacts` (see above).

## Classes & Bookings

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/classes` | any role | List all classes |
| GET | `/api/classes/my` | trainer | Trainer's own classes |
| POST | `/api/classes` | admin | Create a class |
| GET | `/api/classes/:id` | any role | Class detail |
| PUT/DELETE | `/api/classes/:id` | admin | Update/delete |
| GET | `/api/classes/:id/members` | trainer, admin | Roster |
| POST | `/api/bookings` | member | Book a class |
| GET | `/api/bookings/my` | member | Own bookings |
| PUT | `/api/bookings/:id/cancel` | member | Cancel a booking |

## Chat — `/api/chat` (any authenticated role)

| Method | Path | Notes |
|---|---|---|
| GET | `/unread-count` | Unread message count |
| GET | `/:userId` | Conversation with a specific user |
| POST | `/:userId` | Send a message (also mirrored over Socket.IO — see `server/socket.js`) |
| PUT | `/:userId/read` | Mark conversation read |

## AI Assistant — `/api/ai` (role: `member`)

| Method | Path | Notes |
|---|---|---|
| POST | `/rule-chat` | Zero-config rule-based quick answers (no `ANTHROPIC_API_KEY` needed) |
| POST | `/workout-recommendation`, `/diet-recommendation`, `/bmi-analysis`, `/progress-prediction`, `/chat` | Claude-powered; rate-limited (30 / 15 min); 503 if `ANTHROPIC_API_KEY` is unset |
| GET | `/history` | Stored AI interaction history |

## Notifications — `/api/notifications` (any authenticated role)

| Method | Path | Notes |
|---|---|---|
| GET | `/`, `/unread-count` | List / unread count |
| PUT | `/read-all`, `/:id/read` | Mark read |
| DELETE | `/:id` | Delete |
| POST | `/` | admin/trainer only — broadcast a notification |

## Health

`GET /api/health` → `{ "status": "ok" }` — unauthenticated, used for uptime checks.

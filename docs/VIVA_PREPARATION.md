# Viva Preparation — 50 Questions & Answers

Organized by topic, 5 questions each. Answers are grounded in this project's actual implementation, not generic textbook definitions — use them to demonstrate you understand *why* each choice was made here, not just what the technology is.

---

## React (Frontend)

**1. What is React, and why was it chosen for this project?**
React is a component-based JavaScript library for building UIs, where the UI is a function of state. It fits this project's needs well: three distinct role-based dashboards (Admin/Trainer/Member) that share a lot of UI (DataTable, Modal, StatCard, Chart) but differ in data and permissions — component reuse across those three trees was a major reason to use a component framework rather than server-rendered templates.

**2. What are React Hooks? Which ones does this project use?**
Hooks let function components use state and lifecycle features without classes. This project uses `useState` (form/UI state), `useEffect` (data fetching on mount/param change), `useRef` (DOM refs, e.g. scroll-to-bottom in chat), `useContext` (via `useAuth()`/`useToast()` custom hooks wrapping `AuthContext`/`ToastContext`), and `useMemo` (e.g. live BMI calculation in the Progress form, recomputed only when weight/height change).

**3. What is the Virtual DOM and how does it help performance?**
React keeps an in-memory representation of the UI tree, diffs it against the previous version on state change, and applies only the minimal set of real DOM mutations needed. This avoids expensive full-page re-renders — relevant here where dashboards re-render on every poll (e.g. the notification bell polling unread count every 30 seconds) without visibly re-flowing the whole page.

**4. Controlled vs. uncontrolled components — which does this project use?**
Controlled components have their value driven by React state (`value={form.x}` + `onChange`) — this project uses controlled inputs exclusively (every form: login, register, progress entry, class creation) so validation and derived state (like live BMI preview) can react to every keystroke.

**5. What is code-splitting/lazy loading, and how is it applied here?**
Code-splitting breaks the JS bundle into smaller chunks loaded on demand instead of all at once. Every route-level page in `AppRoutes.jsx` is wrapped in `React.lazy(() => import(...))` with a shared `<Suspense fallback={<Loader/>}>` boundary — this cut the initial bundle from a single 857KB chunk (containing all ~60 pages across all three roles) down to a 424KB vendor chunk plus small per-page chunks fetched only when that page is visited.

---

## Node.js (Runtime)

**6. What is Node.js, and why is it suited to this backend?**
Node.js is a JavaScript runtime built on Chrome's V8 engine with non-blocking, event-driven I/O. It's well-suited here because the backend is I/O-heavy (database queries, file uploads, external API calls to Claude and SMTP) rather than CPU-heavy — Node handles many concurrent I/O-bound requests efficiently on a single thread via its event loop.

**7. Explain the event loop and non-blocking I/O.**
Node runs JavaScript on a single thread but delegates I/O operations (disk, network, database) to the system/libuv thread pool; when an operation completes, its callback is queued and run on the main thread. This means a slow database query for one request doesn't block other requests from being handled — critical for this app's `Promise.all()`-heavy controllers (e.g. `getDashboardSummary` fires 7 queries concurrently rather than sequentially).

**8. What is npm and what role does `package.json` play?**
npm is Node's package manager; `package.json` declares dependencies, scripts (`npm run dev`, `npm run build`), and metadata. This project has two separate `package.json` files (`server/`, `client/`) since they're independently deployable units with non-overlapping dependencies.

**9. CommonJS vs. ES Modules — which does this project use, and why?**
The backend uses CommonJS (`require`/`module.exports`) throughout — the established convention for this codebase, consistent across all ~25 controllers. The frontend uses ES Modules (`import`/`export`) since it's bundled by Vite, which is built around ESM. Mixing conventions within one side of the stack would hurt readability, so each side commits to one.

**10. How does Node.js handle asynchronous operations in this project?**
Almost entirely via `async`/`await` over Promises — every controller function is `async (req, res, next) => { try { ... } catch (error) { next(error) } }`. This avoids callback nesting ("callback hell") and lets errors be caught with a single `try/catch` and forwarded to Express's centralized error handler via `next(error)`.

---

## Express (Web Framework)

**11. What is Express, and what problem does it solve over raw Node `http`?**
Express is a minimal web framework providing routing, middleware composition, and request/response helpers on top of Node's raw `http` module. Without it, you'd hand-parse URLs, methods, and bodies for every route — Express's `router.get('/path', handler)` pattern is what makes this project's ~13 route files readable and maintainable.

**12. What is middleware? Give an example from this project.**
Middleware is a function `(req, res, next)` that runs during the request lifecycle, optionally modifying `req`/`res` or short-circuiting the response, then calls `next()` to continue. This project's core example is `protect` (verifies the JWT, attaches `req.user`) chained with `authorize('admin')` (rejects with 403 if the role doesn't match) — both run before the actual controller on every protected route.

**13. How does Express routing work in this project?**
One router file per resource (`authRoutes.js`, `progressRoutes.js`, `analyticsRoutes.js`, etc.), each exporting an `express.Router()` mounted at a base path in `app.js` (e.g. `app.use('/api/progress', progressRoutes)`). Within a router, `router.use(protect, authorize(...))` at the top applies auth to every route in that file at once, rather than repeating it per-route.

**14. How is centralized error handling implemented?**
Controllers set `res.status(code)` then `throw new Error(message)` inside a try/catch that forwards to `next(error)`. A single `errorHandler` middleware (registered last in `app.js`, after all routes) catches every error, responds with `{ message, stack }` (stack only outside production), avoiding duplicated error-formatting logic in every controller.

**15. What is `express-rate-limit`, and where is it used here?**
It's middleware that caps requests per IP within a time window, returning `429 Too Many Requests` once exceeded. Applied to `/api/auth/login` and `/api/auth/register` (10 requests/15 min, added during the Phase 13 security audit) to prevent brute-force/credential-stuffing, and separately to `/api/ai/*` (30 requests/15 min) to control AI API cost and abuse.

---

## MongoDB (Database)

**16. What is MongoDB, and what kind of database is it?**
A document-oriented NoSQL database that stores data as BSON (binary JSON) documents in collections, rather than rows in tables. Schema is flexible at the database level (enforced at the application level via Mongoose here), which suited this project's iterative development — fields like `chest`/`waist`/`arms`/`thighs` were added to `ProgressLog` in a later phase without a migration.

**17. Explain document, collection, and field using this project's `User` model.**
A **document** is one record — e.g. one member's data (`{name, email, role, assignedTrainer, ...}`). A **collection** is a group of documents of the same conceptual type — `users`. A **field** is one key in a document — e.g. `role`. Unlike a relational table, documents in the same collection don't need identical fields (though this project's Mongoose schemas enforce a consistent shape in practice).

**18. What is Mongoose, and what does it add over the native MongoDB driver?**
Mongoose is an Object Data Modeling (ODM) library that adds schemas (field types, validation, defaults), middleware hooks (e.g. the `pre('save')` hook that hashes passwords before every save), and a more ergonomic query API (`User.findOne({...})`) over the lower-level native driver.

**19. How are relationships modeled in MongoDB, and how does this project use them?**
Via `ObjectId` references plus `.populate()` — e.g. `ProgressLog.member` and `.trainer` are `ObjectId` fields with `ref: 'User'`; a query can `.populate('member', 'name email')` to embed the referenced document's fields in the response. There's no enforced foreign key at the database level, so the application layer validates references exist before using them (e.g. `bookClass` checks the class exists before creating a booking).

**20. What are indexes, and why were they added in this project?**
An index is a data structure that lets MongoDB find documents by a field's value without scanning every document in the collection. Initially only `Attendance` and `Booking` had explicit indexes; during Phase 12's performance pass, 12 more were added across `Notification`, `User`, `ProgressLog`, `Payment`, `Class`, and `Membership` — chosen specifically for fields used as query filters in verified hot paths (e.g. the notification bell polls `{user, createdAt}` every 30 seconds).

---

## JWT (Authentication)

**21. What is a JWT, and what are its three parts?**
A JSON Web Token is a compact, URL-safe token with three base64url-encoded, dot-separated parts: a **header** (algorithm/type), a **payload** (claims — here, just `{id: userId}`), and a **signature** (HMAC of header+payload using a server secret) that lets the server verify the token wasn't tampered with, without needing a database lookup to validate authenticity.

**22. How does this project use JWT for authentication end-to-end?**
On login/register, the server verifies credentials, then signs a JWT with `jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: '30d'})` and returns it. The client stores it (`localStorage`) and sends it as `Authorization: Bearer <token>` on every subsequent request. The `protect` middleware verifies the signature with `jwt.verify`, extracts the `id`, and loads the corresponding `User` from MongoDB into `req.user`.

**23. Where is the JWT stored on the client, and what's the tradeoff?**
In `localStorage`. This is simple and works well with a separate SPA + API architecture (no cookie/CORS complexity), but is vulnerable to XSS (any injected script can read `localStorage`) — an `httpOnly` cookie would be safer against XSS but adds CSRF-protection complexity and same-origin constraints. For this project's scope, `localStorage` was the pragmatic choice; a production system handling sensitive data might reconsider.

**24. What happens when a JWT expires?**
`jwt.verify` throws, `protect` catches it and returns `401 Not authorized, token failed`. The frontend's `AuthContext` clears the stored token and the user is redirected to log in again — there's no refresh-token flow in this project (a `30d` expiry was chosen as a simple middle ground for a demo/portfolio app; a production system would likely add short-lived access tokens plus a refresh token).

**25. How is a JWT secured against tampering, and what's actually in the payload?**
The signature is computed with a server-only secret (`JWT_SECRET`), so a client can't modify the payload (e.g. change their `id` to someone else's) without invalidating the signature — `jwt.verify` would reject it. The payload deliberately contains only `{id}`, not the role or any other claim — role is always looked up fresh from the database on each request via `req.user`, so a permission change (e.g. deactivating a user) takes effect immediately rather than waiting for token expiry.

---

## REST API

**26. What is REST, and what makes an API RESTful?**
Representational State Transfer — an architectural style using stateless HTTP requests, resource-oriented URLs, and standard HTTP methods to express operations. This project's API is resource-oriented (`/api/classes`, `/api/progress`, `/api/notifications`) and stateless (every request carries its own auth token; the server holds no session state between requests).

**27. What HTTP methods does this API use, and for what?**
`GET` (read — list/detail), `POST` (create — register, book a class, submit progress), `PUT` (update — mark notification read, approve progress, cancel a booking), `DELETE` (remove — delete a notification, cancel a membership plan). The project doesn't use `PATCH`, keeping `PUT` for all updates for consistency.

**28. What HTTP status codes does this API use, and what do they mean here?**
`200` (success), `201` (resource created — register, class booking), `400` (validation error — e.g. missing fields, invalid goal category), `401` (not authenticated — missing/invalid/expired token), `403` (authenticated but wrong role), `404` (resource not found, or — deliberately — used for cross-user/cross-trainer access attempts instead of leaking a `403`, so an attacker can't distinguish "doesn't exist" from "exists but isn't yours"), `429` (rate limited), `503` (AI service unavailable — not configured).

**29. What is idempotency, and which endpoints here are idempotent?**
An idempotent operation produces the same result no matter how many times it's repeated. `GET`, `PUT`, and `DELETE` endpoints here are idempotent (marking a notification read twice has the same end state as once; deleting an already-deleted resource returns 404 both times). `POST /api/progress` (create) is deliberately *not* idempotent — resubmitting creates a new entry each time, which is the correct behavior for a log/history record.

**30. How is the API organized/versioned?**
No formal version prefix (no `/v1/`) since this is a single-deployment project, not a published public API. Organization is by resource, one router file per resource, all mounted under `/api/` in `app.js` — e.g. `/api/admin/analytics`, `/api/admin/reports`, `/api/notifications`. This keeps the route table self-documenting.

---

## Database Design

**31. Why one `User` collection with a `role` field instead of three separate collections (Admin/Trainer/Member)?**
The three roles share most fields (name, email, password, status, profile picture) and differ only in a few optional fields (`specialization`/`bio` for trainers, `assignedTrainer`/`height` for members). A single collection with a `role` enum avoids duplicating shared logic (auth, profile update) three times, and makes cross-role queries trivial (e.g. `User.countDocuments({role: 'trainer'})` for admin stats).

**32. What is normalization, and how much applies to a NoSQL schema like this one?**
Normalization (in relational terms) minimizes data duplication by splitting data into related tables. NoSQL/MongoDB deliberately trades some normalization for read performance via embedding/denormalization where it helps — this project is mostly normalized (separate collections linked by `ObjectId`), with one deliberate denormalization: `ProgressLog.trainer` duplicates the member's `assignedTrainer` at submission time, because trainer-scoped queries are far more frequent than trainer reassignments.

**33. How is referential integrity handled without enforced foreign keys?**
Every write path that references another document validates it exists first — e.g. `createMembership` checks the referenced `MembershipPlan` exists before creating a `Membership`; `bookClass` checks the `Class` exists and isn't full. MongoDB doesn't reject an insert with a dangling `ObjectId` reference the way a relational database would reject an invalid foreign key, so this validation has to live in the application layer.

**34. Explain the denormalized `trainer` field on `ProgressLog` and why it was chosen.**
When a member submits a progress entry, their current `assignedTrainer` is copied onto the new `ProgressLog` document as `trainer`, rather than looking it up via `User` on every trainer-facing query. This means `ProgressLog.find({trainer: req.user._id})` is a single-collection query with no join — and it also correctly preserves *history*: if a member later gets reassigned to a different trainer, their old progress entries still show who actually reviewed them at the time.

**35. What uniqueness constraints exist in this schema, and why?**
`Attendance` has a unique compound index on `{member, date}` — one check-in per member per day, enforced at the database level so a race condition (double-tapping check-in) can't create duplicate records. `Booking` has a unique *partial* index on `{member, class}` scoped to `status: 'booked'` — one active booking per member per class, but a cancelled-then-rebooked pair is allowed since the old record's status is `'cancelled'`, not `'booked'`.

---

## Security

**36. How are passwords stored securely?**
Hashed with bcrypt (`bcryptjs`), using a per-password salt generated via `bcrypt.genSalt(10)`, in a Mongoose `pre('save')` hook — so raw passwords are never written to the database, and identical passwords produce different hashes (due to the salt). The `password` field also has `select: false`, so it's excluded from query results by default unless explicitly requested with `.select('+password')` (only done for login/change-password).

**37. What's the difference between authentication and authorization, and how are both implemented here?**
Authentication answers "who are you?" — handled by the `protect` middleware verifying the JWT and loading `req.user`. Authorization answers "what are you allowed to do?" — handled at two levels: `authorize(...roles)` (coarse — is this role allowed to hit this route at all?) and per-controller ownership scoping (fine-grained — even as a valid trainer, can you see *this specific* data?). Both are required; role checks alone aren't sufficient, since a valid trainer token shouldn't unlock another trainer's members.

**38. What is rate limiting, and why is it applied specifically to auth and AI routes?**
Rate limiting caps how many requests a client (identified by IP here) can make in a time window, returning `429` past the limit. Auth routes (`login`/`register`) are limited to prevent brute-force password guessing and registration spam; AI routes are limited separately because each request costs money (external API call) and could be abused to run up cost or exhaust a budget even by a legitimately authenticated user.

**39. What is a mass-assignment/privilege-escalation vulnerability, and how was one found and fixed in this project?**
Mass assignment is when a server blindly trusts client-supplied fields it shouldn't (e.g. letting a client set their own `role`). This project's public registration endpoint originally did exactly that — it read `role` from the request body and created the account with that role if it matched an allowed value, and the registration form even exposed an "Admin" option in a dropdown. Anyone could self-register as an administrator. It was found during a deliberate Phase 13 security audit (not by feature testing) and fixed by hardcoding the server to always assign `role: 'member'` on public registration, ignoring any client-supplied role entirely, and removing the misleading UI control.

**40. How are file uploads (progress photos) secured?**
Multer validates the MIME type against a whitelist (`image/jpeg`, `image/png`, `image/webp` only — anything else is rejected with `400`), enforces a 5MB size limit, and generates the stored filename server-side (`<userId>-<timestamp>.<ext>`) rather than trusting the client's original filename — preventing path traversal or filename-collision attacks.

---

## AI Features

**41. What AI provider and model does this project use, and for what?**
The Anthropic Claude API (`@anthropic-ai/sdk`), used for four generative features (workout recommendations, diet recommendations, BMI analysis, progress prediction) plus a conversational fitness chatbot — all scoped to the member role and gated behind authentication.

**42. How is the AI prompt built from member data ("grounding")?**
Each feature's controller pulls the relevant data from MongoDB first (e.g. progress prediction reads the member's last 10 `ProgressLog` weight/BMI entries, their last 20 `WorkoutHistory` records, and their active `Goal`), formats it into the prompt text, and only then calls the AI service — so recommendations are based on the member's actual logged history, not just their free-text input.

**43. What happens if `ANTHROPIC_API_KEY` isn't configured?**
`aiService.getClient()` checks for the key before creating a client; if absent, every AI-generation call throws a controlled error that the controller converts to `503 AI service is not configured`, rather than crashing. This was verified directly in this environment (no key configured) — the rest of the app, including the rule-based chatbot, works normally.

**44. How is AI usage rate-limited/cost-controlled?**
A dedicated `express-rate-limit` instance on `/api/ai/*` (excluding the free rule-based endpoint) caps each user to 30 requests per 15 minutes, preventing a single account from generating unbounded API cost.

**45. What's the difference between the AI chatbot and the rule-based chatbot widget?**
The AI chatbot (in the AI Assistant page) calls the Claude API for open-ended conversational answers and requires `ANTHROPIC_API_KEY`. The separate floating chatbot widget (available on every member page) uses keyword matching against the member's own data (membership status, today's workout, latest BMI) to answer a fixed set of common questions with zero external dependency or cost — a deliberate fallback so *some* chat assistance always works even without AI configured.

---

## Project Architecture

**46. Describe the three-tier architecture of this project.**
**Presentation tier**: React SPA, role-based routing and layouts. **Application/API tier**: Express REST API + Socket.IO, organized into routes → middleware → controllers → services. **Data tier**: MongoDB via Mongoose. The frontend never talks to the database directly — every data access goes through the authenticated API layer, which is where all authorization logic lives.

**47. How is role-based access control enforced end-to-end?**
Client-side: `ProtectedRoute` components and role-specific layouts/sidebars hide navigation the current role shouldn't use — this is a UX convenience only. Server-side (the actual security boundary): every non-public route runs `protect` (verify JWT) then `authorize(role1, role2, ...)` (reject wrong roles with 403), and controllers additionally scope data queries to `req.user._id` so even a correctly-authorized request can't reach another user's data.

**48. What is the service-layer pattern, and which services exist in this project?**
A service layer isolates complex or third-party-dependent logic from HTTP-handling controllers, so controllers stay focused on request validation and response shaping. This project has `aiService` (Claude API calls, JSON-schema responses), `analyticsService` (aggregation pipelines for the admin dashboard), `emailService` (Nodemailer wrapper with graceful no-op), and `reportService` (PDF/Excel generation) — each testable and reusable independent of any specific route.

**49. How does real-time functionality (chat, notifications) work in this project?**
Chat uses Socket.IO: a JWT-authenticated WebSocket connection, per-user rooms (`user:<id>`), and server-emitted events for new messages/typing/read-receipts — true push, no polling. Notifications (the bell dropdown) instead use short-interval polling (`GET /api/notifications/unread-count` every 30 seconds) — simpler than wiring a second real-time channel for a lower-frequency, less latency-sensitive feature, and it degrades gracefully if a request fails (silently retried on the next interval).

**50. How would you scale this system for multiple gym branches?**
Add a `Branch` collection and a `branch` reference field on `User`, `Class`, and `Membership`; scope every admin/trainer query by the requesting admin/trainer's own branch — the exact same pattern already used for trainer→member scoping (`assignedTrainer`), just one level up. Analytics and reports would add a `branch` filter; a super-admin role could be introduced for cross-branch visibility. The existing architecture (server-enforced scoping via `req.user`) generalizes directly to this without a redesign.

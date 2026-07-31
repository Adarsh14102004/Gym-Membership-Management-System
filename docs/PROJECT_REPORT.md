# Project Report — FitZone: Gym Membership Management System

Use this document as source material for a formal college project report. It follows a standard chaptered report structure and can be copied directly into a report template (adjust chapter numbering to your institution's format).

## Title

**FitZone — A Full-Stack Gym Membership Management System with AI-Powered Fitness Coaching**

## Abstract

Gyms and fitness centers typically manage memberships, class schedules, attendance, and member progress through disconnected spreadsheets, paper logs, or generic software not built for fitness-specific workflows. FitZone is a full-stack web application built on the MERN stack (MongoDB, Express, React, Node.js) that unifies these operations into a single system with role-based dashboards for administrators, trainers, and members.

The system supports the complete membership lifecycle — plan browsing, purchase, renewal, and automatic expiry — alongside class scheduling and booking, QR-code-based attendance tracking, trainer-authored workout and diet plans, and a fitness-progress module where members log weight, body measurements, and progress photos for trainer review and approval. A distinguishing feature is the integrated AI Fitness Assistant, which uses the Claude API to generate personalized workout and diet recommendations, analyze BMI trends, predict future progress, and answer member fitness questions conversationally. The admin role additionally has access to an analytics dashboard (revenue, membership growth, attendance, and class/trainer performance) and can export data as PDF or Excel reports. A shared, real-time notification system (backed by Socket.IO for chat and polling for notifications) keeps all three roles informed of relevant events.

The system was built iteratively across thirteen development phases, each adding a cohesive feature set on top of a consistent architecture (JWT authentication, role-based middleware guards, a shared component/design system on the frontend), with functional and security regression testing performed after every phase — including a final audit that identified and closed a privilege-escalation vulnerability in the public registration endpoint before submission.

---

## Chapter 1 — Introduction

Fitness and gym membership management is a naturally multi-stakeholder problem: administrators need business oversight, trainers need to manage the specific members assigned to them, and members need self-service access to their own membership, schedule, and progress data. Most small-to-mid-size gyms either use generic business software (which has no concept of workout plans, progress photos, or trainer assignment) or manual processes (spreadsheets, WhatsApp groups, paper attendance registers) that don't scale and provide no data-driven insight.

FitZone was built to demonstrate a complete, production-shaped solution to this problem using a modern web stack, with special attention to the parts that are usually left out of student/portfolio projects: server-enforced authorization (not just hidden UI), data ownership scoping (a trainer can never see another trainer's members, even with a valid login), graceful degradation of optional third-party integrations (AI and email), and a real final security audit rather than only functional testing.

## Chapter 2 — Problem Statement

Manual or generic gym management leads to concrete, recurring problems:

1. **No single source of truth** — membership status, attendance, and payment records live in separate spreadsheets that drift out of sync.
2. **No self-service for members** — members must call or visit the front desk to check membership status, book a class, or see their assigned workout plan.
3. **No structured progress tracking** — trainers track member weight/measurements on paper or not at all, with no historical trend, no photo evidence, and no accountability trail (who approved what, when).
4. **No business visibility** — gym owners/admins have no dashboard showing revenue trends, membership growth, attendance patterns, or which classes/trainers are actually performing.
5. **No role separation** — where software exists, it's often a single shared login with no boundary between what staff and customers can see or do.

## Chapter 3 — Objectives

1. Build a secure, role-based system separating Admin, Trainer, and Member concerns, enforced at the API layer (not just the UI).
2. Digitize the full membership lifecycle: plan management, purchase/renewal, automatic expiry handling, and payment history.
3. Provide class scheduling and booking with real-time seat availability.
4. Implement contactless, QR-code-based attendance tracking with admin oversight.
5. Enable trainers to author and assign workout and diet plans to their members.
6. Build a fitness-progress tracking module supporting quantitative data (weight, BMI, body measurements) and qualitative evidence (progress photos), with a trainer approval workflow and before/after comparison.
7. Integrate an AI assistant that gives personalized, data-grounded fitness guidance without replacing the trainer's authority to approve progress.
8. Give administrators visibility into business health through analytics (revenue, growth, attendance, class/trainer performance) and exportable reports.
9. Keep every role informed via a unified notification system (in-app + email) without duplicating logic per role.
10. Apply consistent security practice throughout: password hashing, JWT expiry, rate limiting on sensitive endpoints, upload validation, and strict data scoping.

## Chapter 4 — Scope

**In scope:** everything under Features/Modules below — auth, membership & payments (mock gateway), class booking, QR attendance, workout/diet plans, progress tracking with photos, AI assistant, analytics & reporting, notifications, real-time chat.

**Out of scope (see Future Enhancements):** a real payment gateway, native mobile apps, multi-branch/multi-gym support, push notifications, and an automated CI test suite. These are explicitly deferred, not accidentally missing — each is called out with a reason in Chapter 13.

## Chapter 5 — Existing System

Prior to a system like FitZone, gyms typically rely on one of:

- **Spreadsheets / paper registers** — no automation, no real-time seat/capacity tracking, no audit trail, error-prone manual data entry, no member self-service.
- **Generic CRM/business software** — handles billing but has no fitness-domain concepts (workout plans, progress photos, trainer-member assignment, class capacity, QR attendance).
- **Disconnected point tools** — e.g. a scheduling app plus a separate spreadsheet for payments plus a WhatsApp group for announcements — data lives in silos, nothing reconciles automatically, and there's no unified view for any role.

Common limitations across all of the above: no role-based access control, no automatic membership expiry handling, no structured progress history, and no business analytics.

## Chapter 6 — Proposed System

FitZone replaces the above with a single MERN-stack web application offering:

- One authenticated system with three enforced roles (Admin/Trainer/Member), each seeing only what they're entitled to see — enforced server-side, not just hidden in the UI.
- Automated membership lifecycle (auto-expiry sweep, renewal flow, payment history) instead of manually tracked spreadsheets.
- Self-service member portal — booking, attendance, plan viewing, progress logging, AI-assisted guidance — removing front-desk dependency for routine actions.
- Structured, auditable fitness progress tracking with trainer approval, replacing paper logs.
- Data-driven admin analytics and one-click PDF/Excel exports, replacing manual spreadsheet reporting.
- A unified notification layer (in-app + email) so every role stays informed without bespoke per-feature messaging code.

## Chapter 7 — Features

See `README.md` → **Features** for the full per-role breakdown (Admin / Trainer / Member / cross-cutting). Summary:

- Authentication & role-based access control (server-enforced; public sign-up is always a member account)
- Membership plans, purchase/renewal, auto-expiry
- Class scheduling & booking
- QR-code attendance
- Workout & diet plan authoring and assignment
- Fitness progress tracking with photos, measurements, goals, and trainer approval
- AI Fitness Assistant (workout/diet recommendations, BMI analysis, progress prediction, chatbot)
- Admin analytics dashboard and PDF/Excel reporting
- Real-time chat (Socket.IO) and shared notification system with email delivery

## Chapter 8 — System Architecture

Three-tier architecture:

```
Frontend (React SPA, role-based UI)
        ↓  REST over HTTPS, Bearer JWT  +  WebSocket (chat)
Backend API (Node.js / Express)
        ↓  protect (JWT) + authorize (role) middleware on every route
        ↓  Mongoose ODM
Database (MongoDB)
```

The backend additionally talks to two **optional** external services — the Anthropic Claude API (AI features) and an SMTP provider (email) — both designed to degrade gracefully (controlled error / silent skip) rather than fail the request chain if unconfigured.

See `docs/PRESENTATION.md` → **Architecture Diagram** for the full Mermaid diagram including the service layer and Socket.IO.

**Key architectural decisions:**
- **Two-layer access control**: role check (`authorize(...roles)`) *and* ownership scoping (every trainer/member query is filtered by `req.user._id`, never by a client-supplied ID) — a valid token for one trainer can never return another trainer's data.
- **Service layer separation**: `aiService`, `analyticsService`, `emailService`, `reportService` isolate third-party/complex logic from controllers, which stay thin (validate → call service → respond).
- **Graceful optional-dependency degradation**: both `aiService` and `emailService` check for required configuration up front and return a controlled response (`503` / `{sent:false}`) instead of crashing when `ANTHROPIC_API_KEY` or `SMTP_*` vars are absent.

## Chapter 9 — Database Design

Full schema table is in `README.md` → **Database Overview**. Design principles:

- **Single `User` collection** for all three roles, differentiated by a `role` enum field, with role-specific optional fields (e.g. `specialization` for trainers, `assignedTrainer` for members). Avoids duplicating shared fields (name/email/password/status) across three collections.
- **Denormalized `trainer` field on `ProgressLog`** — copied from the member's `assignedTrainer` at submission time, so trainer-scoped queries (`ProgressLog.find({ trainer: req.user._id })`) don't require a join back through `User` on every request.
- **Referential integrity via ObjectId refs**, not enforced foreign keys (standard MongoDB pattern) — application-layer checks validate references exist before use (e.g. booking checks the class exists and has capacity).
- **Compound & single-field indexes** added on every field used as a filter in a hot query path (see README for the full list) — chosen based on the actual query patterns in each controller, not added speculatively.
- **Uniqueness enforced at the schema level** where business rules demand it: one attendance record per member per day, one active booking per member per class.

See `docs/PRESENTATION.md` → **ER Diagram** for the full entity-relationship diagram.

## Chapter 10 — Modules Description

| # | Module | Description |
|---|---|---|
| 1 | Authentication & Authorization | Registration (member-only), login, JWT issuance, role-based route guards (server-enforced) |
| 2 | Admin Management | Members, trainers, membership plans CRUD |
| 3 | Membership & Payments | Plan purchase/renewal, auto-expiry, payment history, mock payment flow |
| 4 | Class Scheduling & Booking | Admin/trainer class creation, member booking/cancellation, capacity tracking |
| 5 | QR Attendance | Per-member QR code generation, self check-in and admin/trainer scan-in |
| 6 | Workout & Diet Plans | Trainer-authored weekly plans, member-facing views, workout history logging |
| 7 | Fitness Progress Tracking | Weight/BMI/measurement logging, photo upload, goal tracking, trainer approval workflow, before/after comparison |
| 8 | AI Fitness Assistant | Claude-powered workout/diet recommendation, BMI analysis, progress prediction, conversational chatbot; separate rule-based quick-answer widget |
| 9 | Analytics & Reporting | Revenue/growth/attendance/class/trainer analytics; PDF (PDFKit) and Excel (ExcelJS) export |
| 10 | Notifications | Shared cross-role notification API, in-app bell dropdown, email delivery (Nodemailer) |
| 11 | Real-time Chat | Socket.IO-based member↔trainer messaging |

## Chapter 11 — Testing

Full detail in `docs/TESTING_AND_SECURITY_REPORT.md`. Summary of what was tested and how:

- **Method**: live functional testing against a running server + real MongoDB instance, using scripted HTTP requests with JWTs for each role (not a mocked test suite) — performed after every development phase, plus a dedicated final audit pass.
- **Authentication**: register, duplicate email, weak password, correct/incorrect login, protected-route access without a token, rate limiting (10 req/15min).
- **Authorization**: role-based blocks (member/trainer denied admin routes → 403) and **ownership** isolation (trainer A denied trainer B's data → 404, not just 403) — verified across progress, notifications, and member-assignment endpoints.
- **Per-role functional sweep**: every admin, trainer, and member module exercised end-to-end (see report for the full table).
- **File upload security**: valid image types accepted, invalid types rejected (400), oversized files rejected.
- **Report generation**: real PDF/Excel files generated and verified (not just a 200 status — file signature and content checked).
- **Browser/UI audit** (final phase): headless-browser walkthrough of Home/Login/all three dashboards with console-error monitoring (zero errors/warnings found) and a mobile-viewport (375px) responsive check of the sidebar/hamburger menu.
- **Regression**: every prior phase's endpoints re-verified after each new phase's changes to confirm nothing broke.

## Chapter 12 — Results

- All planned modules (Chapter 10) implemented and verified working end-to-end.
- **One critical security finding was made and fixed during the final audit**: the public registration endpoint accepted a client-supplied `role` field (including a role dropdown in the UI itself offering "Admin"), allowing any unauthenticated visitor to self-register as an administrator. Fixed by hardcoding public registration to always create a `member` account server-side, and removing the misleading role selector from the UI — trainer/admin accounts are now only ever created by an existing admin, matching the system's intended design.
- Performance: route-based code splitting reduced the initial JS bundle from a single 857KB chunk to a 424KB vendor chunk plus on-demand per-page chunks; 12 database indexes added across 7 collections on verified hot query paths.
- Zero console errors/warnings found across a full browser audit of all three role dashboards; responsive layout (mobile hamburger sidebar) confirmed working.
- Zero unused dependencies, zero dead files, zero leftover debug logging found across two cleanup audits (Phases 12 and 13).

## Chapter 13 — Future Enhancements

See `README.md` → **Future Scope**:
- Real payment gateway integration (currently a mock/dummy payment flow)
- Push notifications (web/mobile), in addition to the existing in-app + email notifications
- Trainer availability calendar / class waitlists
- Native mobile app on the same REST API
- Multi-branch/multi-gym support (would extend the existing role-scoping pattern with a `branch` field)
- Automated cron-based scheduling for expiry sweeps and report emails (currently triggered on-demand/at request time)
- Automated test suite (Jest + Supertest / React Testing Library) — current testing is live/scripted rather than a checked-in automated CI suite
- An admin-facing "promote user to trainer" flow (currently role changes are a direct database operation, since public self-escalation was intentionally closed off)

## Chapter 14 — Conclusion

FitZone demonstrates that a small team (or individual) can build a genuinely full-stack, multi-role system with real security boundaries — not just a CRUD demo — by consistently applying two rules throughout: enforce authorization on the server, and scope every query to the requesting user's own data, never a client-supplied ID. The project also demonstrates responsible handling of optional third-party dependencies (AI, email) that degrade gracefully rather than becoming hard requirements, and the value of a genuine final audit: the most serious issue in the entire codebase (public admin self-registration) was only found by deliberately trying to break the system's own security assumptions during Phase 13, not by feature-level testing alone. That is itself a useful takeaway for a viva: functional testing proves features work; a security audit proves they can't be misused.

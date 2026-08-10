# Database Schema

## Why MongoDB, not MySQL

This project stores data in **MongoDB via Mongoose** rather than MySQL. Every
controller, model, and relationship in the codebase is already built against
MongoDB's document model (ObjectId references + `.populate()`, not SQL joins),
and it works well for this domain — a handful of loosely-coupled collections
with occasional nested/array fields (plan `features`, workout plan
`exercises`, diet plan `meals`) that would otherwise need extra join tables in
a relational schema. Migrating to MySQL would mean rewriting all 17 models as
Sequelize models and every controller's query logic for no functional gain,
so it was deliberately kept as-is. If a relational database is a hard
requirement for your submission, budget it as a separate, dedicated
migration project — not a drop-in swap.

## Collections

Each table below lists fields (bold = required), type, and notable
constraints. Full detail lives in `server/models/*.js`.

### User (`server/models/User.js`)
| Field | Type | Notes |
|---|---|---|
| **name** | String | |
| **email** | String | unique, lowercase, validated format |
| **password** | String | bcrypt-hashed, `select:false` |
| role | String enum | `admin` \| `trainer` \| `member`, default `member` |
| phone, address, bio, specialization, profilePicture | String | |
| status | String enum | `active` \| `inactive` |
| membershipPlan | ObjectId → MembershipPlan | |
| assignedTrainer | ObjectId → User | member → trainer link |
| height | Number | |
| membershipStartDate | Date | |
| notifyByEmail | Boolean | default `true` |
| resetPasswordToken | String | SHA-256 hash of the reset token, `select:false` |
| resetPasswordExpire | Date | `select:false` |

Indexes: `role`, `assignedTrainer`.

### MembershipPlan (`MembershipPlan.js`)
name, **price**, duration (`monthly`\|`quarterly`\|`yearly`), features `[String]`, popular `Boolean`, status (`active`\|`inactive`).

### Membership (`Membership.js`)
**member** → User, **plan** → MembershipPlan, **startDate**, **endDate**, **amount**, status (`active`\|`expired`\|`cancelled`\|`pending`).
Indexes: `member`; `{status, endDate}` (drives the expiry sweep — see `membershipController.autoExpire`/`sweepExpiryReminders`).

### Payment (`Payment.js`)
**member**, **plan**, **membership**, **amount**, paymentMethod (`Razorpay`\|`Demo`), **transactionId** (unique — Razorpay payment id or generated demo id), paymentDate, paymentStatus (`success`\|`failed`).
Indexes: `member`; `paymentDate`.

### Contact (`Contact.js`)
**name**, **email**, **subject**, **message**, status (`new`\|`read`).
Index: `{status, createdAt}`.

### Class (`Class.js`)
**title**, description, **trainer** → User, **category** (enum: Yoga/Cardio/Strength/Zumba/HIIT/Pilates), **date**, **startTime**, **endTime**, **capacity**, bookedSeats, status (`upcoming`\|`completed`\|`cancelled`).
Indexes: `{date, startTime}`, `trainer`.

### Booking (`Booking.js`)
**member**, **class**, bookingDate, status (`booked`\|`cancelled`).
Index: `{member, class}` unique, partial on `status: 'booked'` — allows re-booking after a cancellation without a duplicate-key error.

### Attendance (`Attendance.js`)
**member**, **date** (String, `YYYY-MM-DD`), status (`present`).
Index: `{member, date}` unique (one check-in per member per day); `date`.

### WorkoutPlan / WorkoutHistory / Exercise / ExerciseVideo
- **WorkoutPlan**: member, trainer, title, `exercises[]` → Exercise, day (weekday enum), duration, notes, status.
- **WorkoutHistory**: member, workoutPlan → WorkoutPlan, `completedExercises[]` → Exercise, duration, caloriesBurned, completedAt, status (`completed`\|`partial`).
- **Exercise**: trainer, name, category, muscleGroup, difficulty, sets, reps, duration, video, image, description, status.
- **ExerciseVideo**: trainer, title, description, url, category.

### DietPlan (`DietPlan.js`)
member, trainer, title, `meals[String]`, notes, status.

### ProgressLog (`ProgressLog.js`)
member, trainer, weight, height, bmi, bodyFat, chest, waist, arms, thighs, progressImage, notes, status (`pending`\|`approved`\|`rejected`), trainerNote, approvedBy → User.
Indexes: `{member, createdAt}`, `{trainer, status}`.

### Goal (`Goal.js`)
member, goal, category (Weight Loss/Muscle Gain/Strength/Endurance/General Fitness), startWeight, targetWeight, targetDate, status.

### AIHistory (`AIHistory.js`)
user, type (`workout`\|`diet`\|`chatbot`\|`bmi`\|`prediction`), input (Mixed), response (Mixed).

### Notification (`Notification.js`)
user, title, message, type (`info`\|`success`\|`warning`\|`error`), read.
Index: `{user, createdAt}`.

### Message (`Message.js`)
sender → User, recipient → User, text, read.

## Entity relationships (high level)

```
User ──assignedTrainer──> User (member → trainer)
User ──1:N──> Membership ──N:1──> MembershipPlan
User ──1:N──> Payment ──N:1──> MembershipPlan, Membership
User ──1:N──> Attendance
User(trainer) ──1:N──> Class ──1:N──> Booking ──N:1──> User(member)
User(trainer) ──1:N──> WorkoutPlan ──N:M──> Exercise
WorkoutPlan ──1:N──> WorkoutHistory
User(trainer) ──1:N──> DietPlan (per member)
User(member) ──1:N──> ProgressLog ──approvedBy──> User(trainer)
User(member) ──1:N──> Goal
User ──1:N──> AIHistory, Notification
User ──N:M──> Message (sender/recipient)
```

## Seeding / admin bootstrap

There's no MySQL `.sql` schema file because Mongoose creates collections and
indexes automatically on first write — nothing to run manually. To get a
usable admin account after a fresh deploy:

1. Register a normal account through the UI (always created as `member`).
2. Connect to the database directly (MongoDB Compass, `mongosh`, or Atlas's
   web UI) and update that one document:
   ```js
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
3. Log back in — the JWT is re-issued with the new role on next login.

All subsequent admin/trainer accounts should be created from the Admin UI
(`Admin → Trainers/Members → Add`), which is the only path that assigns
non-member roles through the app itself — public registration always creates
a member (see `server/controllers/authController.js`).

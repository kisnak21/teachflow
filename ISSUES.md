# TeachFlow — Issue Tracking

> Last updated: 2026-08-02

---

## ✅ Resolved

- **[x] ISSUE-001** — `role` added to User model + migration + removed hardcoded role (commit `032b5f1`)
- **[x] ISSUE-003** — `DATABASE_URL` validated in `lib/db.ts` (commit `aed2ea2`)
- **[x] ISSUE-004** — human-friendly 6-char access codes (commit `5634093`)
- **[x] ISSUE-005** — forgot/reset password flow; now sends email via **Resend** with dev fallback (commits `d3f211e`, `5bb3119`)
- **[x] ISSUE-006** — vitest setup; tests for validations + route helpers (commits `ff08f32`, Fase 5)
- **[x] ISSUE-007** — rate limiting on auth/register/reset endpoints (commits `e00c465`, `1874ee3`)
- **[x] ISSUE-008** — per-segment error/loading boundaries for `/attendance`, `/students`, `/analytics`
- **[x] ISSUE-011** — `GROQ_API_KEY` validated at init in `lib/groq.ts`
- **[x] ISSUE-013** — route constants extracted to `lib/routes.ts`, used in `middleware.ts`
- **[x] ISSUE-014** — audited Next.js 16 docs; `next lint` removed → `eslint .`, middleware/`proxy` rename deferred
- **[x] NEW: Ownership (IDOR)** — all server actions verify teacher owns target class/assignment/lesson-plan/attachment before mutate; added `requireTeacher()`/`requireStudent()` helpers in `lib/auth-helpers.ts` (commit `76ae3e9`)
- **[x] ISSUE-018** — `/students` (teacher route) misclassified as student route: `isStudentRoute` used `startsWith('/student')`, which also matched `/students`; middleware bounced teachers back to `/dashboard`. Fixed with path-boundary check (`=== '/student'` or `startsWith('/student/')`) + regression tests (commit `6f1cb1d`)
- **[x] NEW: UploadThing orphans** — edit dialogs pushed locally-uploaded files into state with `file.key` instead of the returned DB row id, so deleting a fresh upload failed ("Attachment not found") and left an orphaned object in storage. `addAttachment` now returns the created row; dialogs use `created.id`; storage cleanup is resilient (utapi failure no longer blocks DB delete).
- **[x] NEW: Transaction-less multi-step writes** — `saveAttendance` (deleteMany → createMany) and `updateAssignment` (AssignmentClass deleteMany → recreate) now run inside `db.$transaction`.
- **[x] NEW: No server-side attendance validation** — `saveAttendance` now validates via `attendanceSchema` (zod enum status) before any DB write.
- **[x] NEW: AI endpoint without rate limit** — `generateLessonPlan` is now rate-limited per teacher (10/min) via `KeyedRateLimiter` in `lib/rate-limit.ts` (Groq cost guard).
- **[x] NEW: Unguarded delete/save handlers** — all client delete/save handlers (student-table, assignment-list, lesson-plan-list, class-card, attendance-client) now have try/catch + inline error message.
- **[x] ISSUE-016** — `middleware.ts` renamed to `proxy.ts` + export renamed to `proxy` (deprecation migration, commit pending).
- **[x] ISSUE-009** — proxy session user typed via `Session['user'] & { role? }`; role checks now use the typed union ('teacher' | 'student') instead of `req.auth?.user?.role` untyped access.
- **[x] NEW: Duplicated access-code generation** — single `lib/access-code.ts` (crypto `randomInt`, unambiguous alphabet); DB `dbgenerated` default dropped via migration; `createClass` retries on P2002 collision.
- **[x] NEW: `User.role` String → `Role` enum** — migration converts existing rows ('teacher'/'student' → 'TEACHER'/'STUDENT'); `auth.ts` maps back to lowercase for the session contract.
- **[x] NEW: Attendance duplicate risk** — `@@unique([studentId, classId, date])` added; save runs delete-then-create inside a transaction.
- **[x] NEW: Duplicated loading skeletons** — `components/page-loading.tsx` shared; the three identical `loading.tsx` files now re-export it.

---

## 🔴 Critical (P0)

### [ ] ISSUE-002: Student session ID is a `Student.id`, teacher session ID is a `User.id`

**Impact:** `session.user.id` points at different tables per role; type safety gap.
**Decision:** Keep current model (Option B) — role guards via `lib/auth-helpers.ts` everywhere. No migration planned.
**Status:** Mitigated. Revisit only if a shared user table becomes required.

---

## 🟡 High (P1)

### [ ] ISSUE-009: Middleware type safety gaps

**Status:** `types/next-auth.d.ts` extended (role/classId). Residual risk: `req.auth?.user?.role` still unguarded in `middleware.ts`.

### [ ] ISSUE-010: `bcryptjs` not Edge-compatible

**Status:** Not exercised today (bcrypt only in Node runtime via `auth.ts` + API routes). Revisit if middleware moves to Edge.

---

## 🟢 Medium (P2)

### [ ] ISSUE-015: Email sender not verified for production

**Impact:** Resend `from` defaults to `onboarding@resend.dev`; production domain must be verified + `RESEND_FROM_EMAIL` set.
**Fix:** Verify domain in Resend dashboard, set `RESEND_FROM_EMAIL`, `RESEND_API_KEY` in prod env.

---

## 🔵 Low / Quick Wins (P3)

### [ ] ISSUE-012: README setup steps incomplete

**Status:** Partially updated. Missing new env vars (`RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `RESEND_FROM_EMAIL`).

### [ ] ISSUE-017: `components/assignments/assignment-list.tsx` — `Date.now()` in `useMemo` triggers `react-hooks/purity`

**Fix:** Pass `now` as prop from server page or compute status server-side (same pattern as student assignments page).

### [ ] NEW: `app/student/login` lives outside the `(student)` route group

**Impact:** layout inheritance differs from other student pages; middleware matches it by string.
**Fix:** Move into `(student)` group or accept as-is (works today).

### [ ] NEW: PDF export returns base64 through server-action boundary

**Fix:** Move to an API route (`/api/export/attendance?classId=&date=`) with streaming binary response.

### [ ] NEW: `next-rate-limit` + `KeyedRateLimiter` are in-memory (per-process)

**Impact:** Ineffective across multiple instances.
**Fix:** Acceptable for single-instance Vercel; revisit if multi-region.

### [ ] NEW: README `Known Limitations` — profile name change requires re-login (JWT cache)

**Fix:** Shorten session maxAge so name changes appear sooner, or trigger session refresh after profile update.

---

## 📋 Suggested Work Order

1. **ISSUE-015** → verify Resend domain, set prod env vars
2. **ISSUE-012** → README env docs
3. **ISSUE-017** → purity lint fix
4. **ISSUE-016** → `proxy.ts` rename at next upgrade
5. **ISSUE-009** → strict role guard in middleware

---

## 🏷️ Labels

| Label   | Meaning                                               |
| ------- | ----------------------------------------------------- |
| `p0`    | Critical — blocks core functionality / data integrity |
| `p1`    | High — security, UX regression risk                   |
| `p2`    | Medium — maintainability, type safety                 |
| `p3`    | Low — docs, polish, quick wins                        |
| `auth`  | Authentication / authorization                        |
| `db`    | Database / Prisma                                     |
| `infra` | Build, deploy, CI, env                                |
| `ui`    | Frontend / UX                                         |
| `ai`    | AI features (Groq)                                    |

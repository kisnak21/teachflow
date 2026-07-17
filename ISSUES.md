# TeachFlow — Issue Tracking

> Generated: 2026-07-17

---

## 🔴 Critical (P0)

### [ ] ISSUE-001: `role` field missing from User model
**Impact:** Auth returns hardcoded `role: 'teacher'`, no DB distinction for admin/guru.
**Fix:** Add `role String @default("teacher")` to `prisma/schema.prisma` → run migration.
**Files:** `prisma/schema.prisma`, `auth.ts` (remove hardcoded role)

### [ ] ISSUE-002: Student login uses Student ID as session user ID (inconsistent)
**Impact:** `session.user.id` points to `Student` table for students, `User` table for teachers. Breaks type safety and future queries.
**Fix Options:**
- A: Create `User` record for each student (link via `studentId`)
- B: Separate session types with explicit type guards in middleware
**Files:** `auth.ts`, `auth.config.ts`, `middleware.ts`, `lib/db.ts`

### [ ] ISSUE-003: `DATABASE_URL` non-null assertion crashes app silently
**Impact:** `lib/db.ts` uses `process.env.DATABASE_URL!` — throws cryptic error if unset.
**Fix:** Validate at startup, throw clear error.
**Files:** `lib/db.ts`

---

## 🟡 High (P1)

### [ ] ISSUE-004: Class access codes are CUIDs (unfriendly)
**Impact:** `accessCode @default(cuid())` → `clh4x9...` not human-readable 4-6 digit codes.
**Fix:** Generate 6-char alphanumeric on create, or add `@default(dbgenerated("..."))` with custom function.
**Files:** `prisma/schema.prisma`, `lib/actions/class.actions.ts`

### [ ] ISSUE-005: No password reset / forgot password flow
**Impact:** Users locked out permanently if forgot password.
**Fix:** Add token-based reset via email (Nodemailer/Resend) + `/forgot-password` + `/reset-password` routes.
**Files:** `auth.ts`, `app/(auth)/`, new API routes

### [ ] ISSUE-006: Zero tests
**Impact:** 87 TypeScript files, 0 test coverage. High regression risk.
**Fix:** Add Vitest/Jest + Playwright for auth flow + critical server actions.
**Files:** `package.json`, new `tests/` directory

### [ ] ISSUE-007: No rate limiting on auth endpoints
**Impact:** Brute-force login possible on `/api/auth/...`
**Fix:** `next-rate-limit` or Upstash Redis on credentials provider.
**Files:** `auth.ts`, middleware, `package.json`

---

## 🟢 Medium (P2)

### [ ] ISSUE-008: Single global error/loading boundaries
**Impact:** One `error.tsx` and `loading.tsx` for entire dashboard group.
**Fix:** Add per-segment boundaries (`(dashboard)/attendance/error.tsx`, etc.)
**Files:** `app/(dashboard)/*/error.tsx`, `loading.tsx`

### [ ] ISSUE-009: Middleware type safety gaps
**Impact:** `req.auth?.user?.role` accessed without type guards.
**Fix:** Extend `NextAuth` types in `types/next-auth.d.ts` + narrow in middleware.
**Files:** `types/next-auth.d.ts`, `middleware.ts`

### [ ] ISSUE-010: `bcryptjs` not Edge-compatible
**Impact:** Will fail if middleware ever runs on Edge runtime.
**Fix:** Switch to `bcrypt-edge` or `bcryptjs` with `edge: true` config.
**Files:** `auth.ts`, `package.json`

---

## 🔵 Low / Quick Wins (P3)

### [ ] ISSUE-011: Verify `GROQ_API_KEY` in `.env` for AI lesson generator
**Impact:** AI feature fails silently without key.
**Fix:** Check `.env` has `GROQ_API_KEY=sk_...`

### [ ] ISSUE-012: README setup steps incomplete
**Impact:** New contributors miss `prisma generate` + `DATABASE_URL` steps.
**Fix:** Document full setup: `.env` → `npm i` → `prisma generate` → `npm run dev`

### [ ] ISSUE-013: Extract route constants from middleware
**Impact:** Route arrays duplicated/hardcoded in `middleware.ts`.
**Fix:** Move to `lib/constants.ts` or `lib/routes.ts`.

### [ ] ISSUE-014: Check Next.js 16 / React 19 deprecations
**Impact:** Running on pre-release versions; breaking changes likely.
**Fix:** Read `node_modules/next/dist/docs/` + follow upgrade guide.

---

## 📋 Suggested Work Order

1. **ISSUE-001** → migration first (blocks other auth fixes)
2. **ISSUE-003** → quick fix, prevents prod crash
3. **ISSUE-002** → decide approach A vs B, then implement
4. **ISSUE-004** → UX improvement, low risk
5. **ISSUE-007** → security, easy with Upstash free tier
6. **ISSUE-006** → start with auth integration tests
7. Remaining by priority

---

## 🏷️ Labels

| Label | Meaning |
|-------|---------|
| `p0` | Critical — blocks core functionality / data integrity |
| `p1` | High — security, UX regression risk |
| `p2` | Medium — maintainability, type safety |
| `p3` | Low — docs, polish, quick wins |
| `auth` | Authentication / authorization |
| `db` | Database / Prisma |
| `infra` | Build, deploy, CI, env |
| `ui` | Frontend / UX |
| `ai` | AI features (Groq) |
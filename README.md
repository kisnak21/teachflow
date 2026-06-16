# TeachFlow

A SaaS application for teachers to manage classes, students, attendance, assignments, and lesson plans — with AI-powered lesson plan generation.

## Tech Stack

- **Framework** — Next.js 16 (App Router) + TypeScript
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Database** — PostgreSQL (Neon) + Prisma 7
- **Auth** — Auth.js v5
- **AI** — Groq API (Llama 3.3 70B)
- **Deployment** — Vercel

## Features

- Class management with level grouping and filtering
- Student management with class filter
- Daily attendance recording with bulk select
- Assignment management — assign to multiple classes, due date tracking
- Lesson plan management
- AI lesson generator — generates objectives, activities, assessment, and homework ideas

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- Groq API key — free tier at [console.groq.com](https://console.groq.com)

### Setup

```bash
git clone https://github.com/yourusername/teachflow.git
cd teachflow
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-auth-secret"
GROQ_API_KEY="your-groq-api-key"
```

```bash
npx prisma db push
npx prisma generate
npm run dev
```

## Deployment

Vercel — add `DATABASE_URL`, `AUTH_SECRET`, `GROQ_API_KEY` as environment variables. Build script handles `prisma generate` automatically.
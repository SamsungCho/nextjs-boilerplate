# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a minimal Next.js 15 boilerplate with Google OAuth via Auth.js v5, Neon PostgreSQL, Prisma ORM, Tailwind v4, and shadcn/ui.

**Architecture:** App Router-based Next.js 15 project. Auth.js v5 with PrismaAdapter stores sessions in Neon PostgreSQL. Middleware protects `/dashboard/*` routes by checking the session and redirecting unauthenticated users to `/signin`.

**Tech Stack:** Next.js 15, Auth.js v5 (next-auth@beta), @auth/prisma-adapter, Prisma, @prisma/client, Neon PostgreSQL, Tailwind CSS v4, shadcn/ui, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` | Create | Project deps via create-next-app |
| `.env.local.example` | Create | Required env vars template |
| `.env.local` | Create | Local secrets (git-ignored) |
| `prisma/schema.prisma` | Create | User, Account, Session models |
| `lib/db.ts` | Create | Prisma client singleton |
| `lib/auth.ts` | Create | Auth.js config (GoogleProvider + PrismaAdapter) |
| `app/api/auth/[...nextauth]/route.ts` | Create | Auth.js HTTP handlers |
| `middleware.ts` | Create | Protect `/dashboard/*` routes |
| `components/providers.tsx` | Create | SessionProvider client wrapper |
| `app/layout.tsx` | Modify | Add SessionProvider wrapper |
| `app/page.tsx` | Modify | Home page with session-aware UI |
| `app/(auth)/signin/page.tsx` | Create | Google sign-in page |
| `app/(protected)/dashboard/page.tsx` | Create | Protected dashboard |
| `vitest.config.ts` | Create | Vitest config |
| `lib/auth.test.ts` | Create | Smoke test: auth exports |
| `middleware.test.ts` | Create | Smoke test: middleware matcher |

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json` and all base files via create-next-app

- [ ] **Step 1: Run create-next-app in the project directory**

```bash
cd C:\Download\260528\nextjs-boilerplate
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --yes
```

Expected output: `Success! Created project at ...`

- [ ] **Step 2: Install additional dependencies**

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
```

Expected output: `added N packages`

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react
```

Expected output: `added N packages`

- [ ] **Step 4: Verify project structure**

```bash
ls
```

Expected: `app/`, `components/`, `lib/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project"
```

---

## Task 2: Create environment variables

**Files:**
- Create: `.env.local.example`
- Create: `.env.local`

- [ ] **Step 1: Create .env.local.example**

Create file `C:\Download\260528\nextjs-boilerplate\.env.local.example`:

```bash
# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=

# Google OAuth — https://console.cloud.google.com
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Neon PostgreSQL — copy from Neon console (Connection string)
DATABASE_URL=
```

- [ ] **Step 2: Create .env.local from example**

```bash
cp .env.local.example .env.local
```

- [ ] **Step 3: Fill in .env.local**

Fill in the actual values in `.env.local`:
- `AUTH_SECRET`: run `openssl rand -base64 32` (or use any random 32-char string on Windows)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: from Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application). Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
- `DATABASE_URL`: from Neon console → Connection string (postgres://...)

- [ ] **Step 4: Verify .env.local is git-ignored**

Check that `.gitignore` already contains `.env.local` (create-next-app adds this by default):

```bash
grep ".env.local" .gitignore
```

Expected: `.env*.local`

- [ ] **Step 5: Commit .env.local.example only**

```bash
git add .env.local.example
git commit -m "feat: add env vars template"
```

---

## Task 3: shadcn/ui setup

**Files:**
- Create: `components/ui/button.tsx` (auto-generated)
- Create: `components/ui/card.tsx` (auto-generated)
- Create: `components.json`

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init --defaults
```

When prompted, accept all defaults (uses `app/globals.css`, `@/components`, `@/lib/utils`).

Expected output: `✔ Writing components.json` and CSS variable additions to `app/globals.css`

- [ ] **Step 2: Add Button component**

```bash
npx shadcn@latest add button
```

Expected: `✔ Done. Created components/ui/button.tsx`

- [ ] **Step 3: Add Card component**

```bash
npx shadcn@latest add card
```

Expected: `✔ Done. Created components/ui/card.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with Button and Card"
```

---

## Task 4: Prisma + Neon database setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Expected: creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`

- [ ] **Step 2: Replace prisma/schema.prisma with Auth.js schema**

Replace the contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Push schema to Neon**

```bash
npx prisma db push
```

Expected: `✔ Your database is now in sync with your Prisma schema.`

If this fails, verify `DATABASE_URL` in `.env.local` is correct. Note: `prisma db push` reads from `.env` by default — copy `DATABASE_URL` into `.env` temporarily if needed (don't commit it).

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 5: Create lib/db.ts**

Create `lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ lib/db.ts
git commit -m "feat: add Prisma schema and DB client for Neon"
```

---

## Task 5: Auth.js configuration

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create lib/auth.ts**

Create `lib/auth.ts`:

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
})
```

- [ ] **Step 2: Create app/api/auth/[...nextauth]/route.ts**

Create directory `app/api/auth/[...nextauth]/` and file `route.ts`:

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts app/api/auth/
git commit -m "feat: add Auth.js with Google provider and PrismaAdapter"
```

---

## Task 6: Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware.ts**

Create `middleware.ts` at the project root:

```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

This re-exports the Auth.js `auth` function as Next.js middleware. Unauthenticated requests to `/dashboard/*` are automatically redirected to `/signin` (configured in `lib/auth.ts` → `pages.signIn`).

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect /dashboard routes with Auth.js middleware"
```

---

## Task 7: SessionProvider wrapper + root layout

**Files:**
- Create: `components/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create components/providers.tsx**

Create `components/providers.tsx`:

```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 2: Update app/layout.tsx**

Replace the contents of `app/layout.tsx`:

```typescript
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js 15 + Auth.js + Neon + Prisma + shadcn/ui",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/providers.tsx app/layout.tsx
git commit -m "feat: add SessionProvider to root layout"
```

---

## Task 8: Pages

**Files:**
- Modify: `app/page.tsx`
- Create: `app/(auth)/signin/page.tsx`
- Create: `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Update app/page.tsx**

Replace the contents of `app/page.tsx`:

```typescript
import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Next.js Boilerplate</h1>
      {session ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground">
            Welcome, {session.user?.name}
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      ) : (
        <Link href="/signin">
          <Button>Sign In</Button>
        </Link>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Create app/(auth)/signin/page.tsx**

Create directory `app/(auth)/signin/` and file `page.tsx`:

```typescript
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Use your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <Button type="submit" className="w-full">
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 3: Create app/(protected)/dashboard/page.tsx**

Create directory `app/(protected)/dashboard/` and file `page.tsx`:

```typescript
import { auth, signOut } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {session?.user?.email}
            </span>
          </p>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button variant="outline" type="submit" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: add home, signin, and dashboard pages"
```

---

## Task 9: Vitest setup + smoke tests

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/auth.test.ts`
- Create: `middleware.test.ts`

- [ ] **Step 1: Create vitest.config.ts**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
})
```

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `scripts` section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Write failing test — auth exports**

Create `lib/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest"

describe("auth module exports", () => {
  it("exports handlers, auth, signIn, signOut", async () => {
    const mod = await import("./auth")
    expect(mod.handlers).toBeDefined()
    expect(mod.auth).toBeDefined()
    expect(mod.signIn).toBeDefined()
    expect(mod.signOut).toBeDefined()
  })
})
```

- [ ] **Step 4: Run test to verify it fails (or passes structurally)**

```bash
npm test
```

Expected: test runs. If it fails due to missing env vars, that's acceptable at this stage — the structure is correct.

- [ ] **Step 5: Write middleware config test**

Create `middleware.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { config } from "./middleware"

describe("middleware config", () => {
  it("protects dashboard routes", () => {
    expect(config.matcher).toContain("/dashboard/:path*")
  })
})
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: `middleware config > protects dashboard routes` PASS

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts lib/auth.test.ts middleware.test.ts package.json
git commit -m "test: add Vitest setup and smoke tests"
```

---

## Task 10: Verify the app runs

**Files:** none (read-only verification)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: `▲ Next.js 15.x.x` ... `✓ Ready in Xs` on `http://localhost:3000`

- [ ] **Step 2: Check home page**

Open `http://localhost:3000`. Expected: "Next.js Boilerplate" heading and "Sign In" button.

- [ ] **Step 3: Check sign-in redirect**

Open `http://localhost:3000/dashboard` directly. Expected: redirected to `http://localhost:3000/signin`.

- [ ] **Step 4: Check Google sign-in flow**

Click "Continue with Google" on `/signin`. Expected: Google OAuth consent screen appears, after completing returns to `/dashboard`.

- [ ] **Step 5: Check dashboard**

After sign-in, `/dashboard` should show the user's email and a Sign Out button.

- [ ] **Step 6: Check sign-out**

Click Sign Out. Expected: redirected to `/` with the "Sign In" button showing again.

- [ ] **Step 7: Build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no type errors.

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: verify boilerplate build and auth flow"
```

---

## Checklist Against Spec

| Spec requirement | Task |
|-----------------|------|
| Next.js 15, App Router | Task 1 |
| Tailwind v4 | Task 1 (create-next-app --tailwind) |
| shadcn/ui (Button, Card) | Task 3 |
| Auth.js v5 + Google OAuth | Task 5 |
| Neon PostgreSQL + Prisma | Task 4 |
| Database session strategy | Task 5 (PrismaAdapter) |
| Middleware protecting /dashboard/* | Task 6 |
| /signin page | Task 8 |
| /dashboard page (protected) | Task 8 |
| Home page (session-aware) | Task 8 |
| .env.local.example | Task 2 |
| SessionProvider in layout | Task 7 |

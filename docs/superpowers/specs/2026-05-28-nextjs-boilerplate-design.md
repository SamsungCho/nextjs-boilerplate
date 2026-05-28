# Next.js Boilerplate Design

**Date:** 2026-05-28
**Stack:** Next.js 15 · Auth.js v5 · Neon PostgreSQL · Prisma · Tailwind v4 · shadcn/ui

---

## Overview

A minimal Next.js boilerplate with Google OAuth authentication, Neon PostgreSQL via Prisma, and shadcn/ui. Designed as a clean starting point — only what every project needs, nothing more.

---

## Architecture

### File Structure

```
nextjs-boilerplate/
├── app/
│   ├── (auth)/
│   │   └── signin/page.tsx        # Google 로그인 버튼
│   ├── (protected)/
│   │   └── dashboard/page.tsx     # 인증 후 접근 가능한 예시 페이지
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts               # Auth.js 핸들러
│   ├── layout.tsx                 # 루트 레이아웃 (SessionProvider)
│   └── page.tsx                   # 홈 (세션 상태에 따라 분기)
├── components/ui/                 # shadcn 컴포넌트 (Button, Card)
├── lib/
│   ├── auth.ts                    # Auth.js 설정 (GoogleProvider + PrismaAdapter)
│   └── db.ts                      # Prisma 클라이언트 싱글톤
├── prisma/
│   └── schema.prisma              # User, Account, Session 스키마
├── middleware.ts                  # 보호된 라우트 접근 제어
└── .env.local.example             # 필요한 환경변수 목록
```

---

## Auth Flow

```
사용자 → /dashboard 접근
    ↓
middleware.ts — 세션 확인
    ↓ 미인증
/signin 리다이렉트
    ↓
Google OAuth 버튼 클릭
    ↓
Google 인증 완료
    ↓
Auth.js 콜백 → PrismaAdapter가 User/Account/Session을 Neon DB에 저장
    ↓
/dashboard 리다이렉트 (세션 쿠키 발급)
```

- `middleware.ts`: `/dashboard/*` 등 보호 경로 패턴 지정, 미인증 시 `/signin` 리다이렉트
- 세션 전략: **database** (JWT 아님) — 서버에서 직접 세션 조회 가능
- `lib/auth.ts`: GoogleProvider + PrismaAdapter 조합

---

## Database Schema

```prisma
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
```

Auth.js PrismaAdapter 요구 최소 스키마. `User`에 `createdAt` 추가 — 프로젝트별 필드 확장 기준점.

---

## Environment Variables

`.env.local.example`:
```bash
# Auth.js
AUTH_SECRET=                    # openssl rand -base64 32

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Neon DB
DATABASE_URL=                   # Neon 콘솔에서 복사
```

---

## Dependencies

```
next@15
next-auth@5 (beta)
@auth/prisma-adapter
prisma
@prisma/client
@neondatabase/serverless
tailwindcss@4
shadcn/ui
```

shadcn 프리셋: `Button`, `Card`

---

## Pages

| Route | 접근 | 설명 |
|-------|------|------|
| `/` | 공개 | 홈, 로그인 상태에 따라 버튼 분기 |
| `/signin` | 공개 | Google 로그인 버튼 |
| `/dashboard` | 보호 | 로그인 후 접근 가능한 예시 페이지 |

---

## Out of Scope

- 이메일/비밀번호 인증
- 다크모드
- 유저 프로필 페이지
- 환경변수 검증 (t3-env)
- 에러 바운더리 / 로딩 스켈레톤

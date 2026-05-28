# Post Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal cafe-style comments feature to a single post detail page. Logged-in users can write comments, everyone can read them, and the page should feel like a natural starting point for a future community post experience.

**Architecture:** Use one sample post detail route at `/posts/welcome` instead of introducing a full post CMS. The page renders post content on the server, loads comments from PostgreSQL through Prisma, and shows a comment form only for signed-in users. Server actions handle comment submission and revalidate the post route so the list updates immediately after posting.

**Tech Stack:** Next.js 16 App Router, Auth.js v5, Prisma, PostgreSQL, Tailwind v4, shadcn/ui, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `prisma/schema.prisma` | Modify | Add `Comment` model and `User.comments` relation |
| `lib/posts.ts` | Create | Single sample post source of truth |
| `lib/comments.ts` | Create | Comment validation + Prisma query helpers |
| `lib/posts.test.ts` | Create | Test post lookup helpers |
| `lib/comments.test.ts` | Create | Test comment validation helpers |
| `app/posts/[slug]/page.tsx` | Create | Post detail page with comment section |
| `app/posts/[slug]/actions.ts` | Create | Server action for creating comments |
| `components/comments/comment-form.tsx` | Create | Client form with `useActionState` |
| `components/comments/comment-list.tsx` | Create | Render comments list and empty state |
| `app/page.tsx` | Modify | Add a featured link card to `/posts/welcome` |
| `package.json` | Modify | Keep build script running `prisma generate && next build` |

---

## Task 1: Add the comment data model and helper layer

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/posts.ts`
- Create: `lib/comments.ts`
- Create: `lib/posts.test.ts`
- Create: `lib/comments.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `lib/posts.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { getPostBySlug } from "./posts"

describe("getPostBySlug", () => {
  it("returns the sample post for /posts/welcome", () => {
    const post = getPostBySlug("welcome")

    expect(post).not.toBeNull()
    expect(post?.slug).toBe("welcome")
    expect(post?.title).toBe("Welcome to the cafe")
  })

  it("returns null for unknown slugs", () => {
    expect(getPostBySlug("missing")).toBeNull()
  })
})
```

Create `lib/comments.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { MAX_COMMENT_LENGTH, validateCommentContent } from "./comments"

describe("validateCommentContent", () => {
  it("trims whitespace and accepts normal text", () => {
    const result = validateCommentContent("  first comment  ")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe("first comment")
    }
  })

  it("rejects empty content", () => {
    const result = validateCommentContent("   ")

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe("댓글을 입력해 주세요.")
    }
  })

  it("rejects content that is too long", () => {
    const result = validateCommentContent("a".repeat(MAX_COMMENT_LENGTH + 1))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe("댓글은 300자 이하로 입력해 주세요.")
    }
  })
})
```

- [ ] **Step 2: Run the tests to confirm they fail for missing implementation**

Run: `npm test`

Expected: Vitest reports failures because `getPostBySlug` and `validateCommentContent` do not exist yet.

- [ ] **Step 3: Implement the sample post and comment helpers**

Create `lib/posts.ts`:

```ts
export type Post = {
  slug: string
  title: string
  excerpt: string
  authorName: string
  publishedAt: string
  body: string[]
}

const POSTS: Post[] = [
  {
    slug: "welcome",
    title: "Welcome to the cafe",
    excerpt: "A simple sample post for the first comment experience.",
    authorName: "Cafe Admin",
    publishedAt: "2026-05-28",
    body: [
      "This is a lightweight sample post so the comment flow has a real place to live.",
      "The first version only needs one post detail screen and a comment section below it.",
    ],
  },
]

export function getPostBySlug(slug: string): Post | null {
  return POSTS.find((post) => post.slug === slug) ?? null
}

export function getFeaturedPost() {
  return POSTS[0]
}
```

Create `lib/comments.ts`:

```ts
import { db } from "@/lib/db"

export const MAX_COMMENT_LENGTH = 300

export type CommentRecord = {
  id: string
  postSlug: string
  userId: string
  userName: string
  userImage: string | null
  content: string
  createdAt: Date
  updatedAt: Date
}

export type CommentValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function validateCommentContent(content: string): CommentValidationResult {
  const trimmed = content.trim()

  if (!trimmed) {
    return { ok: false, error: "댓글을 입력해 주세요." }
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: "댓글은 300자 이하로 입력해 주세요." }
  }

  return { ok: true, value: trimmed }
}

export async function listCommentsForPost(postSlug: string): Promise<CommentRecord[]> {
  return db.comment.findMany({
    where: { postSlug },
    orderBy: { createdAt: "asc" },
  })
}

export async function createCommentForPost(input: {
  postSlug: string
  userId: string
  userName: string
  userImage: string | null
  content: string
}) {
  return db.comment.create({
    data: input,
  })
}
```

Update `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
}

model Comment {
  id         String   @id @default(cuid())
  postSlug   String
  userId     String
  userName   String
  userImage  String?
  content    String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([postSlug, createdAt])
}
```

- [ ] **Step 4: Run the tests again to confirm the helpers pass**

Run: `npm test`

Expected: `lib/posts.test.ts` and `lib/comments.test.ts` pass.

- [ ] **Step 5: Push the Prisma schema to the database and regenerate the client**

Run:

```bash
npx prisma generate
npx prisma db push
```

Expected:
- `Generated Prisma Client`
- `Your database is now in sync with your Prisma schema.`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/posts.ts lib/comments.ts lib/posts.test.ts lib/comments.test.ts
git commit -m "feat: add post comments data model"
```

---

## Task 2: Build the post detail page and authenticated comment flow

**Files:**
- Create: `app/posts/[slug]/page.tsx`
- Create: `app/posts/[slug]/actions.ts`
- Create: `components/comments/comment-form.tsx`
- Create: `components/comments/comment-list.tsx`

- [ ] **Step 1: Write the server action and page shell**

Create `app/posts/[slug]/actions.ts`:

```ts
"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createCommentForPost, validateCommentContent } from "@/lib/comments"
import { revalidatePath } from "next/cache"

export type CommentFormState = {
  ok: boolean
  message: string | null
}

const initialState: CommentFormState = {
  ok: false,
  message: null,
}

export async function submitComment(
  postSlug: string,
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await auth()

  if (!session?.user?.email) {
    return { ok: false, message: "댓글 작성은 로그인한 사용자만 가능합니다." }
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return { ok: false, message: "사용자 정보를 찾을 수 없습니다." }
  }

  const rawContent = String(formData.get("content") ?? "")
  const result = validateCommentContent(rawContent)

  if (!result.ok) {
    return { ok: false, message: result.error }
  }

  await createCommentForPost({
    postSlug,
    userId: user.id,
    userName: user.name ?? user.email ?? "Anonymous",
    userImage: user.image,
    content: result.value,
  })

  revalidatePath(`/posts/${postSlug}`)

  return { ok: true, message: "댓글이 등록되었습니다." }
}

export { initialState }
```

Create `app/posts/[slug]/page.tsx`:

```tsx
import { auth } from "@/lib/auth"
import { getPostBySlug } from "@/lib/posts"
import { listCommentsForPost } from "@/lib/comments"
import { notFound } from "next/navigation"
import { CommentForm } from "@/components/comments/comment-form"
import { CommentList } from "@/components/comments/comment-list"

type PostPageProps = {
  params: { slug: string }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const [session, comments] = await Promise.all([
    auth(),
    listCommentsForPost(post.slug),
  ])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-6 py-12">
      <article className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Featured post</p>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            By {post.authorName} · {post.publishedAt}
          </p>
        </div>

        <div className="space-y-4 text-base leading-7 text-foreground/90">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="space-y-6 border-t pt-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Comments</h2>
          <p className="text-sm text-muted-foreground">
            Logged-in users can leave a comment below.
          </p>
        </div>

        <CommentList comments={comments} />

        {session ? (
          <CommentForm postSlug={post.slug} />
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Sign in to leave a comment.
          </div>
        )}
      </section>
    </main>
  )
}
```

Create `components/comments/comment-list.tsx`:

```tsx
import type { CommentRecord } from "@/lib/comments"

type CommentListProps = {
  comments: CommentRecord[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{comment.userName}</p>
              <p className="text-xs text-muted-foreground">
                {comment.createdAt.toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  )
}
```

Create `components/comments/comment-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { initialState, submitComment, type CommentFormState } from "@/app/posts/[slug]/actions"
import { useFormStatus } from "react-dom"

type CommentFormProps = {
  postSlug: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-fit" disabled={pending}>
      {pending ? "등록 중..." : "댓글 등록"}
    </Button>
  )
}

export function CommentForm({ postSlug }: CommentFormProps) {
  const [state, action] = useActionState(
    submitComment.bind(null, postSlug),
    initialState,
  )

  return (
    <form action={action} className="space-y-3 rounded-lg border bg-card p-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium">Comment</span>
        <textarea
          name="content"
          rows={4}
          maxLength={300}
          placeholder="Write your comment..."
          className="w-full rounded-md border bg-background p-3 text-sm outline-none"
        />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
```

- [ ] **Step 2: Run the app and verify the post detail page exists**

Run: `npm run dev`

Expected: the app starts successfully and `http://localhost:3000/posts/welcome` renders the sample post with a comments section.

- [ ] **Step 3: Verify the logged-out state**

Open `http://localhost:3000/posts/welcome`.

Expected:
- The post content is visible.
- Existing comments are visible if any exist.
- The comment form is replaced by a sign-in prompt.

- [ ] **Step 4: Commit**

```bash
git add app/posts/[slug]/ components/comments/
git commit -m "feat: add post detail comments flow"
```

---

## Task 3: Surface the sample post from the home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the home page to keep auth state and add a featured post card**

Update `app/page.tsx` so the landing page keeps the existing sign-in/sign-out behavior and adds a featured post card above it:

```tsx
import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFeaturedPost } from "@/lib/posts"

export default async function Home() {
  const session = await auth()
  const featuredPost = getFeaturedPost()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Card>
        <CardHeader>
          <CardDescription>Featured post</CardDescription>
          <CardTitle>{featuredPost.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{featuredPost.excerpt}</p>
          <Link href={`/posts/${featuredPost.slug}`}>
            <Button>Open comments</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <>
              <p className="text-sm text-muted-foreground">
                Signed in as {session.user?.email}
              </p>
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
            </>
          ) : (
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 2: Run the app and check the landing page CTA**

Run: `npm run dev`

Expected: the home page shows a featured card that opens `/posts/welcome` and preserves the existing login state card.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: link home page to sample post"
```

---

## Task 4: Verify the full flow

**Files:** none

- [ ] **Step 1: Run the automated tests**

Run: `npm test`

Expected: helper tests pass.

- [ ] **Step 2: Build for production**

Run: `npm run build`

Expected: `prisma generate` runs first, then Next.js finishes with no build errors.

- [ ] **Step 3: Test the logged-in comment flow in the browser**

Open `http://localhost:3000/posts/welcome`, sign in, post a comment, refresh, and confirm the comment persists.

Expected:
- Signed-in users can submit comments.
- The new comment appears in the list after submit and after refresh.
- Logged-out users still only see the read-only state.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify post comments feature"
```

---

## Checklist Against Spec

| Spec requirement | Task |
|------------------|------|
| Single sample post detail page | Task 2, Task 3 |
| Logged-in users can write comments | Task 2 |
| Everyone can read comments | Task 2 |
| Minimal cafe-style UI | Task 2, Task 3 |
| Prisma/PostgreSQL persistence | Task 1, Task 2 |
| No replies/likes/edit/delete | Task 1 out of scope, Task 2 UI |
| Build still works on Vercel | Task 4 |

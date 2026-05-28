# Post Comments Design

**Date:** 2026-05-28  
**Stack:** Next.js 16, Auth.js v5, Prisma, PostgreSQL, Tailwind v4, shadcn/ui

---

## Goal

Add a minimal cafe-style comments feature to a single post detail page. Logged-in users can write comments, everyone can read them, and the page should feel like a natural starting point for a future community post experience.

## Overview

The project does not currently have a real post CMS, so v1 will use one sample post detail route as the entry point for comments. The post content will be rendered on the server, and comments will be stored in PostgreSQL through Prisma. Authentication will continue to use the existing Auth.js setup, and only signed-in users will see the comment form.

## Architecture

### Route structure

- `app/posts/[slug]/page.tsx` renders the post detail page and comment section.
- `app/posts/[slug]/actions.ts` handles comment submission on the server.
- `components/comments/*` contains the comment form and comment list UI.

### Data model

Use a single `Comment` table keyed by `postSlug` instead of introducing a full `Post` table in v1. That keeps the feature small while still letting the UI behave like a real post detail page. Each comment stores:

- `id`
- `postSlug`
- `userId`
- `userName`
- `userImage`
- `content`
- `createdAt`
- `updatedAt`

### Data flow

1. The post page loads the article content and the comments for that slug on the server.
2. If a session exists, the comment form is shown.
3. When a signed-in user submits a comment, the server action validates the content, inserts the comment, and revalidates the current post route.
4. If the user is not signed in, the page shows a login prompt instead of the form.

### UI behavior

- Comments appear below the post content.
- New comments display the author name, avatar if available, timestamp, and body text.
- The form is available only to authenticated users.
- The v1 experience does not include replies, likes, edit/delete controls, moderation, or pagination.

## File Structure

| File | Responsibility |
|------|----------------|
| `prisma/schema.prisma` | Add the `Comment` model |
| `lib/comments.ts` | Comment query helpers used by the page and server action |
| `app/posts/[slug]/page.tsx` | Render post detail and comment section |
| `app/posts/[slug]/actions.ts` | Create comment server action |
| `components/comments/comment-form.tsx` | Authenticated comment input form |
| `components/comments/comment-list.tsx` | Render existing comments |
| `app/page.tsx` | Add a featured link card to the sample post detail page |

## Error Handling

- Empty comments are rejected on the server.
- Comments longer than the allowed limit are rejected before insert.
- Unauthenticated submissions are redirected or blocked from creating data.
- Database errors should render a friendly inline message in the comment area rather than breaking the whole page.

## Out of Scope

- Replies or nested threads
- Likes or reactions
- Comment editing or deletion
- Moderation tools
- Rich text or markdown rendering
- Search, filtering, or pagination
- A full post editor or CMS

## Success Criteria

- A logged-in user can submit a comment on the post detail page.
- Logged-out users can read comments but cannot submit them.
- Submitted comments persist in the database and appear after refresh.
- The page still builds successfully on Vercel.

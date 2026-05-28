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
    return { ok: false, error: "Please write a comment." }
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: "Comments must be 300 characters or less." }
  }

  return { ok: true, value: trimmed }
}

export async function listCommentsForPost(postSlug: string): Promise<CommentRecord[]> {
  try {
    return await db.comment.findMany({
      where: { postSlug },
      orderBy: { createdAt: "asc" },
    })
  } catch (error) {
    console.error("Failed to load comments for post", postSlug, error)
    return []
  }
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

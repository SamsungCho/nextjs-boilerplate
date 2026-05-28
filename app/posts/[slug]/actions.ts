"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createCommentForPost, validateCommentContent } from "@/lib/comments"
import { revalidatePath } from "next/cache"

export type CommentFormState = {
  ok: boolean
  message: string | null
}

export const initialState: CommentFormState = {
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
    return { ok: false, message: "Only signed-in users can leave comments." }
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return { ok: false, message: "We couldn't find your user account." }
  }

  const rawContent = String(formData.get("content") ?? "")
  const result = validateCommentContent(rawContent)

  if (!result.ok) {
    return { ok: false, message: result.error }
  }

  try {
    await createCommentForPost({
      postSlug,
      userId: user.id,
      userName: user.name ?? user.email ?? "Anonymous",
      userImage: user.image,
      content: result.value,
    })
  } catch (error) {
    console.error("Failed to create comment", error)
    return {
      ok: false,
      message: "We couldn't save your comment right now.",
    }
  }

  revalidatePath(`/posts/${postSlug}`)

  return { ok: true, message: "Your comment was posted." }
}

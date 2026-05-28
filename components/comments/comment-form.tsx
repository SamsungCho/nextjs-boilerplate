"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { initialState, submitComment } from "@/app/posts/[slug]/actions"

type CommentFormProps = {
  postSlug: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-fit" disabled={pending}>
      {pending ? "Posting..." : "Post comment"}
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

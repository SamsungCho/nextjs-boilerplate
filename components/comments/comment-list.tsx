import type { CommentRecord } from "@/lib/comments"

type CommentListProps = {
  comments: CommentRecord[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        No comments yet. Be the first to write one.
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-medium">{comment.userName}</p>
              <p className="text-xs text-muted-foreground">
                {comment.createdAt.toLocaleString("en-US")}
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

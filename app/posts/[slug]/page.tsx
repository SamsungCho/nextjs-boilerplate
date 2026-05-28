import { auth } from "@/lib/auth"
import { getPostBySlug } from "@/lib/posts"
import { listCommentsForPost } from "@/lib/comments"
import { notFound } from "next/navigation"
import { CommentForm } from "@/components/comments/comment-form"
import { CommentList } from "@/components/comments/comment-list"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PostPageProps = {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
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

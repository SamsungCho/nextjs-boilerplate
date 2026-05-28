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

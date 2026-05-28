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

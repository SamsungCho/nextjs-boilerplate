import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Next.js Boilerplate</h1>
      {session ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground">
            Welcome, {session.user?.name}
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
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
        </div>
      ) : (
        <Link href="/signin">
          <Button>Sign In</Button>
        </Link>
      )}
    </main>
  )
}

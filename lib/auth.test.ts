import { beforeEach, describe, expect, it, vi } from "vitest"

const nextAuthMock = vi.fn(() => ({
  handlers: { GET: vi.fn(), POST: vi.fn() },
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

const prismaAdapterMock = vi.fn(() => ({ name: "PrismaAdapter" }))
const googleProviderMock = vi.fn(() => ({ id: "google" }))

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}))

vi.mock("next-auth/providers/google", () => ({
  default: googleProviderMock,
}))

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: prismaAdapterMock,
}))

vi.mock("@/lib/db", () => ({
  db: { mock: true },
}))

describe("auth module exports", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exports handlers, auth, signIn, signOut", async () => {
    const mod = await import("./auth")

    expect(mod.handlers).toBeDefined()
    expect(mod.auth).toBeDefined()
    expect(mod.signIn).toBeDefined()
    expect(mod.signOut).toBeDefined()
    expect(nextAuthMock).toHaveBeenCalledTimes(1)
    expect(prismaAdapterMock).toHaveBeenCalledTimes(1)
    expect(googleProviderMock).toHaveBeenCalledTimes(1)
  })
})

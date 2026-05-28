import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

const { config } = await import("./middleware")

describe("middleware config", () => {
  it("protects dashboard routes", () => {
    expect(config.matcher).toContain("/dashboard/:path*")
  })
})

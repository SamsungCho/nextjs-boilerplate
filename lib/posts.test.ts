import { describe, expect, it } from "vitest"
import { getPostBySlug } from "./posts"

describe("getPostBySlug", () => {
  it("returns the sample post for /posts/welcome", () => {
    const post = getPostBySlug("welcome")

    expect(post).not.toBeNull()
    expect(post?.slug).toBe("welcome")
    expect(post?.title).toBe("Welcome to the cafe")
  })

  it("returns null for unknown slugs", () => {
    expect(getPostBySlug("missing")).toBeNull()
  })
})

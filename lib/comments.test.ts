import { describe, expect, it } from "vitest"
import { MAX_COMMENT_LENGTH, validateCommentContent } from "./comments"

describe("validateCommentContent", () => {
  it("trims whitespace and accepts normal text", () => {
    const result = validateCommentContent("  first comment  ")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe("first comment")
    }
  })

  it("rejects empty content", () => {
    const result = validateCommentContent("   ")

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe("Please write a comment.")
    }
  })

  it("rejects content that is too long", () => {
    const result = validateCommentContent("a".repeat(MAX_COMMENT_LENGTH + 1))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe("Comments must be 300 characters or less.")
    }
  })
})

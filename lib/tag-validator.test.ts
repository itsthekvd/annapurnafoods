import { validateTag, validateTags } from "./tag-validator"

describe("Tag Validator", () => {
  describe("validateTag", () => {
    it("should validate tags within length limit", () => {
      const result = validateTag("short-tag")
      expect(result.valid).toBe(true)
    })

    it("should reject tags exceeding length limit", () => {
      const longTag = "this-tag-is-definitely-too-long-for-our-system"
      const result = validateTag(longTag)
      expect(result.valid).toBe(false)
      expect(result.message).toContain("Maximum length is 20")
    })

    it("should reject empty tags", () => {
      const result = validateTag("")
      expect(result.valid).toBe(false)
      expect(result.message).toContain("cannot be empty")
    })

    it("should respect custom max length", () => {
      const tag = "12345"
      const result = validateTag(tag, 3)
      expect(result.valid).toBe(false)
      expect(result.message).toContain("Maximum length is 3")
    })
  })

  describe("validateTags", () => {
    it("should validate all tags in array", () => {
      const tags = ["tag1", "tag2", "tag3"]
      const result = validateTags(tags)
      expect(result.valid).toBe(true)
      expect(result.invalidTags).toHaveLength(0)
    })

    it("should identify invalid tags in array", () => {
      const tags = ["good", "this-tag-is-way-too-long", "also-good"]
      const result = validateTags(tags)
      expect(result.valid).toBe(false)
      expect(result.invalidTags).toHaveLength(1)
      expect(result.invalidTags[0].tag).toBe("this-tag-is-way-too-long")
    })
  })
})

/**
 * Validates that a tag meets the required constraints
 * @param tag The tag to validate
 * @param maxLength Maximum allowed length (default: 20)
 * @returns Object containing validation result and error message if any
 */
export function validateTag(tag: string, maxLength = 20): { valid: boolean; message?: string } {
  // Check if tag is empty
  if (!tag || tag.trim() === "") {
    return { valid: false, message: "Tag cannot be empty" }
  }

  // Check tag length
  if (tag.length > maxLength) {
    return {
      valid: false,
      message: `Tag is too long. Maximum length is ${maxLength} characters.`,
    }
  }

  // Check for invalid characters (optional, uncomment if needed)
  // const validTagPattern = /^[a-zA-Z0-9_-]+$/
  // if (!validTagPattern.test(tag)) {
  //   return { valid: false, message: 'Tag can only contain letters, numbers, underscores and hyphens' }
  // }

  return { valid: true }
}

/**
 * Validates an array of tags against length constraints
 * @param tags Array of tags to validate
 * @param maxLength Maximum allowed length per tag (default: 20)
 * @returns Object containing validation result and error messages if any
 */
export function validateTags(
  tags: string[],
  maxLength = 20,
): {
  valid: boolean
  invalidTags: { tag: string; message: string }[]
} {
  const invalidTags: { tag: string; message: string }[] = []

  tags.forEach((tag) => {
    const result = validateTag(tag, maxLength)
    if (!result.valid && result.message) {
      invalidTags.push({ tag, message: result.message })
    }
  })

  return {
    valid: invalidTags.length === 0,
    invalidTags,
  }
}

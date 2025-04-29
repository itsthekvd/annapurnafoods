/**
 * Performs a comprehensive quality check on the website
 * This can be run in development to identify issues
 */
export async function performQualityCheck() {
  const issues: string[] = []

  // Check payment components
  try {
    const razorpayComponent = document.querySelector('[data-payment="razorpay"]')
    if (!razorpayComponent) {
      issues.push("Razorpay component not found")
    }

    const phonePeComponent = document.querySelector('[data-payment="phonepe"]')
    if (!phonePeComponent) {
      issues.push("PhonePe component not found")
    }
  } catch (e) {
    issues.push("Error checking payment components")
  }

  // Check pricing consistency
  try {
    const pricingElements = document.querySelectorAll("[data-price]")
    const uniquePrices = new Set()
    pricingElements.forEach((el) => {
      uniquePrices.add(el.getAttribute("data-price"))
    })

    if (uniquePrices.size > 1) {
      issues.push("Inconsistent pricing found across components")
    }
  } catch (e) {
    issues.push("Error checking pricing consistency")
  }

  // Check mobile responsiveness
  try {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport || !viewport.getAttribute("content")?.includes("width=device-width")) {
      issues.push("Viewport meta tag missing or incorrect")
    }
  } catch (e) {
    issues.push("Error checking mobile responsiveness")
  }

  // Check z-index issues
  try {
    const couponBadges = document.querySelectorAll(".coupon-badge")
    couponBadges.forEach((badge) => {
      const zIndex = window.getComputedStyle(badge).zIndex
      if (zIndex === "auto" || Number.parseInt(zIndex) < 10) {
        issues.push("Coupon badge has potential z-index issue")
      }
    })
  } catch (e) {
    issues.push("Error checking z-index issues")
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

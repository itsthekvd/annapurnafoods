// Environment variables and configuration
export const config = {
  // Razorpay production credentials
  razorpayKeyId: "rzp_live_LeOUqBxdd1ebGR",
  razorpaySecretKey: "OYgVPGNV21XaSyb9JSHtLFMx",

  // PhonePe production credentials
  phonePeMerchantId: "M22PQ541OTMQA",
  phonePeApiKey: "947211d1-2f0c-4251-a283-6c5e54dfa6c8",
  phonePeKeyIndex: "1",

  // Base URL for API calls - use custom domain
  apiBaseUrl: typeof window !== "undefined" ? window.location.origin : "https://annapurna.food",
}

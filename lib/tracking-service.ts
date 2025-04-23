// Simplified tracking service that does nothing but provides the expected interface
// This implementation is a no-op version that maintains the API but doesn't send any data

export interface UserSession {
  sessionId: string
  startTime: string
  events: any[]
  orders: any[]
}

export interface UserInfo {
  name?: string
  email?: string
  phone?: string
  lastActive: string
}

export interface TrackingEvent {
  eventId: string
  eventType: string
  timestamp: string
  data: any
}

export interface OrderInfo {
  orderId: string
  status: string
  createdAt: string
  updatedAt: string
  items: any[]
}

// Create a tracking service that maintains the API but doesn't send any data
class TrackingService {
  // Generate a random order ID
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }

  // All methods are no-ops that return dummy values
  trackEvent(eventType: string, data: any) {
    // No-op implementation
    return null
  }

  identifyUser(userInfo: { name?: string; email?: string; phone?: string }) {
    // No-op implementation
    return null
  }

  createOrder(items: any[]) {
    const orderId = this.generateOrderId()
    return orderId
  }

  updateOrder(orderId: string, orderData: any) {
    // No-op implementation
    return null
  }

  updateOrderStatus(orderId: string, status: string) {
    // No-op implementation
    return null
  }

  getCurrentActiveOrder() {
    return null
  }

  getAllOrders() {
    return []
  }

  trackPageView(url: string, title: string) {
    // No-op implementation
    return null
  }

  trackProductView(product: any) {
    // No-op implementation
    return null
  }

  trackAddToCart(product: any, quantity: number) {
    // No-op implementation
    return null
  }

  trackRemoveFromCart(product: any) {
    // No-op implementation
    return null
  }

  trackCheckoutStep(step: number, orderId: string, data: any) {
    // No-op implementation
    return null
  }

  trackOrderComplete(orderId: string, orderData: any) {
    // No-op implementation
    return null
  }

  trackExitPopupSubmission(formData: any) {
    // No-op implementation
    return null
  }

  debugWebhook(data: any) {
    // No-op implementation
    return null
  }
}

// Create a singleton instance
export const trackingService = new TrackingService()

// Export default for easier imports
export default trackingService

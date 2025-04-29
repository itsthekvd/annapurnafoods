export interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  price: number
  originalPrice?: number
  image: string
  isSubscription: boolean
}

export interface Testimonial {
  name: string
  title: string
  avatar: string
  quote: string
}

export interface CartItem {
  product: Product
  quantity: number
  subscriptionOption?: string
  subscriptionDays?: number
}

export interface SubscriptionOption {
  id: string
  name: string
  description: string
  durationInDays: number
  discountPercentage: number
}

export interface Coupon {
  code: string
  discount: number
  description: string
  type: "fixed" | "percentage" | "special"
  minOrderValue?: number
  maxDiscount?: number
  isActive: boolean
  isHidden?: boolean // Flag to hide coupon from UI
  specialAction?: string // For special coupon actions like "set_total_to_one"
}

export interface OrderData {
  id: string
  createdAt: string
  status: string
  customerInfo: {
    name: string
    email: string
    phone: string
    notes: string
    zipcode: string
    hasVoiceNote: boolean
  }
  locationInfo: {
    address: string
    lat: number
    lng: number
    mapUrl?: string
  }
  paymentInfo: {
    method: string
    transactionId?: string
    phonepeTransactionId?: string
    amount: number
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    subscriptionOption?: string
    subscriptionDays?: number
  }>
  deliveryDate?: string
  total: number
  mealType?: string
  planType?: string
  mealQuantity?: number
  deliveryFrequency?: string
  couponCode?: string
}

// Order status constants
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID_PENDING: "paid_pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
}

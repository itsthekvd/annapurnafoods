import type { Product, Testimonial, Coupon } from "./types"
import { getImageUrlWithFallback } from "./image-utils"

export const products: Product[] = [
  {
    id: "brunch",
    name: "Brunch",
    slug: "brunch",
    description:
      "3 Wheat Chapatis, 1 Sabji, One Plate Rice, Dal, Porial/Salad, Curd/Buttermilk, Chatni/Pickle, Special Health Juice. Brunch delivery at 8.30am",
    longDescription:
      "Start your day with our nutritious and fulfilling brunch. Each meal is freshly prepared with love and care by Isha Volunteers. Choose your preferred frequency and enjoy special health juices with every meal.",
    price: 350,
    image: getImageUrlWithFallback("brunch"),
    isSubscription: true,
  },
  {
    id: "dinner",
    name: "Dinner",
    slug: "dinner",
    description:
      "Masala Rice/Curd Rice/Khichadi, Dal, Porial, Salad, Kanji, Special Health Juice. Dinner delivery at 8.30pm",
    longDescription:
      "End your day with our nutritious and fulfilling dinner. Each meal is freshly prepared with love and care by Isha Volunteers. Choose your preferred frequency and enjoy special health juices with every meal.",
    price: 350,
    image: getImageUrlWithFallback("dinner"),
    isSubscription: true,
  },
]

export const specialProducts: Product[] = [
  {
    id: "lapshi",
    name: "Sweets: Lapshi",
    slug: "lapshi",
    description: "Traditional sweet dish made with broken wheat, milk, and jaggery.",
    price: 400,
    originalPrice: 600,
    image: getImageUrlWithFallback("lapshi"),
    isSubscription: false,
  },
  {
    id: "shira",
    name: "Sweets: Shira",
    slug: "shira",
    description: "Delicious semolina pudding with ghee, nuts, and jaggery.",
    price: 400,
    originalPrice: 600,
    image: getImageUrlWithFallback("shira"),
    isSubscription: false,
  },
  {
    id: "payasam",
    name: "Sweets: Payasam",
    slug: "payasam",
    description: "Traditional South Indian sweet pudding made with milk, rice, and jaggery.",
    price: 400,
    originalPrice: 600,
    image: getImageUrlWithFallback("payasam"),
    isSubscription: false,
  },
  {
    id: "puran-poli",
    name: "Sweets: (Puran Poli + Desi Ghee) X 2",
    slug: "puran-poli",
    description: "Sweet flatbread stuffed with a sweet lentil filling, served with ghee.",
    price: 400,
    originalPrice: 600,
    image: getImageUrlWithFallback("puran-poli"),
    isSubscription: false,
  },
]

export const testimonials: Testimonial[] = [
  {
    name: "Rajesh Kumar",
    title: "Isha Meditator",
    avatar: "/placeholder.svg?height=100&width=100",
    quote:
      "The food is just like what we get at the Isha Yoga Center. Pure Sattvik and so fulfilling. I feel energized after every meal.",
  },
  {
    name: "Priya Sharma",
    title: "Isha Volunteer",
    avatar: "/placeholder.svg?height=100&width=100",
    quote:
      "As a busy volunteer, I don't get time to cook. Annapurna Foods has been a blessing. The subscription plan is so convenient!",
  },
  {
    name: "Arun Patel",
    title: "Isha Meditator",
    avatar: "/placeholder.svg?height=100&width=100",
    quote:
      "The special health juices that come with the subscription are amazing. I can feel the difference in my energy levels.",
  },
]

// Subscription frequency options
export const subscriptionOptions = [
  {
    id: "one-time",
    name: "One-time Order",
    description: "Try it once",
    durationInDays: 1,
    discountPercentage: 0,
  },
  {
    id: "weekends",
    name: "Weekends Only",
    description: "Saturdays and Sundays",
    durationInDays: 8, // 4 weekends in a month
    discountPercentage: 1,
  },
  {
    id: "sundays",
    name: "Sundays Only",
    description: "Every Sunday",
    durationInDays: 4, // 4 Sundays in a month
    discountPercentage: 2,
  },
  {
    id: "monthly-1",
    name: "Daily - 1 Month",
    description: "Every day for 1 month",
    durationInDays: 30,
    discountPercentage: 3,
  },
  {
    id: "monthly-3",
    name: "Daily - 3 Months",
    description: "Every day for 3 months",
    durationInDays: 90,
    discountPercentage: 4,
  },
  {
    id: "monthly-6",
    name: "Daily - 6 Months",
    description: "Every day for 6 months",
    durationInDays: 180,
    discountPercentage: 5,
  },
  {
    id: "monthly-12",
    name: "Daily - 12 Months",
    description: "Every day for 12 months",
    durationInDays: 365,
    discountPercentage: 6,
  },
]

// Coupon code details
export const availableCoupons: Coupon[] = [
  {
    code: "ISHA2025",
    discount: 150, // ₹150 off per meal (350 -> 200)
    description: "Special discount for Isha meditators",
    type: "fixed",
    isActive: true,
    isHidden: false,
    appliesToSpecials: false, // Does not apply to special products
  },
  {
    code: "SATTVIKSPECIAL",
    discount: 250, // Reduces price to 150 for special products
    description: "Special discount for Sattvik Sweets",
    type: "special",
    isActive: true,
    isHidden: false,
    appliesToSpecials: true, // Applies to special products
    specialAction: "set_special_to_150",
  },
  {
    code: "ISHA2025_45%OFF",
    discount: 45, // 45% off
    description: "45% off on all orders",
    type: "percentage",
    minOrderValue: 0,
    maxDiscount: 1000, // Maximum discount of ₹1000
    isActive: true,
    isHidden: true, // This coupon is hidden from regular UI
  },
  {
    code: "HBZVEZb9qe5",
    discount: 0, // Special coupon that sets total to ₹1
    description: "Special testing coupon",
    type: "special",
    isActive: true,
    isHidden: true, // This coupon is hidden from regular UI
    specialAction: "set_total_to_one", // Special action identifier
  },
]

// Default promotional coupon
export const promotionalCoupon = availableCoupons[0]

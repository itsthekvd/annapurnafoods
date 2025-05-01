import type { Metadata } from "next"
import Hero from "@/components/home/hero"
import FeaturedProducts from "@/components/home/featured-products"
import ReviewsShowcase from "@/components/home/reviews-showcase"
import Story from "@/components/home/story"
import SpecialsSection from "@/components/home/specials-section"
import JuiceSection from "@/components/home/juice-section"
import CountdownTimer from "@/components/interactive/countdown-timer"
import LoyaltyRewards from "@/components/interactive/loyalty-rewards"
import Providers from "./providers"
import ImageShowcase from "@/components/home/image-showcase"
import SchemaMarkup from "@/components/schema-markup"
import { generatePageSchemas } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore near Isha Yoga Center",
  description:
    "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center.",
  openGraph: {
    title: "Annapurna Foods - Sattvik Home Cooked Food Delivery in Coimbatore",
    description:
      "Fresh, healthy home-cooked meals delivered daily near Isha Yoga Center. Subscribe for regular Sattvik food delivery in Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods - Sattvik Meals",
      },
    ],
  },
}

// Sample FAQ data for the home page
const homeFAQs = [
  {
    question: "What areas do you deliver to in Coimbatore?",
    answer:
      "We deliver to areas near Isha Yoga Center in Coimbatore, including Alandurai, Thondamuthur, Semmedu, and Velliangiri. Our delivery radius is approximately 15km from our kitchen.",
  },
  {
    question: "What type of food do you serve?",
    answer:
      "We serve fresh, home-cooked Sattvik meals prepared by Isha Volunteers. Our menu includes traditional Indian vegetarian dishes made with locally sourced ingredients.",
  },
  {
    question: "Do you offer subscription plans?",
    answer:
      "Yes, we offer daily, weekly, and monthly subscription plans for both brunch and dinner. Subscriptions provide convenience and discounted rates compared to one-time orders.",
  },
  {
    question: "What are your delivery hours?",
    answer:
      "We deliver brunch between 7:00 AM and 9:30 AM, and dinner between 7:00 PM and 9:30 PM. Delivery times may vary slightly based on your location and traffic conditions.",
  },
  {
    question: "How can I pay for my order?",
    answer:
      "We accept multiple payment methods including Cash on Delivery, UPI payments (PhonePe), and online payments through Razorpay (credit/debit cards).",
  },
]

// Sample reviews data
const homeReviews = [
  {
    author: "Rajesh Kumar",
    reviewBody:
      "The food is absolutely delicious and reminds me of home cooking. The delivery is always on time and the packaging is eco-friendly. Highly recommended!",
    reviewRating: 5,
  },
  {
    author: "Priya Sharma",
    reviewBody:
      "I've been subscribing to their dinner service for a month now. The food is consistently good and the portions are generous. Great value for money.",
    reviewRating: 4,
  },
  {
    author: "Arun Nair",
    reviewBody:
      "As someone who lives near Isha, this service has been a blessing. Fresh, sattvik food delivered right to my doorstep. The subscription option is very convenient.",
    reviewRating: 5,
  },
]

// Sample event data
const currentEvent = {
  name: "Navratri Special Menu",
  description:
    "Celebrate Navratri with our special festive menu featuring traditional sattvik dishes prepared without onion and garlic.",
  startDate: "2023-10-15T00:00:00+05:30",
  endDate: "2023-10-24T23:59:59+05:30",
  location: "Annapurna Foods Kitchen",
  image: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
}

export default function Home() {
  // Generate all schemas for the home page
  const homeSchemas = generatePageSchemas("home", {
    faqs: homeFAQs,
    reviews: homeReviews,
    event: currentEvent,
  })

  return (
    <>
      {/* Add schema markup directly in the page */}
      <SchemaMarkup schemas={homeSchemas} />

      <Providers>
        <main className="flex min-h-screen flex-col">
          <h1 className="sr-only">Annapurna Foods - Home Cooked Food Delivery near Isha Yoga Center Coimbatore</h1>
          <Hero />
          <div id="featured-products">
            <FeaturedProducts />
          </div>
          <ReviewsShowcase />
          <Story />
          <ImageShowcase />
          <SpecialsSection />
          <JuiceSection />
          <CountdownTimer />
          <LoyaltyRewards />
        </main>
      </Providers>
    </>
  )
}

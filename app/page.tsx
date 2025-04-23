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

export default function Home() {
  return (
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
  )
}

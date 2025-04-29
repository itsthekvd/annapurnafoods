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
import { getWebsiteSchema, getLocalBusinessSchema, getFAQSchema } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Annapurna Foods - Fresh Sattvik Meal Delivery in Coimbatore | Near Isha Yoga Center",
  description:
    "Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices. Serving areas near Isha Yoga Center.",
  openGraph: {
    title: "Annapurna Foods - Fresh Sattvik Meal Delivery in Coimbatore",
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
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annapurna Foods - Fresh Sattvik Meal Delivery in Coimbatore",
    description: "Fresh, healthy home-cooked meals delivered daily near Isha Yoga Center.",
    images: ["https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg"],
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebsiteSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getLocalBusinessSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFAQSchema()),
        }}
      />
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

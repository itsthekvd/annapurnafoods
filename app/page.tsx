import { Suspense } from "react"
import Hero from "@/components/home/hero"
import FeaturedProducts from "@/components/home/featured-products"
import Testimonials from "@/components/home/testimonials"
import SeoMetaTags from "@/components/meta/seo-meta-tags"
import Script from "next/script"

export default function HomePage() {
  // Local business schema for the homepage
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: "Annapurna Foods",
    image: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://annapurnafoods.com"}/#organization`,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://annapurnafoods.com",
    telephone: "+918300615054",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Isha Yoga Center",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641101",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "10.9760",
      longitude: "76.7490",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    servesCuisine: ["Sattvik", "South Indian", "Vegetarian"],
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SeoMetaTags
        title="Annapurna Foods - Fresh Sattvik Meals Delivery in Coimbatore"
        description="Order healthy, home-cooked Sattvik meals delivered fresh to your doorstep in Coimbatore. Daily brunch and dinner options with special health juices."
        keywords={[
          "Sattvik food delivery",
          "Healthy meal delivery Coimbatore",
          "Tiffin service Isha Yoga Center",
          "Home cooked food delivery",
          "Vegetarian food delivery",
          "Meal subscription",
          "Healthy tiffin service",
          "Daily food delivery",
        ]}
      />

      {/* Structured Data */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main>
        <Suspense fallback={<div>Loading hero...</div>}>
          <Hero />
        </Suspense>

        <Suspense fallback={<div>Loading featured products...</div>}>
          <FeaturedProducts />
        </Suspense>

        <Suspense fallback={<div>Loading testimonials...</div>}>
          <Testimonials />
        </Suspense>
      </main>
    </>
  )
}

import type { Metadata } from "next"
import CheckoutPageClient from "./checkout-page-client"
import SchemaMarkup from "@/components/schema-markup"
import { generatePageSchemas } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Checkout - Annapurna Foods | Home Meal Delivery in Coimbatore",
  description:
    "Complete your order for fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center Coimbatore.",
  openGraph: {
    title: "Checkout - Annapurna Foods Home Meal Delivery",
    description:
      "Complete your order for fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Checkout",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CheckoutPage() {
  // Generate checkout page schemas
  const checkoutSchemas = generatePageSchemas("checkout")

  return (
    <>
      <SchemaMarkup schemas={checkoutSchemas} />
      <CheckoutPageClient />
    </>
  )
}

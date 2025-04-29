import type { Metadata } from "next"
import CheckoutPageClient from "./checkout-page-client"
import { getBreadcrumbSchema } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Checkout - Annapurna Foods | Sattvik Meal Delivery in Coimbatore",
  description:
    "Complete your order for fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center Coimbatore.",
  openGraph: {
    title: "Checkout - Annapurna Foods Sattvik Meal Delivery",
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
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function CheckoutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", url: "https://annapurna.food" },
              { name: "Cart", url: "https://annapurna.food/cart" },
              { name: "Checkout", url: "https://annapurna.food/checkout" },
            ]),
          ),
        }}
      />
      <CheckoutPageClient />
    </>
  )
}

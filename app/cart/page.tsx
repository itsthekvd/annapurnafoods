import CartClientPage from "./CartClientPage"
import type { Metadata } from "next"
import { getBreadcrumbSchema } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Your Cart - Annapurna Foods | Sattvik Meal Delivery in Coimbatore",
  description:
    "Review your selected items and proceed to checkout. Fresh, home-cooked Sattvik meals delivered to your doorstep near Isha Yoga Center.",
  openGraph: {
    title: "Your Cart - Annapurna Foods | Sattvik Meal Delivery",
    description:
      "Review your selected items and proceed to checkout. Fresh, home-cooked Sattvik meals delivered to your doorstep.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods - Cart",
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

export default function CartPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", url: "https://annapurna.food" },
              { name: "Cart", url: "https://annapurna.food/cart" },
            ]),
          ),
        }}
      />
      <CartClientPage />
    </>
  )
}

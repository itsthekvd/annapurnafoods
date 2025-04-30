import type { Metadata } from "next"
import CartClientPage from "./CartClientPage"
import SchemaMarkup from "@/components/schema-markup"
import { generatePageSchemas } from "@/lib/schema-utils"

export const metadata: Metadata = {
  title: "Shopping Cart - Annapurna Foods | Home Meal Delivery in Coimbatore",
  description:
    "Review your order of fresh, home-cooked Sattvik meals before checkout. Healthy food delivery near Isha Yoga Center Coimbatore.",
  openGraph: {
    title: "Shopping Cart - Annapurna Foods Home Meal Delivery",
    description:
      "Review your order of fresh, home-cooked Sattvik meals before checkout. Healthy food delivery near Isha Yoga Center Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Cart",
      },
    ],
  },
}

export default function CartPage() {
  // Generate cart page schemas
  const cartSchemas = generatePageSchemas("cart")

  return (
    <>
      <SchemaMarkup schemas={cartSchemas} />
      <CartClientPage />
    </>
  )
}

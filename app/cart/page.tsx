import CartClientPage from "./CartClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Cart - Annapurna Foods | Home Food Delivery in Coimbatore",
  description:
    "Review your selected home-cooked Sattvik meals before checkout. Fresh food delivery near Isha Yoga Center Coimbatore.",
  openGraph: {
    title: "Your Cart - Annapurna Foods Home Food Delivery",
    description:
      "Review your selected home-cooked Sattvik meals before checkout. Fresh food delivery near Isha Yoga Center Coimbatore.",
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
  return <CartClientPage />
}

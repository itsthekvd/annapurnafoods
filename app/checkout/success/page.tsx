import type { Metadata } from "next"
import OrderSuccessClient from "./OrderSuccessClient"

export const metadata: Metadata = {
  title: "Order Confirmed - Annapurna Foods | Home Food Delivery in Coimbatore",
  description:
    "Your order for fresh, home-cooked Sattvik meals has been confirmed. Delivery near Isha Yoga Center Coimbatore.",
  openGraph: {
    title: "Order Confirmed - Annapurna Foods Home Food Delivery",
    description:
      "Your order for fresh, home-cooked Sattvik meals has been confirmed. Delivery near Isha Yoga Center Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Order Confirmation",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function OrderSuccessPage() {
  return <OrderSuccessClient />
}

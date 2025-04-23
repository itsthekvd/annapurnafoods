import type { Metadata } from "next"
import OrderTrackingClientPage from "./OrderTrackingClientPage"

export const metadata: Metadata = {
  title: "Track Your Order - Annapurna Foods | Home Food Delivery in Coimbatore",
  description:
    "Track your home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Real-time updates on your food order.",
  openGraph: {
    title: "Track Your Order - Annapurna Foods Home Food Delivery",
    description:
      "Track your home-cooked Sattvik meal delivery near Isha Yoga Center Coimbatore. Real-time updates on your food order.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Order Tracking",
      },
    ],
  },
}

export default function OrderTrackingPage() {
  return <OrderTrackingClientPage />
}

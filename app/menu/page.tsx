import type { Metadata } from "next"
import ProductGrid from "@/components/products/product-grid"
import { products, specialProducts } from "@/lib/data"

export const metadata: Metadata = {
  title: "Menu - Healthy Meal Delivery Services in Coimbatore | Annapurna Foods",
  description:
    "Browse our menu of fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore with subscription options.",
  openGraph: {
    title: "Healthy Meal Delivery Menu - Annapurna Foods Coimbatore",
    description:
      "Explore our menu of fresh, home-cooked Sattvik meals with daily delivery near Isha Yoga Center. Healthy food tiffin services in Coimbatore.",
    images: [
      {
        url: "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg",
        width: 1200,
        height: 630,
        alt: "Annapurna Foods Menu",
      },
    ],
  },
}

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Healthy Home Cooked Food Delivery Menu in Coimbatore</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Delicious, nutritious Sattvik meals prepared with love and care by Isha Volunteers. Daily meal delivery
          services near Isha Yoga Center Coimbatore.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-amber-700 mb-6">Daily Meals</h2>
        <ProductGrid products={products} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-amber-700 mb-6">Festival Specials</h2>
        <ProductGrid products={specialProducts} />
      </div>
    </div>
  )
}

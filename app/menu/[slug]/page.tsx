import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/products/product-detail"
import { products, specialProducts } from "@/lib/data"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = [...products, ...specialProducts].find((p) => p.slug === params.slug)

  if (!product) {
    return {
      title: "Product Not Found - Annapurna Foods",
    }
  }

  return {
    title: `${product.name} - Healthy Home Cooked Food Delivery near Isha Yoga Center Coimbatore`,
    description: `Order ${product.name} - ${product.description} Fresh home-cooked Sattvik food delivered in Coimbatore near Isha Yoga Center.`,
    openGraph: {
      title: `${product.name} - Healthy Meal Delivery in Coimbatore`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = [...products, ...specialProducts].find((p) => p.slug === params.slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <h1 className="sr-only">{product.name} - Home Cooked Food Delivery near Isha Yoga Center Coimbatore</h1>
      <ProductDetail product={product} />
    </>
  )
}

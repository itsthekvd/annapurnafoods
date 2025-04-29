import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/products/product-detail"
import { products, specialProducts } from "@/lib/data"
import { getProductSchema, getBreadcrumbSchema } from "@/lib/schema-utils"

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
      description: "The requested product could not be found on our menu.",
    }
  }

  return {
    title: `${product.name} - Healthy Sattvik Food Delivery | Annapurna Foods Coimbatore`,
    description: `Order ${product.name} - ${product.description.substring(0, 150)}... Fresh home-cooked Sattvik food delivered in Coimbatore near Isha Yoga Center.`,
    openGraph: {
      title: `${product.name} - Healthy Sattvik Meal Delivery in Coimbatore`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: "en_IN",
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Healthy Sattvik Meal Delivery`,
      description: product.description.substring(0, 200),
      images: [product.image],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getProductSchema(params.slug)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", url: "https://annapurna.food" },
              { name: "Menu", url: "https://annapurna.food/menu" },
              { name: product.name, url: `https://annapurna.food/menu/${product.slug}` },
            ]),
          ),
        }}
      />
      <h1 className="sr-only">{product.name} - Home Cooked Food Delivery near Isha Yoga Center Coimbatore</h1>
      <ProductDetail product={product} />
    </>
  )
}

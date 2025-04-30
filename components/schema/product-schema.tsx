import Script from "next/script"
import type { Product } from "@/lib/types"

interface ProductSchemaProps {
  product: Product
  url: string
}

export default function ProductSchema({ product, url }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://annapurnafoods.com"
  const fullUrl = `${baseUrl}${url}`

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.id,
    mpn: `ANNAPURNA-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Annapurna Foods",
    },
    offers: {
      "@type": "Offer",
      url: fullUrl,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Annapurna Foods",
      },
    },
    ...(product.category && { category: product.category }),
    ...(product.tags && { keywords: product.tags.join(", ") }),
  }

  return (
    <Script
      id={`product-schema-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

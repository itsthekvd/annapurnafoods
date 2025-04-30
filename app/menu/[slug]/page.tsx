import { Suspense } from "react"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/products/product-detail"
import { getProductBySlug } from "@/lib/data"
import ProductSchema from "@/components/schema/product-schema"
import BreadcrumbSchema from "@/components/schema/breadcrumb-schema"
import SeoMetaTags from "@/components/meta/seo-meta-tags"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  // Generate SEO keywords based on product data
  const keywords = [
    product.name,
    `${product.name} delivery`,
    "Sattvik food",
    "Healthy meal",
    product.category || "Food",
    "Vegetarian food",
    "Coimbatore food delivery",
    "Isha Yoga Center",
    ...(product.tags || []),
  ]

  return (
    <>
      {/* SEO Meta Tags */}
      <SeoMetaTags
        title={`${product.name} - Annapurna Foods | Fresh Sattvik Meals`}
        description={
          product.description ||
          `Order ${product.name} - fresh, home-cooked Sattvik meal delivered to your doorstep near Isha Yoga Center in Coimbatore.`
        }
        canonicalPath={`/menu/${params.slug}`}
        ogImage={product.image || "https://ucarecdn.com/f2132019-968c-4f1e-9bae-46ec7daa3d44/Brunchscaled.jpg"}
        ogType="product"
        keywords={keywords}
      />

      {/* Structured Data */}
      <ProductSchema product={product} url={`/menu/${params.slug}`} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Menu", url: "/menu" },
          { name: product.name, url: `/menu/${params.slug}` },
        ]}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetail product={product} />
      </Suspense>
    </>
  )
}

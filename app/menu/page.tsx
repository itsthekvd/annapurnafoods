import { Suspense } from "react"
import { products, specialProducts } from "@/lib/data"
import ProductGrid from "@/components/products/product-grid"
import BreadcrumbSchema from "@/components/schema/breadcrumb-schema"
import SeoMetaTags from "@/components/meta/seo-meta-tags"
import Script from "next/script"

export default function MenuPage() {
  // Use static products for initial render to ensure we always have an array
  const staticProducts = [...products, ...specialProducts]

  // Generate menu schema
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: staticProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://annapurnafoods.com"}/menu/${product.slug}`,
        image: product.image,
        description: product.description,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "INR",
        },
      },
    })),
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <SeoMetaTags
        title="Menu - Annapurna Foods | Fresh Sattvik Meals Delivery"
        description="Browse our menu of fresh, home-cooked Sattvik meals delivered daily near Isha Yoga Center. Healthy food tiffin services in Coimbatore with subscription options."
        canonicalPath="/menu"
        keywords={[
          "Sattvik food menu",
          "Vegetarian meal options",
          "Healthy food menu",
          "Tiffin service menu",
          "Daily meal options",
          "Food delivery menu",
          "Meal subscription plans",
        ]}
      />

      {/* Structured Data */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Menu", url: "/menu" },
        ]}
      />

      <Script
        id="menu-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>

        <Suspense fallback={<div>Loading products...</div>}>
          <ProductGrid products={staticProducts} />
        </Suspense>
      </div>
    </>
  )
}

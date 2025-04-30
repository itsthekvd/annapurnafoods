import { fetchProductsFromDB } from "@/lib/data"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use environment variables for the host instead of headers
    const host = process.env.NEXT_PUBLIC_SITE_URL || "annapurna.food"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"

    // Base URL of your website - using environment variables
    const BASE_URL = `${protocol}://${host}`

    // Current date for lastmod
    const date = new Date().toISOString()

    // Define static pages with their priorities and change frequencies
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/menu", priority: "0.9", changefreq: "daily" },
      { path: "/cart", priority: "0.7", changefreq: "weekly" },
      { path: "/checkout", priority: "0.6", changefreq: "monthly" },
      { path: "/checkout/success", priority: "0.5", changefreq: "monthly" },
      { path: "/order-tracking", priority: "0.6", changefreq: "monthly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
      { path: "/policies/refund-cancellation", priority: "0.4", changefreq: "monthly" },
      { path: "/policies/terms", priority: "0.4", changefreq: "monthly" },
      { path: "/policies/shipping", priority: "0.4", changefreq: "monthly" },
      { path: "/policies/privacy", priority: "0.4", changefreq: "monthly" },
    ]

    // Get all products for dynamic product pages
    const products = await fetchProductsFromDB()

    // Create sitemap entries for static pages
    const staticEntries = staticPages
      .map(
        ({ path, priority, changefreq }) => `
    <url>
      <loc>${BASE_URL}${path}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`,
      )
      .join("")

    // Create sitemap entries for dynamic product pages
    const productEntries = products
      .map(
        (product) => `
    <url>
      <loc>${BASE_URL}/menu/${product.slug}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
      <image:image>
        <image:loc>${product.image}</image:loc>
        <image:title>${product.name}</image:title>
        <image:caption>${product.description}</image:caption>
      </image:image>
    </url>`,
      )
      .join("")

    // Combine all entries
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Generated dynamically on ${new Date().toISOString()} -->
  ${staticEntries}
  ${productEntries}
</urlset>`

    // Return the sitemap XML with proper content type
    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return a basic sitemap with just the homepage in case of error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL || "https://annapurna.food"}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}

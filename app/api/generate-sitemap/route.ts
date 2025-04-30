import { NextResponse } from "next/server"
import { products, specialProducts } from "@/lib/data"

export async function GET() {
  try {
    // Use environment variables for the host
    const host = process.env.NEXT_PUBLIC_SITE_URL || "annapurna.food"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const BASE_URL = `${protocol}://${host}`

    // Current date for lastmod
    const date = new Date().toISOString()

    // Define static pages
    const staticPages = [
      { path: "/", priority: "1.0", changefreq: "daily" },
      { path: "/menu", priority: "0.9", changefreq: "daily" },
      { path: "/cart", priority: "0.7", changefreq: "weekly" },
      { path: "/checkout", priority: "0.6", changefreq: "monthly" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
    ]

    // Use hardcoded products for sitemap generation
    const allProducts = [...products, ...specialProducts]

    // Create sitemap entries
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

    const productEntries = allProducts
      .map(
        (product) => `
    <url>
      <loc>${BASE_URL}/menu/${product.slug}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`,
      )
      .join("")

    // Combine all entries
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${date} -->
  ${staticEntries}
  ${productEntries}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}

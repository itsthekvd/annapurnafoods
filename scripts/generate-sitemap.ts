import { writeFileSync } from "fs"
import { globby } from "globby"
import { fetchProductsFromDB } from "../lib/data"

async function generateSitemap() {
  // Base URL of your website
  const BASE_URL = "https://annapurnafoods.in"

  // Get all public pages from the app directory
  const pages = await globby([
    "app/**/page.tsx",
    "app/**/route.ts",
    "!app/admin*/**", // Exclude admin pages
    "!app/api/**", // Exclude API routes
    "!app/**/loading.tsx", // Exclude loading pages
    "!app/**/error.tsx", // Exclude error pages
    "!app/**/not-found.tsx", // Exclude not found pages
  ])

  // Get all products for dynamic product pages
  const products = await fetchProductsFromDB()

  // Current date for lastmod
  const date = new Date().toISOString()

  // Create sitemap entries for static pages
  const staticPages = pages
    .map((page) => {
      // Convert file path to URL path
      const route = page
        .replace("app", "")
        .replace("/page.tsx", "")
        .replace("/route.ts", "")
        .replace(/\/\[.*\]/g, "") // Remove dynamic route parameters

      // Skip certain routes
      if (route.includes("phonepe-callback") || route.includes("admin") || route.includes("api")) {
        return null
      }

      // Determine priority based on page importance
      let priority = "0.7"
      let changefreq = "weekly"

      if (route === "") {
        // Home page
        priority = "1.0"
        changefreq = "daily"
      } else if (route === "/menu") {
        priority = "0.9"
        changefreq = "daily"
      } else if (route === "/checkout") {
        priority = "0.6"
        changefreq = "monthly"
      } else if (route.includes("/policies/")) {
        priority = "0.4"
        changefreq = "monthly"
      }

      return `
    <url>
      <loc>${BASE_URL}${route || "/"}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`
    })
    .filter(Boolean) // Remove null entries

  // Create sitemap entries for dynamic product pages
  const productPages = products.map((product) => {
    return `
    <url>
      <loc>${BASE_URL}/menu/${product.slug}</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
  })

  // Combine all entries
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Generated on ${new Date().toISOString()} -->
  ${staticPages.join("")}
  ${productPages.join("")}
</urlset>`

  // Write sitemap to public directory
  writeFileSync("public/sitemap.xml", sitemap)
  console.log("Sitemap generated successfully!")
}

// Run the function
generateSitemap().catch(console.error)

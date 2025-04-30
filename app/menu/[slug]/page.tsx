import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/products/product-detail"
import { getProductBySlug } from "@/lib/data"
import SchemaMarkup from "@/components/schema-markup"
import { generatePageSchemas } from "@/lib/schema-utils"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

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

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  // Sample recipe data for this product
  const sampleRecipe = {
    name: product.name,
    description: product.description,
    image: product.image,
    prepTime: "PT30M",
    cookTime: "PT45M",
    totalTime: "PT1H15M",
    recipeYield: "2 servings",
    recipeIngredient: [
      "Fresh organic vegetables",
      "Organic basmati rice",
      "Traditional South Indian spices",
      "Cold-pressed sesame oil",
      "Himalayan pink salt",
      "Fresh curry leaves",
      "Organic turmeric",
      "Freshly ground black pepper",
    ],
    recipeInstructions: [
      "Wash and prepare all fresh ingredients",
      "Cook organic rice to perfect fluffiness",
      "Prepare the vegetables with traditional spices and methods",
      "Combine all ingredients in the traditional way",
      "Garnish with fresh herbs and serve hot",
    ],
    keywords: `Sattvik food, ${product.name}, healthy meal, vegetarian food, Coimbatore food delivery, Isha Yoga Center, organic ingredients`,
    recipeCategory: product.category || "Main Course",
    recipeCuisine: "South Indian Sattvik",
    nutrition: {
      calories: "350 calories",
      fatContent: "10 g",
      saturatedFatContent: "2 g",
      cholesterolContent: "0 mg",
      sodiumContent: "300 mg",
      carbohydrateContent: "50 g",
      fiberContent: "8 g",
      sugarContent: "5 g",
      proteinContent: "15 g",
    },
  }

  // Generate product page schemas
  const productSchemas = generatePageSchemas("product", {
    product: product,
    recipe: sampleRecipe,
  })

  return (
    <>
      <SchemaMarkup schemas={productSchemas} />
      <h1 className="sr-only">{product.name} - Home Cooked Food Delivery near Isha Yoga Center Coimbatore</h1>
      <ProductDetail product={product} />
    </>
  )
}

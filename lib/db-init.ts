import { getSupabaseServiceClient } from "./supabase-client"
import { products, specialProducts } from "./data"

export async function initializeDatabase() {
  try {
    const supabase = getSupabaseServiceClient()

    // Check if products table exists
    const { error: checkError } = await supabase.from("products").select("id").limit(1).single()

    // If there's an error, the table might not exist
    if (checkError && checkError.code === "PGRST116") {
      console.log("Products table doesn't exist, creating it...")

      // Create the products table using SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price NUMERIC NOT NULL,
          original_price NUMERIC,
          description TEXT,
          long_description TEXT,
          image TEXT,
          is_subscription BOOLEAN DEFAULT false,
          slug TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      try {
        // Try to execute the SQL directly
        await supabase.rpc("exec_sql", { sql: createTableSQL })
      } catch (sqlError) {
        console.error("Error creating products table:", sqlError)
        // Continue anyway - the table might already exist
      }

      // Seed the table with initial data
      console.log("Seeding products table with initial data...")
      const allDefaultProducts = [...products, ...specialProducts]

      for (const product of allDefaultProducts) {
        await supabase.from("products").upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.originalPrice || product.price,
          description: product.description,
          long_description: product.longDescription || product.description,
          image: product.image,
          is_subscription: product.isSubscription || false,
          slug: product.slug,
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}

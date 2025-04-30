import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a singleton client for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null

// Create a singleton client for server-side usage with service role
let serviceClientInstance: ReturnType<typeof createClient> | null = null

// Get the client-side Supabase client
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing")
    throw new Error("Supabase URL or Anon Key is missing")
  }

  if (clientInstance) return clientInstance

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: "public",
    },
  })

  return clientInstance
}

// Get the server-side Supabase client with service role
export function getSupabaseServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Key is missing")
    console.log("Falling back to anon key")
    return getSupabaseClient() // Fallback to anon key if service key is missing
  }

  if (serviceClientInstance) return serviceClientInstance

  serviceClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  })

  return serviceClientInstance
}

// Debug function to check if Supabase is properly configured
export function checkSupabaseConfig() {
  console.log("Supabase URL:", supabaseUrl ? "Set" : "Missing")
  console.log("Supabase Anon Key:", supabaseAnonKey ? "Set" : "Missing")
  console.log("Supabase Service Key:", supabaseServiceKey ? "Set" : "Missing")

  try {
    const client = getSupabaseClient()
    console.log("Supabase Client:", client ? "Created" : "Failed")

    const serviceClient = getSupabaseServiceClient()
    console.log("Supabase Service Client:", serviceClient ? "Created" : "Failed")

    return true
  } catch (error) {
    console.error("Error checking Supabase config:", error)
    return false
  }
}

// Helper function to create tables if they don't exist
export async function ensureTablesExist() {
  try {
    const supabase = getSupabaseServiceClient()

    // Check if products table exists
    const { data: productsExist, error: productsError } = await supabase
      .from("products")
      .select("id")
      .limit(1)
      .maybeSingle()

    // Check if coupons table exists
    const { data: couponsExist, error: couponsError } = await supabase
      .from("coupons")
      .select("id")
      .limit(1)
      .maybeSingle()

    // Create tables if they don't exist
    if (productsError || !productsExist) {
      await createProductsTable(supabase)
    }

    if (couponsError || !couponsExist) {
      await createCouponsTable(supabase)
    }

    return true
  } catch (error) {
    console.error("Error ensuring tables exist:", error)
    return false
  }
}

// Create products table
async function createProductsTable(supabase: ReturnType<typeof createClient>) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      description TEXT,
      image TEXT,
      is_subscription BOOLEAN DEFAULT false,
      slug TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc("exec_sql", { sql: createTableSQL })
    return true
  } catch (error) {
    console.error("Error creating products table:", error)
    return false
  }
}

// Create coupons table
async function createCouponsTable(supabase: ReturnType<typeof createClient>) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.coupons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      discount NUMERIC NOT NULL,
      min_order_value NUMERIC DEFAULT 0,
      max_discount NUMERIC,
      "isActive" BOOLEAN DEFAULT true,
      "isHidden" BOOLEAN DEFAULT false,
      "specialAction" TEXT
    );
  `

  try {
    await supabase.rpc("exec_sql", { sql: createTableSQL })
    return true
  } catch (error) {
    console.error("Error creating coupons table:", error)
    return false
  }
}

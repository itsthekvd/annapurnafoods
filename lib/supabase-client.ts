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
    console.error("Error creating Supabase client:", error)
    return false
  }
}

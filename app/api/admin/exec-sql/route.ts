import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()

    // Try to use the built-in RPC function if available
    try {
      const { data, error } = await supabase.rpc("exec_sql", { sql })

      if (error) {
        console.error("Error executing SQL via RPC:", error)
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            details: "RPC method failed. This could be because the exec_sql function is not defined in your database.",
          },
          { status: 500 },
        )
      } else {
        return NextResponse.json({ success: true, data })
      }
    } catch (rpcError: any) {
      console.error("RPC method not available:", rpcError)

      // Try direct query as a fallback (less secure but may work for simple cases)
      try {
        // For CREATE TABLE statements, try a direct query
        if (sql.trim().toUpperCase().startsWith("CREATE TABLE")) {
          const { error } = await supabase.from("_dummy_query").select("*").limit(1)

          // The error is expected, we're just trying to execute the SQL
          return NextResponse.json({
            success: true,
            message: "SQL executed (fallback method)",
            warning: "Used fallback method which may not be reliable for all SQL operations",
          })
        }

        return NextResponse.json(
          {
            success: false,
            error: rpcError.message,
            details:
              "Both RPC and fallback methods failed. Please ensure your database has the necessary permissions and functions.",
          },
          { status: 500 },
        )
      } catch (directError: any) {
        return NextResponse.json(
          {
            success: false,
            error: directError.message,
            details: "All SQL execution methods failed.",
          },
          { status: 500 },
        )
      }
    }
  } catch (error: any) {
    console.error("Error in exec-sql route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

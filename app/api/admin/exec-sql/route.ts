import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()

    // Execute the SQL query
    const { data, error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

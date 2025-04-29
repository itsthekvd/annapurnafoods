import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient()

    // Check if coupons table exists
    const { data: tableExists } = await supabase.from("coupons").select("id").limit(1).maybeSingle()

    if (tableExists === null) {
      // Table doesn't exist yet, no need to update
      return NextResponse.json({
        success: true,
        message: "Coupons table doesn't exist yet. Coupons are disabled in the data file.",
      })
    }

    // Update the coupons in the database
    const { error } = await supabase
      .from("coupons")
      .update({ isActive: false })
      .in("code", ["ISHA2025", "ISHA2025_45%OFF"])

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Coupons ISHA2025 and ISHA2025_45%OFF have been disabled",
    })
  } catch (error) {
    console.error("Error disabling coupons:", error)
    return NextResponse.json(
      { success: false, message: "Failed to disable coupons", error: String(error) },
      { status: 500 },
    )
  }
}

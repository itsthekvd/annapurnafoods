"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { availableCoupons } from "@/lib/data"
import type { Coupon } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<(Coupon & { id?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoupons() {
      try {
        setLoading(true)
        setError(null)

        const supabase = getSupabaseClient()

        // First, check if the coupons table exists
        const { data: tableExists, error: tableCheckError } = await supabase
          .from("coupons")
          .select("count(*)")
          .limit(1)
          .single()

        if (tableCheckError && tableCheckError.code !== "PGRST116") {
          // If error is not "relation does not exist", then it's a different error
          throw tableCheckError
        }

        // If table doesn't exist or is empty, create it and populate with initial data
        if (!tableExists || tableCheckError) {
          await createAndPopulateCouponsTable()
        }

        // Now fetch all coupons
        const { data, error: fetchError } = await supabase.from("coupons").select("*").order("code")

        if (fetchError) throw fetchError

        setCoupons(data || [])
      } catch (err) {
        console.error("Error fetching coupons:", err)
        setError("Failed to load coupons. Please try again.")

        // Fallback to static data
        setCoupons(
          availableCoupons.map((coupon) => ({
            ...coupon,
            id: coupon.code,
          })),
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  async function createAndPopulateCouponsTable() {
    const supabase = getSupabaseClient()

    try {
      // Create the coupons table
      const { error: createError } = await supabase.rpc("create_coupons_table")

      if (createError) {
        console.error("Error creating coupons table:", createError)

        // Try direct SQL if RPC fails
        const { error: sqlError } = await supabase.from("coupons").insert([])
        if (sqlError && !sqlError.message.includes("already exists")) {
          throw sqlError
        }
      }

      // Populate with initial data
      const couponsWithIds = availableCoupons.map((coupon) => ({
        ...coupon,
        id: coupon.code,
      }))

      const { error: insertError } = await supabase.from("coupons").upsert(couponsWithIds, { onConflict: "id" })

      if (insertError) throw insertError

      return true
    } catch (error) {
      console.error("Error setting up coupons table:", error)
      throw error
    }
  }

  async function toggleCouponStatus(coupon: Coupon & { id?: string }) {
    if (!coupon.id) return

    setUpdating(coupon.id)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()
      const newStatus = !coupon.isActive

      // Update in database
      const { error: dbError } = await supabase.from("coupons").update({ isActive: newStatus }).eq("id", coupon.id)

      if (dbError) throw dbError

      // Update in memory
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c)))

      // Show success message
      setSuccess(`Coupon ${coupon.code} ${newStatus ? "enabled" : "disabled"} successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error updating coupon status:", error)
      setError(`Failed to update coupon status. Please try again.`)
    } finally {
      setUpdating(null)
    }
  }

  function renderCouponEffect(coupon: Coupon) {
    if (coupon.type === "fixed") {
      return `₹${coupon.discount} off on total order`
    } else if (coupon.type === "percentage") {
      return `${coupon.discount}% off${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}`
    } else if (coupon.type === "special" && coupon.specialAction === "set_total_to_one") {
      return "Sets total order amount to ₹1 (testing only)"
    }
    return "Unknown effect"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">Coupon Management</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Coupon Details</th>
                  <th className="text-left py-3 px-4">Effect</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{coupon.code}</div>
                      <div className="text-sm text-gray-500">{coupon.description}</div>
                      {coupon.isHidden && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Hidden
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{renderCouponEffect(coupon)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => toggleCouponStatus(coupon)}
                          disabled={updating === coupon.id}
                        />
                        <span>{coupon.isActive ? "Active" : "Inactive"}</span>
                        {updating === coupon.id && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No coupons found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Changes to coupon status will take effect immediately across the website.</p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/supabase-js"
import { availableCoupons } from "@/lib/data"
import type { Coupon } from "@/lib/types"

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<(Coupon & { id?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCoupons() {
      try {
        // Check if coupons table exists
        const { data: tableExists } = await supabase.from("coupons").select("id").limit(1).maybeSingle()

        if (tableExists !== null) {
          // Table exists, fetch coupons
          const { data, error } = await supabase.from("coupons").select("*")
          if (error) throw error
          setCoupons(data || [])
        } else {
          // Initialize with data from availableCoupons
          const initialCoupons = await initializeCouponsTable()
          setCoupons(initialCoupons || [])
        }
      } catch (error) {
        console.error("Error fetching coupons:", error)
        // Fallback to static data if database fails
        setCoupons(availableCoupons)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [supabase])

  async function initializeCouponsTable() {
    try {
      // Create coupons table
      await supabase.rpc("create_coupons_table_if_not_exists")

      // Insert initial coupons
      const couponsWithIds = availableCoupons.map((coupon) => ({
        ...coupon,
        id: crypto.randomUUID(),
      }))

      const { data, error } = await supabase.from("coupons").insert(couponsWithIds).select()
      if (error) throw error
      return data
    } catch (error) {
      console.error("Error initializing coupons table:", error)
      return availableCoupons.map((coupon) => ({
        ...coupon,
        id: crypto.randomUUID(),
      }))
    }
  }

  async function toggleCouponStatus(coupon: Coupon & { id?: string }) {
    if (!coupon.id) return

    setUpdating(coupon.id)
    try {
      const newStatus = !coupon.isActive
      const { error } = await supabase.from("coupons").update({ isActive: newStatus }).eq("id", coupon.id)

      if (error) throw error

      // Update local state
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c)))
    } catch (error) {
      console.error("Error updating coupon status:", error)
      // Fallback to local state update if database fails
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c)))
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
    </div>
  )
}

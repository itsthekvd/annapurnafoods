"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Database } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { products, specialProducts } from "@/lib/data"

export default function DatabaseSetupPage() {
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [isTableCreated, setIsTableCreated] = useState(false)
  const [isSeedingData, setIsSeedingData] = useState(false)
  const [isDataSeeded, setIsDataSeeded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProductsTable = async () => {
    try {
      setIsCreatingTable(true)
      setError(null)

      const supabase = getSupabaseClient()

      // Create the products table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS products (
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

      // Execute the SQL directly
      const { error } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (error) {
        throw new Error(`Failed to create products table: ${error.message}`)
      }

      setIsTableCreated(true)
    } catch (err: any) {
      console.error("Error creating products table:", err)
      setError(err.message || "Failed to create products table")
    } finally {
      setIsCreatingTable(false)
    }
  }

  const seedProductsData = async () => {
    try {
      setIsSeedingData(true)
      setError(null)

      const supabase = getSupabaseClient()
      const allDefaultProducts = [...products, ...specialProducts]

      // Seed the table with initial data
      for (const product of allDefaultProducts) {
        const { error } = await supabase.from("products").upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.originalPrice || null,
          description: product.description,
          long_description: product.longDescription || product.description,
          image: product.image,
          is_subscription: product.isSubscription || false,
          slug: product.slug,
        })

        if (error) {
          throw new Error(`Failed to seed product ${product.id}: ${error.message}`)
        }
      }

      setIsDataSeeded(true)
    } catch (err: any) {
      console.error("Error seeding products data:", err)
      setError(err.message || "Failed to seed products data")
    } finally {
      setIsSeedingData(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Database Setup</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Products Table</CardTitle>
            <CardDescription>Create the products table in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              This will create the products table if it doesn't already exist. This is required for product management
              functionality.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={createProductsTable} disabled={isCreatingTable || isTableCreated} className="w-full">
              {isCreatingTable ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Table...
                </>
              ) : isTableCreated ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Table Created
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Create Products Table
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seed Products Data</CardTitle>
            <CardDescription>Populate the products table with initial data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              This will add the default products to the database. You should create the table first before seeding data.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={seedProductsData}
              disabled={isSeedingData || isDataSeeded || !isTableCreated}
              className="w-full"
            >
              {isSeedingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : isDataSeeded ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Data Seeded
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Products Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

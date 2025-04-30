"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import type { Product } from "@/lib/types"
import ProductImageGallery from "./product-image-gallery"
import CookingInstructions from "./cooking-instructions"
import DeliveryInstructions from "@/components/delivery/delivery-instructions"
import { cn } from "@/lib/utils"

interface ProductDetailProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

export default function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }

  const handleAddToCart = () => {
    const productToAdd = selectedSize ? { ...product, price: selectedSize.price, size: selectedSize.name } : product
    onAddToCart(productToAdd, quantity)
  }

  // Define cooking steps based on product type
  const getCookingSteps = () => {
    switch (product.category?.toLowerCase()) {
      case "sweets":
        return [
          { name: "Storage", text: "Store in a cool, dry place away from direct sunlight." },
          { name: "Serving", text: "Best enjoyed at room temperature." },
        ]
      case "snacks":
        return [
          { name: "Preparation", text: "No preparation needed, ready to eat." },
          { name: "Storage", text: "Keep in an airtight container after opening." },
        ]
      case "juices":
        return [
          { name: "Serving", text: "Shake well before serving. Serve chilled." },
          { name: "Storage", text: "Refrigerate after opening and consume within 24 hours." },
        ]
      default:
        return [
          { name: "Preparation", text: "Follow package instructions for best results." },
          { name: "Storage", text: "Store appropriately based on product type." },
        ]
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          {product.images && product.images.length > 0 ? (
            <ProductImageGallery images={product.images} alt={product.name} />
          ) : (
            <div className="relative h-96 w-full bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg?height=400&width=400&query=food"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4">
            {selectedSize ? (
              <p className="text-2xl font-bold">₹{selectedSize.price.toFixed(2)}</p>
            ) : (
              <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
            )}

            {product.originalPrice && <p className="text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</p>}
          </div>

          <div className="mb-6">
            <p>{product.description}</p>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Size Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={cn(
                      "px-4 py-2 border rounded-md",
                      selectedSize?.name === size.name ? "border-amber-500 bg-amber-50" : "border-gray-300",
                    )}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.name} - ₹{size.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="w-24">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition"
            >
              Add to Cart
            </button>
          </div>

          {/* Add the cooking instructions component */}
          <CookingInstructions
            productName={product.name}
            productType={product.category || "food"}
            steps={getCookingSteps()}
          />

          {/* Add the delivery instructions component */}
          <DeliveryInstructions productName={product.name} />
        </div>
      </div>
    </div>
  )
}

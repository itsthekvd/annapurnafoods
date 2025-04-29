"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

// Navigation items
const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Order Tracking", href: "/order-tracking" },
  { name: "Contact Us", href: "/contact" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount: cartItemCount } = useCart()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Memoize the logo component
  const Logo = useMemo(
    () => (
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="https://ucarecdn.com/e051d6ff-3dca-435c-a9f6-7dc8c44564a1/annapurnafoodsbrandlogo.png"
          alt="Annapurna Foods Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-xl font-bold text-amber-700">Annapurna Foods</span>
      </Link>
    ),
    [],
  )

  // Memoize the cart button
  const CartButton = useMemo(
    () => (
      <Link href="/cart">
        <Button variant="outline" size="icon" aria-label="Shopping Cart" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Button>
      </Link>
    ),
    [cartItemCount],
  )

  // Memoize the menu button
  const MenuButton = useMemo(
    () => (
      <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    ),
    [isMenuOpen, toggleMenu],
  )

  // Render navigation items
  const renderNavItems = useCallback(
    (mobile = false) =>
      NAV_ITEMS.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            mobile
              ? "block py-2 text-base font-medium transition-colors hover:text-amber-700"
              : "text-sm font-medium transition-colors hover:text-amber-700",
            pathname === item.href ? "text-amber-700" : "text-gray-600",
          )}
          onClick={mobile ? closeMenu : undefined}
        >
          {item.name}
        </Link>
      )),
    [pathname, closeMenu],
  )

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {Logo}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">{renderNavItems()}</nav>

        <div className="hidden md:flex items-center space-x-4">
          {CartButton}
          <Link href="/menu">
            <Button className="bg-amber-700 hover:bg-amber-800">Check Out Menu</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          {CartButton}
          {MenuButton}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {renderNavItems(true)}
            <Link href="/menu" onClick={closeMenu}>
              <Button className="w-full bg-amber-700 hover:bg-amber-800 mt-2">Check Out Menu</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

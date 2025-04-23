import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the path starts with /admin-secure-dashboard-a7x9z2p5
  if (request.nextUrl.pathname.startsWith("/admin-secure-dashboard-a7x9z2p5")) {
    // For this route, we'll use client-side authentication
    // The middleware will allow access, but the page components will check authentication
    return NextResponse.next()
  }

  // Redirect old admin routes to the new secure route
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/admin-dashboard-secure")) {
    return NextResponse.redirect(new URL("/admin-secure-dashboard-a7x9z2p5", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin-dashboard-secure/:path*", "/admin-secure-dashboard-a7x9z2p5/:path*"],
}

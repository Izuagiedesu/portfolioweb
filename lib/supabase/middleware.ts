import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // For now, we'll use a simple session check
  // In a real app, you'd validate JWT tokens or session cookies
  const authCookie = request.cookies.get("auth-token")
  const isAuthenticated = !!authCookie

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin/dashboard") && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

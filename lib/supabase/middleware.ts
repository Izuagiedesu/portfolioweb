import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // For middleware, we'll check auth differently since we can't use cookies easily
  const authHeader = request.headers.get("authorization")
  let isAuthenticated = false

  if (authHeader) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))
      isAuthenticated = !!user
    } catch (error) {
      isAuthenticated = false
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin/dashboard") && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

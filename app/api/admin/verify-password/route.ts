import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Password verification API called for:", email)

    if (!email || !password) {
      return NextResponse.json({ valid: false, error: "Email and password required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get admin from database
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("password_hash")
      .eq("email", email)
      .single()

    console.log("[v0] Admin data retrieved:", { adminData: !!adminData, adminError })

    if (adminError || !adminData) {
      console.log("[v0] Admin not found")
      return NextResponse.json({ valid: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Compare password with hash
    const isValid = await bcrypt.compare(password, adminData.password_hash)
    console.log("[v0] Password comparison result:", isValid)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("[v0] Password verification error:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}

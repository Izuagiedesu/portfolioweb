import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 })
    }

    console.log("[v0] Verifying admin password against database...")
    const isValid = await verifyAdminPassword(password)

    if (isValid) {
      console.log("[v0] Database authentication successful")
      return NextResponse.json({ success: true })
    } else {
      console.log("[v0] Database authentication failed")
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Admin auth API error:", error)
    return NextResponse.json({ success: false, error: "Authentication error" }, { status: 500 })
  }
}

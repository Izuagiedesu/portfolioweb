import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get the admin user from database
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("username", "admin")
      .single()

    if (error || !adminUser) {
      console.error("[v0] Admin user not found:", error)
      return false
    }

    // Compare the provided password with the stored hash
    const isValid = await bcrypt.compare(password, adminUser.password_hash)
    console.log("[v0] Password verification result:", isValid)

    return isValid
  } catch (error) {
    console.error("[v0] Error verifying admin password:", error)
    return false
  }
}

export async function createAdminSession() {
  return {
    id: "admin",
    authenticated: true,
    loginTime: new Date().toISOString(),
  }
}

import { createClient } from "@supabase/supabase-js"

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    console.log("[v0] Starting admin password verification...")

    // Create Supabase client using service role key for admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("username", "admin")
      .single()

    if (error || !adminUser) {
      console.error("[v0] Admin user not found in database:", error)
      return false
    }

    console.log("[v0] Admin user found, verifying password...")
    console.log("[v0] Stored password:", adminUser.password_hash)
    console.log("[v0] Input password:", password)

    const isValid = password === adminUser.password_hash

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

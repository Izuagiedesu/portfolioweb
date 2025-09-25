import { createSupabaseClient } from "@/lib/supabase/client"

export interface AdminSession {
  email: string
  loginTime: string
}

export const getAdminSession = async (): Promise<AdminSession | null> => {
  try {
    const supabase = createSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      email: user.email || "",
      loginTime: user.created_at || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export const clearAdminSession = async (): Promise<void> => {
  try {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

export const isAdminAuthenticated = async (): Promise<boolean> => {
  try {
    const supabase = createSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return !error && !!user
  } catch {
    return false
  }
}

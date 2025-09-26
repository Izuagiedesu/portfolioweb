"use client"

export interface AdminSession {
  id: string
  username: string
  authenticated: boolean
  loginTime: string
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null

  try {
    const session = localStorage.getItem("adminSession")
    if (!session) return null

    const parsed = JSON.parse(session)

    // Check if session is still valid (24 hours)
    const loginTime = new Date(parsed.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      localStorage.removeItem("adminSession")
      return null
    }

    if (!parsed.authenticated) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminSession")
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null
}

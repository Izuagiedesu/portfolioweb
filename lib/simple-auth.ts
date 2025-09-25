const ADMIN_CREDENTIALS = {
  email: "admin@bowenuniversity.edu.ng",
  password: "dss2025",
}

export interface AuthUser {
  email: string
  name: string
}

export const simpleAuth = {
  // Login function
  login: async (email: string, password: string): Promise<{ user?: AuthUser; error?: string }> => {
    // Simple credential check
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const user: AuthUser = {
        email: email,
        name: "DSS Administrator",
      }

      // Store in localStorage for session management
      if (typeof window !== "undefined") {
        localStorage.setItem("auth-user", JSON.stringify(user))
        localStorage.setItem("auth-token", "simple-auth-token")
      }

      return { user }
    }

    return { error: "Invalid email or password" }
  },

  // Logout function
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-user")
      localStorage.removeItem("auth-token")
    }
  },

  // Get current user
  getCurrentUser: (): AuthUser | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("auth-user")
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("auth-token")
    }
    return false
  },
}

interface SupabaseClient {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ data: any; error: any }>
    signOut: () => Promise<{ error: any }>
    getUser: () => Promise<{ data: { user: any } | null; error: any }>
  }
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: any[]; error: any }>
    insert: (data: any) => Promise<{ data: any; error: any }>
    update: (data: any) => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
    delete: () => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
  }
}

export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${supabaseUrl}/rest/v1${endpoint}`, {
      ...options,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...options.headers,
      },
    })

    if (!response.ok) {
      return { data: null, error: { message: response.statusText } }
    }

    const data = await response.json()
    return { data, error: null }
  }

  return {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          return { data: null, error: { message: "Invalid credentials" } }
        }

        const data = await response.json()
        return { data, error: null }
      },

      signUp: async ({ email, password, options }) => {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          return { data: null, error: { message: "Signup failed" } }
        }

        const data = await response.json()
        return { data, error: null }
      },

      signOut: async () => {
        return { error: null }
      },

      getUser: async () => {
        return { data: { user: null }, error: null }
      },
    },

    from: (table: string) => ({
      select: async (columns = "*") => {
        return makeRequest(`/${table}?select=${columns}`)
      },

      insert: async (data: any) => {
        return makeRequest(`/${table}`, {
          method: "POST",
          body: JSON.stringify(data),
        })
      },

      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          return makeRequest(`/${table}?${column}=eq.${value}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          })
        },
      }),

      delete: () => ({
        eq: async (column: string, value: any) => {
          return makeRequest(`/${table}?${column}=eq.${value}`, {
            method: "DELETE",
          })
        },
      }),
    }),
  }
}

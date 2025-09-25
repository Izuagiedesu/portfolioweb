interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: any[]; error: any }>
    insert: (data: any) => Promise<{ data: any; error: any }>
    update: (data: any) => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
    delete: () => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
  }
}

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      console.log("[v0] Making request to:", `${supabaseUrl}/rest/v1${endpoint}`)

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

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Error response:", errorText)
        return { data: null, error: { message: `${response.status}: ${errorText}` } }
      }

      const data = await response.json()
      console.log("[v0] Success response:", data)
      return { data, error: null }
    } catch (error) {
      console.log("[v0] Network error:", error)
      return { data: null, error: { message: `Network error: ${error}` } }
    }
  }

  return {
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

export const createSupabaseClient = createClient

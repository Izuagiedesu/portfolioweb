export function createSupabaseServerClient() {
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

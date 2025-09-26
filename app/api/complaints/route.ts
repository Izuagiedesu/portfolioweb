import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const category = searchParams.get("category")

    console.log(`[v0] API: Fetching complaints - page ${page}, limit ${limit}, category: ${category || "all"}`)

    // Create Supabase client using service role key for admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("[v0] API: Supabase client created successfully")

    // Build query with pagination and optional category filter
    let query = supabase
      .from("complaints")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("[v0] API: Error fetching complaints:", error)
      return NextResponse.json({ error: "Failed to fetch complaints", details: error.message }, { status: 500 })
    }

    console.log(
      `[v0] API: Successfully fetched ${data?.length || 0} complaints (page ${page} of ${Math.ceil((count || 0) / limit)})`,
    )
    console.log("[v0] API: Total count from database:", count)

    return NextResponse.json({
      complaints: data || [],
      count: data?.length || 0,
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: page * limit < (count || 0),
    })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

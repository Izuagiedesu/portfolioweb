import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("[v0] API: Fetching complaints from Supabase...")

    // Create Supabase client using service role key for admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("[v0] API: Supabase client created successfully")
    console.log("[v0] API: Using URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

    const { data, error, count } = await supabase
      .from("complaints")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] API: Error fetching complaints:", error)
      console.error("[v0] API: Error details:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: "Failed to fetch complaints", details: error.message }, { status: 500 })
    }

    console.log("[v0] API: Successfully fetched", data?.length || 0, "complaints")
    console.log("[v0] API: Total count from database:", count)

    if (data && data.length > 0) {
      console.log("[v0] API: Sample complaint:", JSON.stringify(data[0], null, 2))
    }

    return NextResponse.json({
      complaints: data || [],
      count: data?.length || 0,
      totalCount: count || 0,
    })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error:", error)
    console.error("[v0] API: Error stack:", error.stack)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

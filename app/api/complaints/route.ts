import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("[v0] API: Fetching complaints from Supabase...")

    // Create Supabase client using service role key for admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] API: Error fetching complaints:", error)
      return NextResponse.json({ error: "Failed to fetch complaints", details: error.message }, { status: 500 })
    }

    console.log("[v0] API: Successfully fetched", data?.length || 0, "complaints")

    return NextResponse.json({
      complaints: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

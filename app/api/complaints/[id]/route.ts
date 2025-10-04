import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase.from("complaints").update({ status }).eq("id", id).select()

    if (error) {
      console.error("[v0] API: Error updating complaint:", error)
      return NextResponse.json({ error: "Failed to update complaint", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ complaint: data[0] })
  } catch (error: any) {
    console.error("[v0] API: Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // For complaint system, we don't need complex auth middleware
  // Just pass through all requests
  return NextResponse.next()
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDebugPage() {
  const [status, setStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const testLogin = async () => {
    setIsLoading(true)
    setStatus("Testing admin login...")

    try {
      console.log("[v0] Starting debug login test...")

      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: "admin123" }),
      })

      const result = await response.json()
      console.log("[v0] API Response:", result)

      if (response.ok && result.success) {
        setStatus("✅ Login API working! Creating session...")

        const adminSession = {
          id: "admin",
          username: "admin",
          authenticated: true,
          loginTime: new Date().toISOString(),
        }

        localStorage.setItem("adminSession", JSON.stringify(adminSession))
        console.log("[v0] Session stored:", adminSession)

        setStatus("✅ Session created! Redirecting to dashboard...")

        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 1000)
      } else {
        setStatus(`❌ Login failed: ${result.error || "Unknown error"}`)
        console.log("[v0] Login failed:", result)
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
      console.log("[v0] Debug test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSession = () => {
    const session = localStorage.getItem("adminSession")
    if (session) {
      const parsed = JSON.parse(session)
      setStatus(`Current session: ${JSON.stringify(parsed, null, 2)}`)
    } else {
      setStatus("No admin session found")
    }
  }

  const clearSession = () => {
    localStorage.removeItem("adminSession")
    setStatus("Session cleared")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login Debug</CardTitle>
            <CardDescription>Test the admin login functionality and session management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={testLogin} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Login (admin123)"}
              </Button>
              <Button onClick={checkSession} variant="outline">
                Check Session
              </Button>
              <Button onClick={clearSession} variant="outline">
                Clear Session
              </Button>
              <Button onClick={() => router.push("/admin/login")} variant="outline">
                Go to Login Page
              </Button>
              <Button onClick={() => router.push("/admin/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>

            {status && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Status:</h3>
                <pre className="text-sm whitespace-pre-wrap">{status}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

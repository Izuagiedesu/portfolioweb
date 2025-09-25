"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { verifyPassword } from "@/lib/password-utils"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Admin login form submitted")
    console.log("[v0] Username entered:", username)

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: adminUser, error: queryError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .single()

      if (queryError || !adminUser) {
        console.log("[v0] Admin user not found:", queryError?.message)
        throw new Error("Invalid username or password")
      }

      if (!verifyPassword(password, username)) {
        console.log("[v0] Invalid password for username:", username)
        throw new Error("Invalid username or password")
      }

      console.log("[v0] Admin authentication successful")

      const adminSession = {
        id: adminUser.id,
        username: adminUser.username,
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("adminSession", JSON.stringify(adminSession))
      console.log("[v0] Admin session stored:", adminSession)

      console.log("[v0] Redirecting to dashboard...")
      router.push("/admin/dashboard")
    } catch (error: any) {
      console.log("[v0] Login error:", error.message)
      setError("Invalid username or password. Please contact DSS for access.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              DSS Staff - Enter your username and password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Access Dashboard"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-600 font-medium mb-2">Development Access:</p>
              <p className="text-xs text-blue-500">
                Usernames: admin, dss, complaints, university, bowen
                <br />
                Passwords: admin123, dss2024, complaints, university, bowen123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

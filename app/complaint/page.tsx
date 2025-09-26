"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

const categories = ["Water", "Electricity", "Noise", "Security", "Academics", "Facilities", "Others"]

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    details: "",
    intensity: "Medium",
    urgency: "Medium",
    studentName: "",
    studentEmail: "",
    studentId: "",
    isAnonymous: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.category || !formData.title || !formData.details) {
      setError("Please fill in all required fields (Category, Title, and Details)")
      setIsSubmitting(false)
      return
    }

    if (!formData.isAnonymous && (!formData.studentName || !formData.studentEmail || !formData.studentId)) {
      setError("Please fill in your student information or check 'Submit Anonymously'")
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()

      const complaintData = {
        category: formData.category,
        title: formData.title,
        details: formData.details,
        intensity: formData.intensity,
        urgency: formData.urgency,
        student_name: formData.isAnonymous ? null : formData.studentName,
        student_email: formData.isAnonymous ? null : formData.studentEmail,
        student_id: formData.isAnonymous ? null : formData.studentId,
        is_anonymous: formData.isAnonymous,
      }

      console.log("[v0] Submitting complaint data:", complaintData)

      const { data, error: insertError } = await supabase.from("complaints").insert(complaintData).select()

      console.log("[v0] Insert result:", { data, error: insertError })

      if (insertError) {
        console.error("[v0] Database error:", insertError)
        if (insertError.code === "23502") {
          throw new Error("Database constraint error. Please run the database fix script first.")
        }
        throw insertError
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from insert operation")
      }

      console.log("[v0] Complaint submitted successfully:", data[0])
      setSuccess(true)

      // Reset form
      setFormData({
        category: "",
        title: "",
        details: "",
        intensity: "Medium",
        urgency: "Medium",
        studentName: "",
        studentEmail: "",
        studentId: "",
        isAnonymous: false,
      })
    } catch (error: any) {
      console.error("[v0] Error submitting complaint:", error)
      setError(`Failed to submit complaint: ${error.message || "Please try again."}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Thank You!</CardTitle>
            <CardDescription>Your complaint has been recorded successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">The DSS team will review your complaint and take appropriate action.</p>
            <div className="flex gap-4">
              <Button onClick={() => setSuccess(false)} className="flex-1">
                Submit Another
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
            <CardDescription>
              Help us improve campus life by reporting your concerns to the Department of Student Services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Brief description of your complaint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label htmlFor="details">Details *</Label>
                <Textarea
                  id="details"
                  placeholder="Please provide detailed information about your complaint..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              {/* Intensity and Urgency selection fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity Level *</Label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked as boolean })}
                />
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Submit Anonymously
                </Label>
              </div>

              {/* Student Information (only if not anonymous) */}
              {!formData.isAnonymous && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Student Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name *</Label>
                    <Input
                      id="studentName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      required={!formData.isAnonymous}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email Address *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="your.email@bowenuniversity.edu.ng"
                      value={formData.studentEmail}
                      onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                      required={!formData.isAnonymous}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Your student ID number"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required={!formData.isAnonymous}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

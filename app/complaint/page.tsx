"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

const categories = ["Water", "Electricity", "Noise", "Security", "Academics", "Facilities", "Others"]

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    details: "",
    anonymous: false,
    studentName: "",
    studentId: "",
    studentEmail: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Please enter a title"
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please provide details about your complaint"
    }

    if (!formData.anonymous) {
      if (!formData.studentName.trim()) {
        newErrors.studentName = "Student name is required for non-anonymous complaints"
      }
      if (!formData.studentId.trim()) {
        newErrors.studentId = "Student ID is required for non-anonymous complaints"
      }
      if (!formData.studentEmail.trim()) {
        newErrors.studentEmail = "Student email is required for non-anonymous complaints"
      } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
        newErrors.studentEmail = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("complaints").insert({
        category: formData.category,
        title: formData.title,
        details: formData.details,
        is_anonymous: formData.anonymous,
        student_name: formData.anonymous ? null : formData.studentName,
        student_id: formData.anonymous ? null : formData.studentId,
        student_email: formData.anonymous ? null : formData.studentEmail,
      })

      if (error) {
        console.error("Error submitting complaint:", error)
        throw new Error("Failed to submit complaint. Please try again.")
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting complaint:", error)
      alert(error instanceof Error ? error.message : "An error occurred while submitting your complaint.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Complaint Submitted</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your complaint has been recorded. We will review it and take appropriate action.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/complaint">Submit Another Complaint</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Submit a Complaint</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Form</CardTitle>
              <CardDescription>
                Please provide details about your complaint. All fields are required unless marked optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
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
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Brief title for your complaint"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Details *</Label>
                  <Textarea
                    id="details"
                    placeholder="Please provide detailed information about your complaint..."
                    rows={6}
                    value={formData.details}
                    onChange={(e) => handleInputChange("details", e.target.value)}
                    className={errors.details ? "border-destructive" : ""}
                  />
                  {errors.details && <p className="text-sm text-destructive">{errors.details}</p>}
                </div>

                {!formData.anonymous && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-medium text-sm">Student Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="studentName">Full Name *</Label>
                      <Input
                        id="studentName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange("studentName", e.target.value)}
                        className={errors.studentName ? "border-destructive" : ""}
                      />
                      {errors.studentName && <p className="text-sm text-destructive">{errors.studentName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Enter your student ID"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange("studentId", e.target.value)}
                        className={errors.studentId ? "border-destructive" : ""}
                      />
                      {errors.studentId && <p className="text-sm text-destructive">{errors.studentId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentEmail">Email Address *</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.studentEmail}
                        onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                        className={errors.studentEmail ? "border-destructive" : ""}
                      />
                      {errors.studentEmail && <p className="text-sm text-destructive">{errors.studentEmail}</p>}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => handleInputChange("anonymous", checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="text-sm font-normal">
                    Submit Anonymously
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

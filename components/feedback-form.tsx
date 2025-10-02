"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface FeedbackFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function FeedbackForm({ onClose, onSuccess }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.name || !formData.message || !formData.rating) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()

      const feedbackData = {
        name: formData.name,
        email: formData.email || null,
        message: formData.message,
        rating: Number.parseInt(formData.rating),
      }

      console.log("[v0] Submitting feedback:", feedbackData)

      const { data, error: insertError } = await supabase.from("feedback").insert(feedbackData).select()

      if (insertError) {
        console.error("[v0] Database error:", insertError)
        throw insertError
      }

      console.log("[v0] Feedback submitted successfully:", data)
      onSuccess()
    } catch (error: any) {
      console.error("[v0] Error submitting feedback:", error)
      setError(`Failed to submit feedback: ${error.message || "Please try again."}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
          <CardDescription>Help us improve our services by sharing your experience</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate your experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                  <SelectItem value="2">⭐⭐ Fair</SelectItem>
                  <SelectItem value="1">⭐ Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Feedback *</Label>
              <Textarea
                id="message"
                placeholder="Share your thoughts and suggestions..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

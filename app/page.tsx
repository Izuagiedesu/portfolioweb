"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackSlideshow } from "@/components/feedback-slideshow"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare } from "lucide-react"

export default function Home() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFeedbacks = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("[v0] Error fetching feedback:", error)
        return
      }

      setFeedbacks(data || [])
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false)
    fetchFeedbacks()
    alert("Thank you for your feedback!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Directorate of Student Support Services</h1>
              <nav className="hidden md:flex space-x-6"></nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button className="bg-blue-600 hover:bg-blue-700"> Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">- SECURE & CONFIDENTIAL</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                The best way to voice your <span className="text-blue-600">concerns.</span>
              </h1>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Your voice matters. Share your concerns and help us create a better campus environment for all students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/complaint">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                  Submit complaints
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg bg-transparent"
                onClick={() => setShowFeedbackForm(true)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Share Feedback
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-96 rounded-lg shadow-lg overflow-hidden bg-gray-200">
              <img
                src="https://bowen.edu.ng/wp-content/uploads/2022/11/IMG_6020.jpg"
                alt="Bowen University Campus"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>

        <section className="mt-32">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Feedback</h2>
              <p className="text-gray-600">See what students are saying about our services</p>
            </div>
            <Link href="/feedback">
              <Button variant="outline">View All Feedback</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">Loading feedback...</p>
            </div>
          ) : (
            <FeedbackSlideshow feedbacks={feedbacks} />
          )}
        </section>

        <footer className="mt-32 pt-20 border-t border-gray-200">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Bowen University Complaint System (BUCS)</h3>
            <p className="text-gray-600">Committed to improving campus life through your feedback</p>
            <p className="text-sm text-gray-500"> Designed by Software. </p>
          </div>
        </footer>
      </main>

      {showFeedbackForm && (
        <FeedbackForm onClose={() => setShowFeedbackForm(false)} onSuccess={handleFeedbackSuccess} />
      )}
    </div>
  )
}

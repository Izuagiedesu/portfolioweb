"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackMarquee } from "@/components/feedback-marquee"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Globe } from "lucide-react"

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
        .limit(5)

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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjEiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjIiLz48Y2lyY2xlIGN4PSIxMzAiIGN5PSI0MCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjE4MCIgY3k9IjE1MCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-40"></div>

      <header className="border-b border-border/30 backdrop-blur-md bg-background/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-wide">BUCS</h1>
                <p className="text-[10px] text-muted-foreground">by Directorate of Student's Support Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/admin/login">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-foreground hover:text-primary hover:bg-transparent text-xs font-medium"
                >
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/design-mode/IMG_6020.jpg"
              alt="Bowen University Campus"
              className="w-full h-full object-cover opacity-60"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80"></div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">STUDENT SUPPORT</span>
              <br />
              <span className="text-foreground">TO THE</span> <span className="text-primary">FUTURE</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Your voice matters. Submit complaints and share feedback to help us build a better campus experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/complaint">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg font-medium tracking-wide uppercase shadow-lg shadow-primary/20"
                >
                  Submit Complaint
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg font-medium bg-transparent"
                onClick={() => setShowFeedbackForm(true)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Share Feedback
              </Button>
            </div>
          </div>
        </div>

        <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Student <span className="text-primary">Voices</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real feedback from students making a difference on campus
            </p>
          </div>

          {isLoading ? (
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-primary/30 p-12 text-center">
              <p className="text-muted-foreground text-lg">Loading feedback...</p>
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
              <FeedbackMarquee feedbacks={feedbacks} />
              <div className="text-center mt-8">
                <Link href="/feedback">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10 bg-transparent text-primary hover:text-primary px-8 py-6 text-base font-medium"
                  >
                    View All Feedback
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-primary/30 p-12 text-center">
              <p className="text-muted-foreground text-lg">No feedback yet. Be the first to share your experience!</p>
            </div>
          )}
        </section>

        <footer className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 border-t border-border/30">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground tracking-wide">BUCS</h3>
            <p className="text-sm text-muted-foreground">Bowen University Complaint System</p>
            <p className="text-xs text-muted-foreground/70">Directorate of Student's Support Services</p>
          </div>
        </footer>
      </main>

      {showFeedbackForm && (
        <FeedbackForm onClose={() => setShowFeedbackForm(false)} onSuccess={handleFeedbackSuccess} />
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Feedback {
  id: string
  name: string
  message: string
  rating: number
  created_at: string
}

interface FeedbackSlideshowProps {
  feedbacks: Feedback[]
}

export function FeedbackSlideshow({ feedbacks }: FeedbackSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (feedbacks.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [feedbacks.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length)
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500">No feedback yet. Be the first to share your experience!</p>
      </div>
    )
  }

  const currentFeedback = feedbacks[currentIndex]

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 relative">
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < currentFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">{currentFeedback.message}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{currentFeedback.name}</p>
            <p className="text-sm text-gray-500">{new Date(currentFeedback.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-sm text-gray-400">
            {currentIndex + 1} / {feedbacks.length}
          </div>
        </div>
      </div>

      {feedbacks.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button variant="outline" size="icon" onClick={goToPrevious} className="rounded-full bg-transparent">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            {feedbacks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full bg-transparent">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

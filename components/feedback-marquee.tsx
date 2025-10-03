"use client"

import { Star } from "lucide-react"

interface Feedback {
  id: string
  name: string
  message: string
  rating: number
  created_at: string
}

interface FeedbackMarqueeProps {
  feedbacks: Feedback[]
}

export function FeedbackMarquee({ feedbacks }: FeedbackMarqueeProps) {
  const duplicatedFeedbacks = [...feedbacks, ...feedbacks, ...feedbacks]

  return (
    <div className="overflow-hidden py-4 relative">
      <div className="flex animate-scroll-continuous">
        {duplicatedFeedbacks.map((feedback, index) => (
          <div
            key={`${feedback.id}-${index}`}
            className="flex-shrink-0 w-[400px] bg-card/70 backdrop-blur-md rounded-xl border border-primary/30 p-6 shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 mx-3"
          >
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-foreground text-base leading-relaxed mb-4 line-clamp-3">{feedback.message}</p>
            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div>
                <p className="font-semibold text-foreground text-sm">{feedback.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(feedback.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

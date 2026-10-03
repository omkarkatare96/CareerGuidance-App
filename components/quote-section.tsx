"use client"

import { useState, useEffect } from "react"
import { Quote } from "lucide-react"

const quotes = [
  "You don\u2019t have to see the whole staircase. Just take the first step. \u2014 Martin Luther King Jr.",
  "The future belongs to those who believe in the beauty of their dreams. \u2014 Eleanor Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. \u2014 Confucius",
  "Your time is limited, don\u2019t waste it living someone else\u2019s life. \u2014 Steve Jobs",
  "Success is not the key to happiness. Happiness is the key to success. \u2014 Albert Schweitzer",
  "The only way to do great work is to love what you do. \u2014 Steve Jobs",
  "Believe you can and you\u2019re halfway there. \u2014 Theodore Roosevelt",
  "In the middle of every difficulty lies opportunity. \u2014 Albert Einstein",
  "Don\u2019t watch the clock; do what it does. Keep going. \u2014 Sam Levenson",
  "Everything you\u2019ve ever wanted is on the other side of fear. \u2014 George Addair",
]

export function QuoteSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length)
        setIsVisible(true)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="mx-auto max-w-2xl flex items-center justify-center min-h-[200px]">
        <div
          className={`glass-card rounded-2xl p-8 md:p-12 text-center shadow-lg shadow-primary/5 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
          <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
            {quotes[currentIndex]}
          </p>
        </div>
      </div>
    </section>
  )
}

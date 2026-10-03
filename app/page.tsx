"use client"

import React from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { QuoteSection } from "@/components/quote-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <QuoteSection />
      <Footer />
    </main>
  )
}

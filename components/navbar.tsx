"use client"

import Link from "next/link"
import { useState } from "react"
import { Compass, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { label: "Home", href: "/" },
    { label: "Discover", href: "/discover" },
    { label: "My Goals", href: "/goals" },
    { label: "Exams", href: "/exams" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Dashboard", href: "/dashboard" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Compass className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl text-foreground">CareerCoach</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 glass-card">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" className="w-full mt-2" asChild>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          </Button>
        </div>
      )}
    </nav>
  )
}

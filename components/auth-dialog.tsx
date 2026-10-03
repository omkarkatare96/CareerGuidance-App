"use client"

import { useState } from "react"
import { X, Mail, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthDialogProps {
  open: boolean
  onClose: () => void
}

export function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />

      <div className="relative glass-card rounded-2xl p-8 w-full max-w-md shadow-xl shadow-primary/10 animate-fade-in-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Continue your journey" : "Start your career exploration"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button variant="outline" className="gap-2 text-foreground bg-transparent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-background/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                className="bg-background/50"
              />
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="bg-background/50"
                />
              </div>
            )}
          </div>

          <Button className="gap-2 mt-2">
            <Mail className="h-4 w-4" />
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don\u2019t have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

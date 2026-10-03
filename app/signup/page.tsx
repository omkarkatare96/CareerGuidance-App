"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { Shield, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!name.trim()) {
            setError("Please enter your name")
            return
        }
        if (!email.trim()) {
            setError("Please enter your email")
            return
        }
        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            await signUp(email, password, name)
        } catch (err: any) {
            setError(err.message || "Failed to create account")
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="glass-card rounded-2xl p-8 w-full max-w-md shadow-xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl text-foreground">Create your account</h2>
                        <p className="text-sm text-muted-foreground">Start your career exploration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2 text-foreground bg-transparent"
                        disabled
                    >
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

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                className="bg-background/50"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="bg-background/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 6 characters"
                                className="bg-background/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="gap-2 mt-2" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <Mail className="h-4 w-4" />
                                Create Account
                            </>
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    )
}

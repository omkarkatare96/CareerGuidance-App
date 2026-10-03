"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    LayoutDashboard,
    MapPin,
    Calendar,
    Rocket,
    Compass,
    ChevronRight,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/protected-route"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase"
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    Timestamp,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

interface RoadmapEntry {
    id: string
    stream: string
    source: "discover" | "goals"
    generatedAt: Timestamp | null
}

function formatDate(ts: Timestamp | null): string {
    if (!ts) return "—"
    const d = ts.toDate()
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

function DashboardContent() {
    const [roadmaps, setRoadmaps] = useState<RoadmapEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false)
                return
            }
            try {
                const q = query(
                    collection(db, "users", user.uid, "roadmaps"),
                    orderBy("generatedAt", "desc"),
                    limit(5)
                )
                const snap = await getDocs(q)
                const items: RoadmapEntry[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    stream: doc.data().stream ?? "Unknown Stream",
                    source: doc.data().source ?? "discover",
                    generatedAt: doc.data().generatedAt ?? null,
                }))
                setRoadmaps(items)
            } catch (err) {
                console.error("Failed to load roadmaps:", err)
            } finally {
                setLoading(false)
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <section className="py-24 px-4">
            <div className="mx-auto max-w-5xl flex flex-col gap-10">
                {/* Header */}
                <div className="text-center flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm w-fit mx-auto">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
                        Your Career Dashboard
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Track your progress, manage your goals, and stay on top of your career journey.
                    </p>
                </div>

                {/* Recent Roadmaps */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            Recent Roadmaps
                        </h3>
                        <Link href="/discover">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
                                Generate new <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        // Skeleton
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : roadmaps.length === 0 ? (
                        // Empty state
                        <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Compass className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground mb-1">No roadmaps generated yet.</p>
                                <p className="text-sm text-muted-foreground">Start with Discover to generate your personalized career roadmap.</p>
                            </div>
                            <Link href="/discover">
                                <Button size="sm" className="rounded-full px-6">
                                    Start with Discover
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        // Roadmap list
                        <div className="flex flex-col gap-3">
                            {roadmaps.map((rm) => (
                                <div
                                    key={rm.id}
                                    className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Rocket className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground truncate">{rm.stream}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(rm.generatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${rm.source === "discover"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-accent/10 text-accent-foreground border border-border"
                                            }`}
                                    >
                                        {rm.source === "discover" ? "Discover" : "Goals"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <Navbar />
                <DashboardContent />
                <Footer />
            </main>
        </ProtectedRoute>
    )
}

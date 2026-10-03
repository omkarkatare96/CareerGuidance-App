"use client"

import { useState, useEffect, useCallback } from "react"
import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Loader2,
    CheckCircle2,
    Circle,
    ExternalLink,
    Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { auth, db } from "@/lib/firebase"
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore"

// ─── Types ───────────────────────────────────────────────

interface SprintTask {
    id: string
    task: string
    resourceUrl?: string
    resourceName?: string
    estimatedTime?: string
}

interface SprintWeek {
    week: number
    theme?: string
    tasks: SprintTask[]
}

interface SprintData {
    weeks: SprintWeek[]
}

interface SprintProps {
    selectedStream: string
    phase1Focus: string[]
    personalityProfile: string
}

// ─── Helper ──────────────────────────────────────────────

const TOTAL_TASKS = 36

function buildTaskMap(weeks: SprintWeek[]): Record<string, boolean> {
    const map: Record<string, boolean> = {}
    weeks.forEach((w) => w.tasks.forEach((t) => { map[t.id] = false }))
    return map
}

// ─── Component ───────────────────────────────────────────

export function SprintPlanner({ selectedStream, phase1Focus, personalityProfile }: SprintProps) {
    const [loading, setLoading] = useState(false)
    const [sprint, setSprint] = useState<SprintData | null>(null)
    const [expandedWeek, setExpandedWeek] = useState<number | null>(1)
    const [completed, setCompleted] = useState<Record<string, boolean>>({})
    const [savingProgress, setSavingProgress] = useState(false)

    // Load saved progress from Firestore on mount
    useEffect(() => {
        const loadProgress = async () => {
            const user = auth.currentUser
            if (!user) return
            try {
                const sprintSnap = await getDoc(doc(db, "users", user.uid, "sprint", "latest"))
                if (sprintSnap.exists()) {
                    const saved = sprintSnap.data() as SprintData
                    setSprint(saved)
                    const progressSnap = await getDoc(doc(db, "users", user.uid, "sprint", "progress"))
                    if (progressSnap.exists()) {
                        setCompleted(progressSnap.data().completedTasks ?? {})
                    } else {
                        setCompleted(buildTaskMap(saved.weeks))
                    }
                }
            } catch (err) {
                console.warn("Could not load sprint:", err)
            }
        }
        loadProgress()
    }, [])

    const generateSprint = async () => {
        setLoading(true)
        try {
            const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
            const res = await fetch(`${BACKEND}/generate-sprint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedStream,
                    roadmapPhase1Focus: phase1Focus,
                    personalityProfile,
                }),
            })
            if (!res.ok) throw new Error("Failed to generate sprint")
            const data: SprintData = await res.json()
            setSprint(data)
            setExpandedWeek(1)

            const initialCompleted = buildTaskMap(data.weeks)
            setCompleted(initialCompleted)

            // Save to Firestore
            try {
                const user = auth.currentUser
                if (user) {
                    await setDoc(doc(db, "users", user.uid, "sprint", "latest"), {
                        ...data,
                        generatedAt: serverTimestamp(),
                    })
                    await setDoc(doc(db, "users", user.uid, "sprint", "progress"), {
                        completedTasks: initialCompleted,
                        updatedAt: serverTimestamp(),
                    })
                }
            } catch (saveErr) {
                console.warn("Sprint save skipped:", saveErr)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleTask = useCallback(async (taskId: string) => {
        setCompleted((prev) => {
            const next = { ...prev, [taskId]: !prev[taskId] }
            // Persist asynchronously
            const persist = async () => {
                setSavingProgress(true)
                try {
                    const user = auth.currentUser
                    if (user) {
                        await setDoc(
                            doc(db, "users", user.uid, "sprint", "progress"),
                            { completedTasks: next, updatedAt: serverTimestamp() },
                            { merge: true }
                        )
                    }
                } catch (e) {
                    console.warn("Progress save failed:", e)
                } finally {
                    setSavingProgress(false)
                }
            }
            persist()
            return next
        })
    }, [])

    const completedCount = Object.values(completed).filter(Boolean).length
    const progressPct = Math.round((completedCount / TOTAL_TASKS) * 100)

    if (!sprint) {
        return (
            <div className="flex flex-col items-center gap-4 pt-4">
                <Button
                    size="lg"
                    className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20"
                    onClick={generateSprint}
                    disabled={loading}
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Generating Sprint...</>
                    ) : (
                        <><CalendarDays className="h-5 w-5" /> 📅 Get My 90-Day Sprint</>
                    )}
                </Button>
                {loading && (
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Building your 12-week action plan...
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 pt-4">
            {/* Header + Progress */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="font-serif text-xl text-foreground">90-Day Sprint Plan</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {savingProgress && <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>}
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">{completedCount} / {TOTAL_TASKS} tasks</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Progress value={progressPct} className="flex-1 h-3" />
                    <span className="text-sm font-bold text-primary w-10 text-right">{progressPct}%</span>
                </div>
                {completedCount === TOTAL_TASKS && (
                    <p className="text-sm text-green-600 font-semibold text-center animate-in fade-in">
                        🎉 Sprint Complete! You crushed all 36 tasks.
                    </p>
                )}
            </div>

            {/* Week Cards */}
            <div className="flex flex-col gap-3">
                {sprint.weeks.map((week) => {
                    const isOpen = expandedWeek === week.week
                    const weekDone = week.tasks.filter((t) => completed[t.id]).length
                    return (
                        <div key={week.week} className="glass-card rounded-2xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setExpandedWeek(isOpen ? null : week.week)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                        {week.week}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-foreground">
                                            Week {week.week}{week.theme ? ` — ${week.theme}` : ""}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {weekDone}/{week.tasks.length} tasks done
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {weekDone === week.tasks.length && (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {isOpen ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 flex flex-col gap-3">
                                    {week.tasks.map((task) => {
                                        const isDone = !!completed[task.id]
                                        return (
                                            <div
                                                key={task.id}
                                                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isDone
                                                        ? "bg-green-500/5 border-green-500/20"
                                                        : "bg-muted/40 border-border"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTask(task.id)}
                                                    className="flex-shrink-0 mt-0.5"
                                                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                        {task.task}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                        {task.estimatedTime && (
                                                            <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                                                        )}
                                                        {task.resourceUrl && (
                                                            <a
                                                                href={task.resourceUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                            >
                                                                {task.resourceName || "Resource"}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Regenerate */}
            <div className="text-center">
                <Button variant="outline" size="sm" onClick={generateSprint} disabled={loading} className="rounded-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "↺ Regenerate Sprint"}
                </Button>
            </div>
        </div>
    )
}

"use client"

import { Navbar } from "@/components/navbar"
import { KnowMyGoal } from "@/components/know-my-goal"
import { CompetitiveExams } from "@/components/competitive-exams"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/protected-route"

export default function GoalsPage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <Navbar />
                <KnowMyGoal />
                <CompetitiveExams />
                <Footer />
            </main>
        </ProtectedRoute>
    )
}

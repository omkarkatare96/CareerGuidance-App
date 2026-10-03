"use client"

import { Navbar } from "@/components/navbar"
import { CareerRoadmap } from "@/components/career-roadmap"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/protected-route"

export default function RoadmapPage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <Navbar />
                <CareerRoadmap />
                <Footer />
            </main>
        </ProtectedRoute>
    )
}

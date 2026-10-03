"use client"

import { Navbar } from "@/components/navbar"
import { CareerDiscovery } from "@/components/career-discovery"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/protected-route"

export default function DiscoverPage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <Navbar />
                <CareerDiscovery />
                <Footer />
            </main>
        </ProtectedRoute>
    )
}

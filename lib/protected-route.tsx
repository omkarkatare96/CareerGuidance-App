"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return <>{children}</>;
}

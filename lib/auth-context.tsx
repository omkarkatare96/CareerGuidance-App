"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                createdAt: serverTimestamp(),
            });

            router.push('/dashboard');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create account');
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push('/login');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

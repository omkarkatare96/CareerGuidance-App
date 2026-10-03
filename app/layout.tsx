import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'

import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' })

export const metadata: Metadata = {
  title: 'CareerCoach AI - From Confusion to Clarity',
  description: 'A calm career guidance platform for students. Discover your path, understand your strengths, and build a roadmap for your future.',
}

export const viewport: Viewport = {
  themeColor: '#4B7BEC',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

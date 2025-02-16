import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OCC Oasis',
  description: 'Garden Experience - A couples retreat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`h-full ${inter.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
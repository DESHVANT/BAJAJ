import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ultimate Leaderboard Showdown',
  description: 'Compete, climb, and conquer the leaderboard! Exciting users and real-time points.',
  generator: 'Leaderboard System',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

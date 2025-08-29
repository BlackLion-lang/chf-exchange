import type React from "react"
import type { Metadata } from "next"
import "../src/index.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "CHF.CH Exchange",
  description: "Swiss Stablecoin Exchange Platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}

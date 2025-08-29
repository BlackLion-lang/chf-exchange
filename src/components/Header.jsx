"use client"

import { useState } from "react"
import { Menu, X, Settings } from "lucide-react"
import { Button } from "./ui/button"
import "@web3modal/wagmi/react" // registers <w3m-button />

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-card">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <img src="/chf-logo.png" alt="CHF.CH Logo" className="w-8 h-8 rounded-full" />
          </div>
          <div className="font-bold text-xl text-white">CHF.CH Exchange</div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Exchange</a>
          <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Markets</a>
          <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Wallet</a>
          <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Support</a>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <w3m-button balance="show" size="sm" />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border glass-card">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Exchange</a>
            <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Markets</a>
            <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Wallet</a>
            <a href="#" className="text-white hover:text-red-400 transition-colors font-medium">Support</a>

            {/* Mobile Wallet Button */}
            <div className="mt-4">
              <w3m-button balance="show" size="sm" />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

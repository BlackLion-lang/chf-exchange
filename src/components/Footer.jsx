"use client"

export default function Footer() {
  return (
    <footer className="border-t border-white/20 glass-card">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <img src="/chf-logo.png" alt="CHF.CH Logo" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-bold text-lg text-white">CHF.CH</span>
            </div>
            <p className="text-white text-sm">The premier Swiss stablecoin exchange platform.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Trading</h4>
            <ul className="space-y-2 text-sm text-white">
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Markets
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Trading History
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Support</h4>
            <ul className="space-y-2 text-sm text-white">
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-white">
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-400 transition-colors">
                  Risk Disclosure
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-6 text-center text-sm text-white">
          <p>&copy; 2025 CHF.CH Exchange. All rights reserved. | Regulated Swiss Stablecoin Platform</p>
        </div>
      </div>
    </footer>
  )
}

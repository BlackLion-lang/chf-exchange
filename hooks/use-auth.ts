import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      // Check for token in localStorage or sessionStorage
      const localToken = localStorage.getItem('token')
      const sessionToken = sessionStorage.getItem('token')
      const authToken = localToken || sessionToken

      if (authToken) {
        setToken(authToken)
        setIsAuthenticated(true)
        
        // Set cookie if not already set (for middleware)
        if (!document.cookie.includes('token=')) {
          document.cookie = `token=${authToken}; path=/; ${localToken ? 'max-age=2592000;' : ''} secure; samesite=strict`
        }
      } else {
        setToken(null)
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === null) {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (token: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
    
    // Set cookie for middleware
    document.cookie = `token=${token}; path=/; ${rememberMe ? 'max-age=2592000;' : ''} secure; samesite=strict`
    
    setToken(token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict'
    
    setToken(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  return {
    isAuthenticated,
    token,
    login,
    logout,
    isLoading: isAuthenticated === null
  }
}

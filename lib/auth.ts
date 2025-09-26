import { useEffect, useState } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('dashboard_token')
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('dashboard_token')
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (token: string) => {
    localStorage.setItem('dashboard_token', token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('dashboard_token')
    setIsAuthenticated(false)
  }

  const getToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('dashboard_token') : null
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    checkAuth
  }
}

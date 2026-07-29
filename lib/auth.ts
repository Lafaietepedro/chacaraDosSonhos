import { useCallback, useEffect, useState } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify', { cache: 'no-store' })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    setIsAuthenticated(false)
  }, [])

  // Compatibilidade temporária com chamadas existentes. A autenticação real
  // acontece pelo cookie HttpOnly, que o navegador envia automaticamente.
  const getToken = useCallback(() => null, [])

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    checkAuth
  }
}

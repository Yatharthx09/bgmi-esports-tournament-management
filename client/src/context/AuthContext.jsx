import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bgmi_token')
    const cachedUser = localStorage.getItem('bgmi_user')
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser))
      authService
        .me()
        .then((res) => {
          setUser(res.data.user)
          localStorage.setItem('bgmi_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('bgmi_token')
          localStorage.removeItem('bgmi_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (identifier, password) => {
    const res = await authService.login({ identifier, password })
    localStorage.setItem('bgmi_token', res.data.token)
    localStorage.setItem('bgmi_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload)
    localStorage.setItem('bgmi_token', res.data.token)
    localStorage.setItem('bgmi_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bgmi_token')
    localStorage.removeItem('bgmi_user')
    setUser(null)
  }, [])

  const updateUserCache = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('bgmi_user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserCache }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

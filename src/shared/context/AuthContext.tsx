import React, { createContext, useContext, useEffect, useState } from 'react'
import { httpClient } from '../services/httpClient'
import type { UserProfile } from '../types/auth'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
  refetchUser: () => Promise<void>
  hasPermission: (permissionCode: string) => boolean
  hasRole: (roleCode: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('access_token')
    if (saved === 'undefined') {
      localStorage.removeItem('access_token')
      return null
    }
    return saved
  })
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem('access_token')
    if (!currentToken || currentToken === 'undefined') {
      if (currentToken === 'undefined') {
        localStorage.removeItem('access_token')
      }
      setToken(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await httpClient.get<UserProfile>('/api/v1/me')
      const userData = (response.data as any)?.data || response.data
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      localStorage.removeItem('access_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [token])

  const login = (newToken: string, newUser: UserProfile) => {
    if (!newToken || newToken === 'undefined') return
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false
    if (user.is_master) return true
    return user.permissions?.includes(permissionCode) ?? false
  }

  const hasRole = (roleCode: string): boolean => {
    if (!user) return false
    if (user.is_master) return true
    return user.roles?.some((r) => r.code === roleCode) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refetchUser: fetchCurrentUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

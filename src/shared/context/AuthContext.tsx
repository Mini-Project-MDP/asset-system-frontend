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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('user_profile')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch {
        return null
      }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem('access_token')
    if (!currentToken || currentToken === 'undefined') {
      if (currentToken === 'undefined') {
        localStorage.removeItem('access_token')
      }
      localStorage.removeItem('user_profile')
      setToken(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    // Support offline / local demo token without forcing remote /api/v1/me
    if (currentToken.startsWith('mock_') || currentToken.startsWith('local_')) {
      const savedUser = localStorage.getItem('user_profile')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          setIsLoading(false)
          return
        } catch {
          // continue to remote check if parse failed
        }
      }
    }

    try {
      const response = await httpClient.get<UserProfile>('/api/v1/me')
      const userData = (response.data as any)?.data || response.data
      setUser(userData)
      localStorage.setItem('user_profile', JSON.stringify(userData))
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      // If we have a cached local/mock user, retain it so offline demos don't break
      const savedUser = localStorage.getItem('user_profile')
      if (savedUser && (currentToken.startsWith('mock_') || currentToken.startsWith('local_'))) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_profile')
          setToken(null)
          setUser(null)
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_profile')
        setToken(null)
        setUser(null)
      }
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
    localStorage.setItem('user_profile', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_profile')
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

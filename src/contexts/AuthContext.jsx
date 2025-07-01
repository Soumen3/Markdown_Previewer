import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshAuth: () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsLoggedIn(true)
        console.log('Auth context: User is logged in:', currentUser)
      } else {
        setUser(null)
        setIsLoggedIn(false)
        console.log('Auth context: User is not logged in')
      }
    } catch (error) {
      console.log('Auth context: User is not logged in')
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData) => {
    setUser(userData.user || userData)
    setIsLoggedIn(true)
    console.log('Auth context: User logged in via context')
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error in context:', error)
    } finally {
      setUser(null)
      setIsLoggedIn(false)
      console.log('Auth context: User logged out via context')
    }
  }

  useEffect(() => {
    refreshAuth()
  }, [])

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

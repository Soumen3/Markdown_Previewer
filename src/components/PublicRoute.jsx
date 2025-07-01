import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function PublicRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />
  }

  // If not logged in, render the public component (login/signup)
  return children
}

export default PublicRoute

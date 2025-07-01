import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setMounted, setTheme } from '../features/theme/themeSlice'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark, mounted, toggle, isMobileMenuOpen, toggleMobileMenu: toggleMobile, closeMobileMenu } = useTheme()
  
  // Use Auth Context
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth()
  const { toast, removeToast } = useToast()
  
  // Local loading state for logout
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    dispatch(setMounted())
    const savedTheme = localStorage.getItem('theme')
    console.log('Saved theme:', savedTheme)
    
    // Default to light mode if no saved theme
    const shouldBeDark = savedTheme === 'dark'
    
    dispatch(setTheme(shouldBeDark))
  }, [dispatch])

  // Close mobile menu on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) { // 768px is md breakpoint
        handleMobileMenuClose()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  const handleToggleTheme = () => {
    toggle()
    console.log('Theme toggled:', localStorage.getItem('theme'))
  }

  const handleToggleMobileMenu = () => {
    toggleMobile()
  }

  const handleMobileMenuClose = () => {
    closeMobileMenu()
  }

  const handleGetStartedClick = () => {
    navigate('/login')
  }

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple logout attempts
    
    setIsLoggingOut(true)
    let loadingToastId = null
    
    try {
      const userName = user?.name?.split(' ')[0] || 'there'
      
      // Show loading toast
      loadingToastId = toast.logoutLoading()
      
      await logout()
      console.log('User logged out successfully')
      
      // Remove loading toast and show success
      removeToast(loadingToastId)
      toast.logoutSuccess(userName)
      
      // Don't navigate here - let ProtectedRoute handle the redirect
      
    } catch (error) {
      console.error('Logout error:', error)
      
      // Remove loading toast before showing error
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      toast.logoutError()
      // Only navigate on error, to ensure user gets to a safe state
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleDashboardClick = () => {
    navigate('/dashboard')
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <header className="container mx-auto px-6 py-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeClick}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white hidden md:block hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">MarkdownPreview</span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Features</a>
          <a href="#demo" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Demo</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">About</a>
          
          <button
            onClick={handleDashboardClick}
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Dashboard
          </button>
          
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              // Sun Icon for Light Mode
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              // Moon Icon for Dark Mode
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* Auth Button - Show Logout if logged in, Get Started if not */}
          {!authLoading && (
            isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {user && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.name.split(' ')[0]}
                  </span>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <span>Logout</span>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGetStartedClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Get Started
              </button>
            )
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={handleToggleMobileMenu}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              // Close icon (X)
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4 pt-4">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleMobileMenuClose}
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleMobileMenuClose}
            >
              Demo
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleMobileMenuClose}
            >
              About
            </a>
            <button 
              onClick={() => {
                handleDashboardClick()
                handleMobileMenuClose()
              }}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
            >
              Dashboard
            </button>
            
            {/* Auth Button - Mobile */}
            {!authLoading && (
              isLoggedIn ? (
                <div className="space-y-2">
                  {user && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 px-2 py-1">
                      Welcome, {user.name.split(' ')[0]}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout()
                      handleMobileMenuClose()
                    }}
                    disabled={isLoggingOut}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors text-left font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <span>Logout</span>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    handleGetStartedClick()
                    handleMobileMenuClose()
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-left font-medium"
                >
                  Get Started
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

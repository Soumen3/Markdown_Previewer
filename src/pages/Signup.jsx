import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { SignupForm } from '../components/forms'
import { authService } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

function Signup() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast, removeToast } = useToast()

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    
    let loadingToastId = null
    
    try {
      // Log the user preferences
      console.log('User registration data:', {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        company: formData.company,
        agreeToTerms: formData.agreeToTerms,
        subscribeNewsletter: formData.subscribeNewsletter
      })

      // Show loading toast
      loadingToastId = toast.signupLoading()
      
      // Register user with AuthService
      const { user, session } = await authService.register(formData)
      
      console.log('User created successfully:', user)
      console.log('User logged in after registration:', session)
      
      // Update auth context
      await login({ user, session })
      
      // Remove loading toast and show success
      removeToast(loadingToastId)
      toast.signupSuccess(user.name.split(' ')[0])
      
      navigate(from, { replace: true }) // Redirect to intended destination after successful signup
      
    } catch (error) {
      console.error('Signup error:', error)
      
      // Remove loading toast before showing error
      if (loadingToastId) {
        removeToast(loadingToastId)
      }
      
      toast.signupError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      toast.googleRedirect('signup')
      
      // Get the intended destination and encode it in the success URL
      const successUrl = `${window.location.origin}${from}`
      
      // Initiate Google OAuth with AuthService
      await authService.loginWithGoogle(
        successUrl, // Success redirect to intended destination
        `${window.location.origin}/signup` // Failure redirect
      )
    } catch (error) {
      console.error('Google signup error:', error)
      toast.signupError(error.message)
    }
  }

  const handleGitHubSignup = async () => {
    try {
      toast.githubRedirect('signup')
      
      // Get the intended destination and encode it in the success URL
      const successUrl = `${window.location.origin}${from}`
      
      // Initiate GitHub OAuth with AuthService
      await authService.loginWithGitHub(
        successUrl, // Success redirect to intended destination
        `${window.location.origin}/signup` // Failure redirect
      )
    } catch (error) {
      console.error('GitHub signup error:', error)
      toast.signupError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-top duration-700 delay-200">
        {/* Back to Home Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:translate-x-1"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-in zoom-in duration-500 delay-300 hover:scale-110 transition-transform cursor-pointer shadow-lg hover:shadow-xl">
            <span className="text-white font-bold text-xl sm:text-2xl">M</span>
          </div>
        </div>
        
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-600 delay-400">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 px-2 animate-in fade-in duration-500 delay-500">
          Join{' '}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            MarkdownPreview
          </span>
          {' '}and start your journey
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom duration-700 delay-600">
        <SignupForm 
          onSubmit={handleSubmit}
          onGoogleSignup={handleGoogleSignup}
          onGitHubSignup={handleGitHubSignup}
          isLoading={isLoading}
        />

        {/* Sign In Link */}
        <div className="mt-6 animate-in slide-in-from-bottom duration-500 delay-1500">
          <div className="text-center px-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:underline hover:scale-105 inline-block"
              >
                Sign in
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
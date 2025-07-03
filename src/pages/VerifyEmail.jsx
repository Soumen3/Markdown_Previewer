import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { authService } from '../services/auth'
import { useToast } from '../hooks/useToast'

function VerifyEmail() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  // Extract verification parameters from URL
  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !secret) {
        setError('Invalid verification link. Please check your email and try again.')
        setIsLoading(false)
        return
      }

      try {
        await authService.verifyEmail(userId, secret)
        setIsVerified(true)
        toast.success('Email verified successfully! Welcome to MarkdownPreview.')
      } catch (error) {
        console.error('Email verification error:', error)
        if (error.message.includes('expired')) {
          setError('This verification link has expired. Please request a new verification email.')
        } else if (error.message.includes('invalid')) {
          setError('Invalid verification link. Please check your email and try again.')
        } else {
          setError(error.message || 'Failed to verify email. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [userId, secret, toast])

  const handleResendVerification = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify-email`
      await authService.sendEmailVerification(verificationUrl)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.')
    }
  }

  const handleContinue = () => {
    navigate('/login')
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-top duration-700 delay-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-in zoom-in duration-500 delay-300 hover:scale-110 transition-transform cursor-pointer shadow-lg hover:shadow-xl">
            <span className="text-white font-bold text-xl sm:text-2xl">M</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            {isVerified ? (
              <>
                {/* Success State */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Email Verified Successfully!
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Your email has been verified. You can now access all features of MarkdownPreview.
                  </p>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Continue to login
                </button>
              </>
            ) : (
              <>
                {/* Error State */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Verification Failed
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {error}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleResendVerification}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Resend Verification
                  </button>
                  
                  <button
                    onClick={handleBackToLogin}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

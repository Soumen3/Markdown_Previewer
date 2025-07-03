import React, { useState, useEffect } from 'react'
import { authService } from '../services/auth'
import { useToast } from '../hooks/useToast'

function EmailVerificationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const isVerified = await authService.isEmailVerified()
        const dismissed = localStorage.getItem('emailVerificationDismissed') === 'true'
        
        if (!isVerified && !dismissed) {
          setIsVisible(true)
        }
      } catch (error) {
        // User might not be logged in
        console.debug('Could not check email verification status:', error)
      }
    }

    checkVerificationStatus()
  }, [])

  const handleResendVerification = async () => {
    setIsSending(true)
    try {
      const verificationUrl = `${window.location.origin}/verify-email`
      await authService.sendEmailVerification(verificationUrl)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem('emailVerificationDismissed', 'true')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-yellow-800 dark:text-yellow-200">
              <span className="md:hidden">
                Please verify your email address.
              </span>
              <span className="hidden md:inline">
                Please verify your email address to access all features and secure your account.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <button
              onClick={handleResendVerification}
              disabled={isSending}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 flex p-2 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationBanner

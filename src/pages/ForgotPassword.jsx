import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { ForgotPasswordForm } from '../components/forms'
import { authService } from '../services/auth'
import { useToast } from '../hooks/useToast'

function ForgotPassword() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    
    try {
      console.log('Password reset request:', { email: formData.email })
      
      // Construct the reset URL that will be sent in the email
      const resetUrl = `${window.location.origin}/reset-password`
      
      // Send password reset email using AuthService
      await authService.forgotPassword(formData.email, resetUrl)
      
      console.log('Password reset email sent successfully')
      
      // Update UI to show success state
      setEmailSent(true)
      setSentEmail(formData.email)
      
      toast.success('Password reset link sent to your email!')
      
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!sentEmail) return
    
    setIsLoading(true)
    
    try {
      const resetUrl = `${window.location.origin}/reset-password`
      await authService.forgotPassword(sentEmail, resetUrl)
      
      toast.success('Password reset link sent again!')
      
    } catch (error) {
      console.error('Resend email error:', error)
      toast.error(error.message || 'Failed to resend email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-top duration-700 delay-200">
        {/* Back to Login Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:translate-x-1"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>
        </div>
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center animate-in zoom-in duration-500 delay-300 hover:scale-110 transition-transform cursor-pointer shadow-lg hover:shadow-xl">
            <span className="text-white font-bold text-xl sm:text-2xl">M</span>
          </div>
        </div>
        
        {!emailSent ? (
          <>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-600 delay-400">
              Forgot your password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 px-2 animate-in fade-in duration-500 delay-500">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-600 delay-400">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 px-2 animate-in fade-in duration-500 delay-500">
              We've sent a password reset link to{' '}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {sentEmail}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom duration-700 delay-600">
        {!emailSent ? (
          <ForgotPasswordForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 animate-in slide-in-from-bottom duration-700 delay-700">
            {/* Success Message */}
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Email sent successfully!
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Resend Email'
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Links */}
        <div className="mt-6 animate-in slide-in-from-bottom duration-500 delay-1300">
          <div className="text-center px-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:underline hover:scale-105 inline-block"
              >
                Sign in here
              </button>
            </span>
          </div>
          <div className="text-center px-2 mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:underline hover:scale-105 inline-block"
              >
                Sign up for free
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

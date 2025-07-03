import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { ResetPasswordForm } from '../components/forms'
import { authService } from '../services/auth'
import { useToast } from '../hooks/useToast'

function ResetPassword() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token: urlToken } = useParams() // Get token from URL path
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const { toast } = useToast()

  // Extract token parameters from URL
  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')
  const expire = searchParams.get('expire')
  
  // Also check for other possible Appwrite formats
  const token = searchParams.get('token') || urlToken // Check both query param and URL path
  const code = searchParams.get('code')
  
  // Get the full URL for debugging
  const fullUrl = window.location.href

  useEffect(() => {
    // Validate the reset token parameters
    const validateToken = async () => {
      console.log('Full URL:', fullUrl)
      console.log('All search params:', Object.fromEntries(searchParams.entries()))
      console.log('Validating token with params:', { userId, secret, expire, token, code })
      
      // Check if we have the standard format (userId, secret, expire)
      if (userId && secret && expire) {
        // Check if the token has expired
        // The expire parameter can be in different formats
        let expireTime
        const currentTime = Date.now()
        
        // Try to parse as a date string first (like "2025-07-02 22:16:22.062")
        if (isNaN(parseInt(expire)) || expire.includes('-') || expire.includes(':')) {
          // It's a date string - handle timezone carefully
          
          // Parse the date components manually to treat as local time
          const dateMatch = expire.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.?(\d{3})?/)
          
          if (dateMatch) {
            const [, year, month, day, hour, minute, second, ms] = dateMatch
            
            // Try both local time and UTC parsing to see which makes sense
            const localDate = new Date(
              parseInt(year),
              parseInt(month) - 1, // Month is 0-indexed
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second),
              parseInt(ms || 0)
            )
            
            // Also try as UTC
            const utcDate = new Date(Date.UTC(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second),
              parseInt(ms || 0)
            ))
            
            const now = Date.now()
            const localTime = localDate.getTime()
            const utcTime = utcDate.getTime()
            
            // Choose the interpretation that results in a future time, if possible
            if (localTime > now && utcTime <= now) {
              // Local time is in future, UTC is expired - use local
              expireTime = localTime
            } else if (utcTime > now && localTime <= now) {
              // UTC is in future, local is expired - use UTC
              expireTime = utcTime
            } else if (localTime > now && utcTime > now) {
              // Both are in future - use the one that's closer to current time
              const localDiff = localTime - now
              const utcDiff = utcTime - now
              expireTime = localDiff < utcDiff ? localTime : utcTime
            } else {
              // Both are expired or neither makes sense - default to UTC (Appwrite likely uses UTC)
              expireTime = utcTime
            }
          } else {
            // Fallback to normal parsing
            expireTime = new Date(expire).getTime()
          }
        } else {
          // It's a numeric timestamp
          let numericExpire = parseInt(expire)
          
          // If expire seems to be in seconds (timestamp around 2025 would be ~1700000000 in seconds)
          // Convert to milliseconds if it looks like seconds
          if (numericExpire < 10000000000) { // Less than year 2286 in seconds = likely seconds
            expireTime = numericExpire * 1000
          } else {
            expireTime = numericExpire
          }
        }
        
        console.log('Expiration check:', { 
          originalExpire: expire,
          expireTime, 
          currentTime, 
          expired: currentTime > expireTime,
          expireDate: new Date(expireTime).toISOString(),
          currentDate: new Date(currentTime).toISOString(),
          isDateString: expire.includes('-') || expire.includes(':')
        })
        
        if (isNaN(expireTime)) {
          console.error('Could not parse expiration time:', expire)
          toast.error('Invalid expiration time in reset link. Please request a new password reset.')
          setIsValidating(false)
          setIsValidToken(false)
          return
        }
        
        if (currentTime > expireTime) {
          console.error('Reset token has expired')
          toast.error('This password reset link has expired. Please request a new one.')
          setIsValidating(false)
          setIsValidToken(false)
          return
        }

        // Token appears valid
        console.log('Reset token validation successful (standard format)')
        setIsValidToken(true)
        setIsValidating(false)
        return
      }
      
      // Check if we have alternative token formats
      if (token || code) {
        console.log('Found alternative token format')
        // For now, assume it's valid - we'll validate when submitting
        setIsValidToken(true)
        setIsValidating(false)
        return
      }
      
      // Check if the URL itself contains a token (like the long string you provided)
      const pathname = window.location.pathname
      const hash = window.location.hash
      
      if (pathname.length > '/reset-password'.length || hash) {
        console.log('Found token in pathname or hash:', { pathname, hash })
        // Assume it's valid for now
        setIsValidToken(true)
        setIsValidating(false)
        return
      }
      
      // No valid token found
      console.error('Missing required reset parameters:', { 
        userId: !!userId, 
        secret: !!secret, 
        expire: !!expire,
        token: !!token,
        code: !!code,
        pathname,
        hash
      })
      toast.error('Invalid or incomplete reset link. Please request a new password reset.')
      setIsValidating(false)
      setIsValidToken(false)
    }

    validateToken()
  }, [userId, secret, expire, token, code, fullUrl, searchParams, urlToken]) // Added urlToken

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    
    try {
      console.log('Password reset attempt with available params:', { 
        userId, secret, token, code, 
        hasUserId: !!userId, 
        hasSecret: !!secret 
      })
      
      // Try different approaches based on available parameters
      if (userId && secret) {
        // Standard format
        console.log('Using standard format (userId + secret)')
        await authService.resetPassword(userId, secret, formData.password)
      } else if (token) {
        // Try with token parameter - might need to modify auth service
        console.log('Attempting with token parameter:', token.substring(0, 20) + '...')
        // For now, this might fail - we may need to modify the auth service
        toast.error('This reset link format is not yet fully supported. Please try requesting a new password reset from our forgot password page.')
        return
      } else if (code) {
        // Try with code parameter
        console.log('Attempting with code parameter')
        toast.error('This reset link format is not yet fully supported. Please try requesting a new password reset from our forgot password page.')
        return
      } else {
        throw new Error('No valid reset parameters found.')
      }
      
      console.log('Password reset successful')
      
      // Update UI to show success state
      setPasswordReset(true)
      
      toast.success('Password updated successfully! You can now sign in with your new password.')
      
    } catch (error) {
      console.error('Reset password error:', error)
      
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        toast.error('This password reset link has expired or is invalid. Please request a new one.')
      } else if (error.message.includes('not yet implemented')) {
        toast.error('This reset link format is not supported. Please request a new password reset from the forgot password page.')
      } else {
        toast.error(error.message || 'Failed to reset password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleRequestNewReset = () => {
    navigate('/forgot-password')
  }

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Validating reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state for invalid token
  if (!isValidToken) {
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
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Reset Link Not Compatible
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This reset link appears to be invalid or expired. Please request a new password reset link.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleRequestNewReset}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Request New Reset
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
        
        {!passwordReset ? (
          <>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-600 delay-400">
              Set new password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 px-2 animate-in fade-in duration-500 delay-500">
              Please enter your new password below. Make sure it's strong and secure.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-in slide-in-from-bottom duration-600 delay-400">
              Password updated!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 px-2 animate-in fade-in duration-500 delay-500">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom duration-700 delay-600">
        {!passwordReset ? (
          <ResetPasswordForm 
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
                  Password updated successfully!
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Your password has been changed. You can now sign in to your account with your new password.
                </p>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleBackToLogin}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Link */}
        {!passwordReset && (
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
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

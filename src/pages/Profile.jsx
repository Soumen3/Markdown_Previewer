import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authService } from '../services/auth'
import Header from '../components/Header'
import EmailVerificationBanner from '../components/EmailVerificationBanner'

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateProfile, deleteAccount } = useAuth()
  const { toast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCheckingVerification, setIsCheckingVerification] = useState(true)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const verified = await authService.isEmailVerified()
        setIsEmailVerified(verified)
      } catch (error) {
        console.error('Error checking email verification:', error)
      } finally {
        setIsCheckingVerification(false)
      }
    }

    checkEmailVerification()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Only allow name changes, email is read-only
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (isUpdating) return

    setIsUpdating(true)
    try {
      // Only update the name, not the email
      await updateProfile({ name: formData.name })
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (isDeleting) return
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your documents.'
    )
    
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      await deleteAccount()
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendVerificationEmail = async () => {
    if (isSendingVerification) return

    setIsSendingVerification(true)
    try {
      const verificationUrl = `${window.location.origin}/verify-email`
      await authService.sendEmailVerification(verificationUrl)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Error sending verification email:', error)
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '' // Keep email but it won't be editable
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Please log in to view your profile
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <EmailVerificationBanner />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Member since {new Date(user.$createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Read-only)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled={true}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email address cannot be changed for security reasons. Contact support if you need to change your email.
              </p>
              
              {/* Email Verification Status */}
              <div className="mt-3 p-3 rounded-lg border">
                {isCheckingVerification ? (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Checking verification status...
                  </div>
                ) : isEmailVerified ? (
                  <div className="flex items-center text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Email verified
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start">
                      <svg className="h-4 w-4 mt-0.5 mr-2 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Email not verified. Please verify your email to access all features.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendVerificationEmail}
                          disabled={isSendingVerification}
                          className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingVerification ? 'Sending...' : 'Send verification email'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Delete Account Button */}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Profile Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Account Created</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {new Date(user.$createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">Last Updated</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {new Date(user.$updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

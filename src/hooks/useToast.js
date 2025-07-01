import { useToast as useToastContext } from '../contexts/ToastContext'

/**
 * Enhanced toast hook with authentication-specific notifications
 */
export const useToast = () => {
  const { toast, ...contextValue } = useToastContext()

  // Enhanced toast methods with better defaults for auth actions
  const authToast = {
    ...toast,
    
    // Authentication success messages
    loginSuccess: (userName) => {
      return toast.success(`Welcome back, ${userName}! 👋`, {
        title: 'Login Successful',
        duration: 4000
      })
    },
    
    signupSuccess: (userName) => {
      return toast.success(`Welcome to MarkdownPreview, ${userName}! 🎉`, {
        title: 'Account Created Successfully',
        duration: 5000
      })
    },
    
    logoutSuccess: (userName) => {
      return toast.success(`Goodbye, ${userName}! See you soon! 👋`, {
        title: 'Logged Out Successfully',
        duration: 3000
      })
    },
    
    // Authentication loading messages
    loginLoading: () => {
      return toast.loading('Signing you in...')
    },
    
    signupLoading: () => {
      return toast.loading('Creating your account...')
    },
    
    logoutLoading: () => {
      return toast.loading('Signing you out...')
    },
    
    // Authentication error messages
    loginError: (message) => {
      return toast.error(message, {
        title: 'Login Failed',
        duration: 6000
      })
    },
    
    signupError: (message) => {
      return toast.error(message, {
        title: 'Registration Failed',
        duration: 6000
      })
    },
    
    logoutError: () => {
      return toast.error('Failed to logout. Please try again.', {
        title: 'Logout Failed',
        duration: 5000
      })
    },
    
    // OAuth messages
    googleRedirect: (action = 'sign in') => {
      return toast.info(`Redirecting to Google...`, {
        title: `Google ${action === 'signup' ? 'Sign Up' : 'Sign In'}`,
        duration: 3000
      })
    },
    
    githubRedirect: (action = 'sign in') => {
      return toast.info(`Redirecting to GitHub...`, {
        title: `GitHub ${action === 'signup' ? 'Sign Up' : 'Sign In'}`,
        duration: 3000
      })
    },
    
    // General app notifications
    fileCreated: (fileName) => {
      return toast.success(`"${fileName}" created successfully! ✨`, {
        title: 'File Created',
        duration: 3000
      })
    },
    
    fileSaved: (fileName) => {
      return toast.success(`"${fileName}" saved! 💾`, {
        title: 'File Saved',
        duration: 2000
      })
    },
    
    fileDeleted: (fileName) => {
      return toast.warning(`"${fileName}" moved to trash`, {
        title: 'File Deleted',
        duration: 4000
      })
    },
    
    connectionError: () => {
      return toast.error('Connection lost. Please check your internet connection.', {
        title: 'Connection Error',
        duration: 0 // Persistent until manually closed
      })
    },
    
    featureComingSoon: (feature) => {
      return toast.info(`${feature} is coming soon! 🚀`, {
        title: 'Feature Preview',
        duration: 3000
      })
    }
  }

  return {
    ...contextValue,
    toast: authToast,
    removeToast: contextValue.removeToast, // Explicitly expose removeToast
    clearToasts: contextValue.clearToasts  // Explicitly expose clearToasts
  }
}

export default useToast

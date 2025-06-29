import { createSlice } from '@reduxjs/toolkit'

// Helper function to get initial theme from localStorage
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark'
  }
  return false // Default to light mode
}

const initialState = {
  isDark: getInitialTheme(),
  mounted: false,
  isMobileMenuOpen: false,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMounted: (state) => {
      state.mounted = true
    },
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      
      // Update localStorage and DOM
      if (typeof window !== 'undefined') {
        const newTheme = state.isDark ? 'dark' : 'light'
        localStorage.setItem('theme', newTheme)
        
        if (state.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload
      
      // Update localStorage and DOM
      if (typeof window !== 'undefined') {
        const theme = action.payload ? 'dark' : 'light'
        localStorage.setItem('theme', theme)
        
        if (action.payload) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false
    },
  },
})

// Action creators are generated for each case reducer function
export const { setMounted, toggleTheme, setTheme, toggleMobileMenu, closeMobileMenu } = themeSlice.actions

// Selectors
export const selectIsDark = (state) => state.theme.isDark
export const selectMounted = (state) => state.theme.mounted
export const selectIsMobileMenuOpen = (state) => state.theme.isMobileMenuOpen

export default themeSlice.reducer

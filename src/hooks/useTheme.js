import { useSelector, useDispatch } from 'react-redux'
import { 
  selectIsDark, 
  selectMounted, 
  selectIsMobileMenuOpen,
  toggleTheme, 
  setTheme,
  toggleMobileMenu,
  closeMobileMenu
} from '../features/theme/themeSlice'

export const useTheme = () => {
  const dispatch = useDispatch()
  const isDark = useSelector(selectIsDark)
  const mounted = useSelector(selectMounted)
  const isMobileMenuOpen = useSelector(selectIsMobileMenuOpen)

  const toggle = () => {
    dispatch(toggleTheme())
  }

  const setDarkMode = (isDarkMode) => {
    dispatch(setTheme(isDarkMode))
  }

  const toggleMobileMenuAction = () => {
    dispatch(toggleMobileMenu())
  }

  const closeMobileMenuAction = () => {
    dispatch(closeMobileMenu())
  }

  return {
    isDark,
    mounted,
    isMobileMenuOpen,
    toggle,
    setDarkMode,
    toggleMobileMenu: toggleMobileMenuAction,
    closeMobileMenu: closeMobileMenuAction,
    theme: isDark ? 'dark' : 'light'
  }
}

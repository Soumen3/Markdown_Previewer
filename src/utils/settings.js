/**
 * Simple settings manager for application preferences
 */

const SETTINGS_KEY = 'markdownPreview_settings'

const defaultSettings = {
  autoSave: true,
  autoSaveDelay: 3000, // milliseconds
  theme: 'system', // 'light', 'dark', 'system'
  editorFontSize: 14,
  previewFontSize: 16,
  wordWrap: true,
  lineNumbers: false
}

export const getSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.warn('Failed to load settings:', error)
  }
  return defaultSettings
}

export const saveSetting = (key, value) => {
  try {
    const current = getSettings()
    const updated = { ...current, [key]: value }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Failed to save setting:', error)
    return getSettings()
  }
}

export const saveSettings = (settings) => {
  try {
    const updated = { ...getSettings(), ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('Failed to save settings:', error)
    return getSettings()
  }
}

export const resetSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY)
    return defaultSettings
  } catch (error) {
    console.error('Failed to reset settings:', error)
    return getSettings()
  }
}

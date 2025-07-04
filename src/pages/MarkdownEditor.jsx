import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { useMarkdownOperations } from '../hooks/useMarkdownOperations'
import { getSettings } from '../utils/settings'
import {
  loadDocument,
  saveDocument,
  setMarkdownText,
  setHtmlPreview,
  setFileName,
  setViewMode,
  setIsPreviewMode,
  setIsFullscreen,
  clearErrors,
  loadFromLocalStorage,
  selectMarkdownText,
  selectHtmlPreview,
  selectFileName,
  selectViewMode,
  selectIsPreviewMode,
  selectIsFullscreen,
  selectIsLoading,
  selectIsSaving,
  selectLastSaved,
  selectHasUnsavedChanges,
  selectLoadError,
  selectSaveError,
  selectCurrentFileId
} from '../features/editor/editorSlice'
import Header from '../components/Header'
import EditorHeader from '../components/Editor/EditorHeader'
import EditorToolbar from '../components/Editor/EditorToolbar'
import EditorLayout from '../components/Editor/EditorLayout'
import PreviewModeInfo from '../components/Editor/PreviewModeInfo'

const MarkdownEditor = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { fileId } = useParams()
  const dispatch = useDispatch()
  const textareaRef = useRef(null)
  const hasLoadedRef = useRef(false)
  const hasFailedRef = useRef(false) // Track failed attempts to prevent retries
  const autoSaveTimeoutRef = useRef(null)
  const lastAutoSaveRef = useRef(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '', 'saving', 'saved', 'failed'
  const [settings, setSettings] = useState(getSettings())
  
  // Auto-save configuration from settings
  const AUTO_SAVE_DELAY = settings.autoSaveDelay || 3000
  const AUTO_SAVE_INTERVAL = 30000 // Maximum 30 seconds between saves
  
  // Redux selectors - Get state from Redux store
  const markdownText = useSelector(selectMarkdownText)
  const htmlPreview = useSelector(selectHtmlPreview)
  const fileName = useSelector(selectFileName)
  const viewMode = useSelector(selectViewMode)
  const isPreviewMode = useSelector(selectIsPreviewMode)
  const isFullscreen = useSelector(selectIsFullscreen)
  const isLoading = useSelector(selectIsLoading)
  const isSaving = useSelector(selectIsSaving)
  const lastSaved = useSelector(selectLastSaved)
  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges)
  const loadError = useSelector(selectLoadError)
  const saveError = useSelector(selectSaveError)
  const currentFileId = useSelector(selectCurrentFileId)

  // Use the markdown operations hook for toolbar functionality
  const { insertMarkdown } = useMarkdownOperations(textareaRef, (text) => dispatch(setMarkdownText(text)))

  // Auto-save function
  const performAutoSave = async (isIntervalSave = false) => {
    // Don't auto-save if user is not logged in or if there's no content to save
    if (!user || !user.$id || !markdownText.trim()) {
      return
    }

    // Don't auto-save if we're currently saving or if there are no unsaved changes
    if (isSaving || !hasUnsavedChanges) {
      return
    }

    // Don't auto-save for new documents that haven't been manually saved yet
    if (!currentFileId && fileId === 'new') {
      return
    }

    try {
      setAutoSaveStatus('saving')
      
      const result = await dispatch(saveDocument({
        fileId: currentFileId || fileId,
        title: fileName,
        content: markdownText,
        userId: user.$id,
        isAutoSave: true // Flag to indicate this is an auto-save
      })).unwrap()
      
      // Navigate to new URL if it was a new document (shouldn't happen in auto-save, but just in case)
      if (result.newFileId) {
        navigate(`/editor/${result.newFileId}`, { replace: true })
      }
      
      lastAutoSaveRef.current = Date.now()
      setAutoSaveStatus('saved')
      
      // Clear the saved status after a few seconds
      setTimeout(() => {
        setAutoSaveStatus('')
      }, 2000)
      
      // No toast notification for auto-save - status indicator is sufficient
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('failed')
      
      // Clear the failed status after a few seconds
      setTimeout(() => {
        setAutoSaveStatus('')
      }, 3000)
      
      // Don't show error toast for auto-save failures to avoid spamming user
    }
  }

  // Configure marked options for better rendering
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true,    // GitHub Flavored Markdown
    headerIds: false, // Disable header IDs for security
    sanitize: false   // We'll use DOMPurify for sanitization
  })

  // Effect to update the HTML preview whenever markdownText changes
  useEffect(() => {
    try {
      // Parse Markdown to HTML using synchronous marked.parse()
      const rawHtml = marked.parse(markdownText || '')
      
      // Sanitize the HTML to prevent XSS attacks
      const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's', 'del',
          'a', 'img', 'code', 'pre',
          'ul', 'ol', 'li',
          'blockquote', 'hr',
          'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
        ALLOW_DATA_ATTR: false
      })
      dispatch(setHtmlPreview(sanitizedHtml))
    } catch (error) {
      console.error("Markdown parsing or sanitization failed:", error)
      dispatch(setHtmlPreview("<p>Error rendering Markdown.</p>"))
    }
  }, [markdownText, dispatch])

  // Handle changes in the textarea
  const handleInputChange = (event) => {
    dispatch(setMarkdownText(event.target.value))
  }

  // Auto-save effect - triggers auto-save when content changes
  useEffect(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Don't set up auto-save if disabled, empty content, or user not logged in
    if (!settings.autoSave || !markdownText.trim() || !user || !user.$id) {
      return
    }

    // Set up delayed auto-save (debounced)
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave()
    }, AUTO_SAVE_DELAY)

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [markdownText, fileName, user, currentFileId, fileId, hasUnsavedChanges, isSaving, settings.autoSave, AUTO_SAVE_DELAY])

  // Interval-based auto-save effect - ensures saves happen even during continuous editing
  useEffect(() => {
    if (!settings.autoSave) {
      return
    }

    const intervalSave = setInterval(() => {
      const now = Date.now()
      const timeSinceLastSave = now - (lastAutoSaveRef.current || 0)
      
      // If it's been more than AUTO_SAVE_INTERVAL since last save, perform auto-save
      if (timeSinceLastSave >= AUTO_SAVE_INTERVAL && hasUnsavedChanges && user && user.$id) {
        performAutoSave(true)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(intervalSave)
  }, [hasUnsavedChanges, user, settings.autoSave])

  // Effect to handle save errors (load errors are handled in the loadDoc function)
  // This provides more specific error handling and navigation control
  useEffect(() => {
    if (saveError) {
      toast.error('Failed to save file: ' + saveError)
      dispatch(clearErrors())
    }
  }, [saveError, toast, dispatch])

  // Load document effect - handles initial document loading with specific business logic:
  // - fileId === "new": Opens a new markdown editor with sample content
  // - fileId exists: Searches for the document in database under the logged-in user
  // - Document found: Opens the file
  // - Document not found or no permission: Returns to dashboard with error message

  // Load document effect - handles initial document loading
  useEffect(() => {
    const loadDoc = async () => {
      const currentKey = `${fileId || 'new'}-${user?.$id || 'anonymous'}`
      if (hasLoadedRef.current === currentKey || hasFailedRef.current === currentKey) {
        return
      }
      
      // Case 1: New document - open empty editor with sample content
      if (fileId === 'new' || !fileId) {
        try {
          await dispatch(loadDocument({ 
            fileId: 'new', 
            userId: user?.$id || null 
          })).unwrap()
          hasLoadedRef.current = currentKey
        } catch (error) {
          console.error('Failed to create new document:', error)
          hasFailedRef.current = currentKey // Prevent retry
        }
        return
      }
      
      // Case 2: Existing document - must be logged in
      if (!user || !user.$id) {
        toast.error('You must be logged in to access saved documents')
        hasFailedRef.current = currentKey // Prevent retry
        navigate('/login')
        return
      }

      try {
        // Try to load the specific document for the logged-in user
        await dispatch(loadDocument({ 
          fileId, 
          userId: user.$id 
        })).unwrap()
        
        // If successful, document was found and loaded
        hasLoadedRef.current = currentKey
      } catch (error) {
        console.error('Failed to load document:', error)
        
        // Mark as failed to prevent retries
        hasFailedRef.current = currentKey
        
        // Check if it's a permission/not found error
        if (error.includes('permission') || error.includes('not found') || error.includes('does not exist')) {
          toast.error('Document not found or you do not have access to it')
        } else {
          // Other errors (network, server, etc.)
          toast.error('Failed to load document: ' + error)
        }
        
        // Navigate to dashboard after showing error
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000) // Small delay to ensure user sees the toast
      }
    }
    
    // Reset refs when fileId or user changes
    if (hasLoadedRef.current && hasLoadedRef.current !== `${fileId || 'new'}-${user?.$id || 'anonymous'}`) {
      hasLoadedRef.current = false
      hasFailedRef.current = false
    }
    
    loadDoc()
  }, [fileId, user?.$id, dispatch, toast, navigate])

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts when Ctrl/Cmd is pressed and not in an input field
      if ((event.ctrlKey || event.metaKey) && !event.target.matches('input, textarea')) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            dispatch(setViewMode('editor'))
            break
          case '2':
            event.preventDefault()
            dispatch(setViewMode('split'))
            break
          case '3':
            event.preventDefault()
            dispatch(setViewMode('preview'))
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  // Handle file name changes
  const handleFileNameChange = (newName) => {
    dispatch(setFileName(newName))
  }

  // Save functionality using Redux thunk
  const handleSave = async () => {
    if (!user || !user.$id) {
      toast.error('You must be logged in to save documents')
      return
    }

    try {
      // Clear auto-save status when manually saving
      setAutoSaveStatus('')
      
      const result = await dispatch(saveDocument({
        fileId: currentFileId || fileId,
        title: fileName,
        content: markdownText,
        userId: user.$id
      })).unwrap()
      
      // Navigate to new URL if it was a new document
      if (result.newFileId) {
        navigate(`/editor/${result.newFileId}`, { replace: true })
      }
      
      toast.fileSaved(fileName)
    } catch (error) {
      console.error('Save failed:', error)
      // Error is handled in the slice and shown via useEffect above
    }
  }

  // Load content from file upload or localStorage as backup
  const handleLoad = async (fileContent = null, fileName = null) => {
    try {
      if (fileContent && fileName) {
        // File upload case
        dispatch(setMarkdownText(fileContent))
        // Extract name without extension for display
        const nameWithoutExt = fileName.replace(/\.(md|markdown|txt)$/i, '')
        dispatch(setFileName(nameWithoutExt))
        // Don't show confirmation toast here - it's shown in the toolbar component
      } else {
        // LocalStorage backup case
        if (!confirm('This will replace your current content with data from local storage. Continue?')) {
          return
        }
        
        const savedContent = localStorage.getItem('markdownContent')
        const savedFileName = localStorage.getItem('markdownFileName')
        
        if (savedContent) {
          dispatch(loadFromLocalStorage({
            content: savedContent,
            fileName: savedFileName
          }))
          toast.success('Content loaded from local storage!')
        } else {
          toast.info('No local backup found!')
        }
      }
    } catch (error) {
      console.error('Load failed:', error)
      toast.error('Failed to load content')
    }
  }

  // Cleanup effect - clear auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <div className={`h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Main Header - hidden in fullscreen mode */}
      {!isFullscreen && <Header />}
      
      {/* Editor Header - contains file name, view controls, save button */}
      <EditorHeader
        fileName={fileName}
        handleFileNameChange={handleFileNameChange}
        lastSaved={lastSaved}
        formatDate={formatDate}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={(value) => dispatch(setIsPreviewMode(value))}
        viewMode={viewMode}
        setViewMode={(value) => dispatch(setViewMode(value))}
        isFullscreen={isFullscreen}
        setIsFullscreen={(value) => dispatch(setIsFullscreen(value))}
        handleSave={handleSave}
        isSaving={isSaving}
        user={user}
        autoSaveStatus={autoSaveStatus}
        hasUnsavedChanges={hasUnsavedChanges}
        autoSaveEnabled={settings.autoSave}
        onAutoSaveToggle={(enabled) => {
          const newSettings = { ...settings, autoSave: enabled }
          setSettings(newSettings)
          // Save to localStorage
          import('../utils/settings').then(({ saveSettings }) => {
            saveSettings(newSettings)
          })
        }}
      />

      {/* Toolbar - markdown formatting buttons and utility actions */}
      <EditorToolbar
        insertMarkdown={insertMarkdown}
        handleLoad={handleLoad}
        markdownText={markdownText}
        toast={toast}
      />

      {/* Preview Mode Info - shown when in preview-only mode */}
      {viewMode === 'preview' && <PreviewModeInfo />}
      
      {/* Main Editor Area - contains the editor and preview panes */}
      <EditorLayout
        viewMode={viewMode}
        isPreviewMode={isPreviewMode}
        textareaRef={textareaRef}
        markdownText={markdownText}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        htmlPreview={htmlPreview}
      />
    </div>
  )
}

export default MarkdownEditor

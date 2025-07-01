import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { useMarkdownOperations } from '../hooks/useMarkdownOperations'
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

  // Effect to handle errors and show toast notifications
  useEffect(() => {
    if (loadError) {
      toast.error('Failed to load document: ' + loadError)
      dispatch(clearErrors())
    }
    if (saveError) {
      toast.error('Failed to save file: ' + saveError)
      dispatch(clearErrors())
    }
  }, [loadError, saveError, toast, dispatch])

  // Load document effect - handles initial document loading
  useEffect(() => {
    const loadDoc = async () => {
      const currentKey = `${fileId || 'new'}-${user?.$id || 'anonymous'}`
      if (hasLoadedRef.current === currentKey) {
        return
      }
      
      // Check authentication for existing documents
      if (!user || !user.$id) {
        if (fileId && fileId !== 'new') {
          toast.error('You must be logged in to access documents')
          navigate('/login')
          return
        }
      }

      try {
        // Dispatch the async thunk to load the document
        await dispatch(loadDocument({ 
          fileId, 
          userId: user?.$id 
        })).unwrap()
      } catch (error) {
        console.error('Failed to load document:', error)
        // Error is handled in the slice and shown via useEffect above
      }
      
      hasLoadedRef.current = currentKey
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

  // Load content from localStorage as backup
  const handleLoad = async () => {
    if (!confirm('This will replace your current content with data from local storage. Continue?')) {
      return
    }
    
    try {
      // Load from localStorage only as a backup/recovery option
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
    } catch (error) {
      console.error('Load failed:', error)
      toast.error('Failed to load content')
    }
  }

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

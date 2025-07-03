import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { useMarkdownOperations } from '../hooks/useMarkdownOperations'
import { getSettings } from '../utils/settings'
import {
  setMarkdownText,
  setHtmlPreview,
  setFileName,
  setViewMode,
  setIsPreviewMode,
  setIsFullscreen,
  clearErrors,
  selectMarkdownText,
  selectHtmlPreview,
  selectFileName,
  selectViewMode,
  selectIsPreviewMode,
  selectIsFullscreen,
  selectIsLoading,
  selectHasUnsavedChanges
} from '../features/editor/editorSlice'
import Header from '../components/Header'
import EditorHeader from '../components/Editor/EditorHeader'
import EditorToolbar from '../components/Editor/EditorToolbar'
import EditorLayout from '../components/Editor/EditorLayout'
import PreviewModeInfo from '../components/Editor/PreviewModeInfo'

const DemoEditor = () => {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()
  const dispatch = useDispatch()
  const textareaRef = useRef(null)
  const hasLoadedRef = useRef(false)

  // Redux state
  const markdownText = useSelector(selectMarkdownText)
  const htmlPreview = useSelector(selectHtmlPreview)
  const fileName = useSelector(selectFileName)
  const viewMode = useSelector(selectViewMode)
  const isPreviewMode = useSelector(selectIsPreviewMode)
  const isFullscreen = useSelector(selectIsFullscreen)
  const isLoading = useSelector(selectIsLoading)
  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges)

  // Auto-save settings
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved')
  const autoSaveTimeoutRef = useRef(null)
  const autoSaveIntervalRef = useRef(null)

  // Markdown operations hook
  const markdownOperations = useMarkdownOperations(textareaRef)

  // Demo sample content
  const demoContent = `# Welcome to Markdown Live Preview Demo! 🎯

This is a **demo version** of our markdown editor where you can explore all features without creating an account.

> **💡 Pro Tip:** Try editing this content! All the toolbar features work, and you can see live preview as you type.

## ✨ What You Can Do Here:

### 🛠️ Full Editor Experience
- **Real-time preview** as you type
- **Rich toolbar** with formatting shortcuts
- **Multiple view modes:** Side-by-side, preview-only, or edit-only
- **Fullscreen mode** for distraction-free writing
- **Auto-save** to browser localStorage (demo only)

### 📝 Try These Features:

**Text Formatting:**
- Make text **bold** or *italic*
- Add ~~strikethrough~~ text
- Create \`inline code\` snippets

**Lists and Organization:**
1. Numbered lists work great
2. You can nest them too
   - Like this bullet point
   - And this one

**Code Blocks:**
\`\`\`javascript
// All syntax highlighting supported!
function greetUser(name) {
    console.log(\`Hello, \${name}! Welcome to our editor!\`);
}

greetUser("Developer");
\`\`\`

**Tables:**
| Feature | Demo Version | Full Version |
|---------|-------------|--------------|
| Real-time Preview | ✅ | ✅ |
| All Editor Tools | ✅ | ✅ |
| Save to Cloud | ❌ | ✅ |
| Export Options | ❌ | ✅ |
| File Management | ❌ | ✅ |
| Collaboration | ❌ | ✅ |

**Links and Images:**
- Add [links like this](https://example.com)
- Embed images (upload feature available after signup)

## 🚀 Ready to Unlock Full Features?

### What You Get When You Sign Up:
- 📁 **Unlimited document storage**
- 💾 **Cloud sync** across all devices  
- 📤 **Export** to PDF, HTML, and more
- 🎨 **Custom themes** and editor settings
- 🔄 **Version history** and document recovery
- 👥 **Sharing and collaboration** features
- 🔒 **Private and secure** document storage

### [👉 Sign Up Now - It's Free!](/signup)

---

**🎯 Demo Instructions:**
1. **Edit this text** - try changing anything you see
2. **Use the toolbar** - click any formatting button
3. **Switch views** - try the view mode buttons in the header
4. **Go fullscreen** - perfect for focused writing
5. **Check auto-save** - watch the status indicator in the header

*Happy writing! This demo gives you the full editor experience.* ✨`

  // Initialize with demo content
  useEffect(() => {
    if (!hasLoadedRef.current) {
      dispatch(setFileName('Demo Document'))
      dispatch(setMarkdownText(demoContent))
      hasLoadedRef.current = true
    }
  }, [dispatch, demoContent])

  // Update HTML preview when markdown changes
  useEffect(() => {
    if (markdownText !== undefined) {
      const processedHtml = DOMPurify.sanitize(marked(markdownText))
      dispatch(setHtmlPreview(processedHtml))
    }
  }, [markdownText, dispatch])

  // Auto-save simulation (saves to localStorage for demo)
  useEffect(() => {
    const settings = getSettings()
    if (settings.autoSave && autoSaveEnabled && markdownText && hasUnsavedChanges) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      setAutoSaveStatus('saving')

      // Debounced save (3 seconds after last change)
      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          // Save to localStorage for demo
          localStorage.setItem('demo-document', JSON.stringify({
            content: markdownText,
            fileName: fileName,
            lastSaved: new Date().toISOString()
          }))
          setAutoSaveStatus('saved')
        } catch (error) {
          setAutoSaveStatus('failed')
          console.error('Demo auto-save failed:', error)
        }
      }, 3000)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [markdownText, fileName, hasUnsavedChanges, autoSaveEnabled])

  // Periodic auto-save (every 30 seconds)
  useEffect(() => {
    const settings = getSettings()
    if (settings.autoSave && autoSaveEnabled) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (markdownText && hasUnsavedChanges) {
          try {
            localStorage.setItem('demo-document', JSON.stringify({
              content: markdownText,
              fileName: fileName,
              lastSaved: new Date().toISOString()
            }))
            setAutoSaveStatus('saved')
          } catch (error) {
            setAutoSaveStatus('failed')
            console.error('Demo periodic auto-save failed:', error)
          }
        }
      }, 30000) // 30 seconds

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current)
        }
      }
    }
  }, [markdownText, fileName, hasUnsavedChanges, autoSaveEnabled])

  // Handle text changes
  const handleTextChange = (value) => {
    dispatch(setMarkdownText(value))
  }

  // Handle save (demo version)
  const handleSave = async () => {
    try {
      setAutoSaveStatus('saving')
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.setItem('demo-document', JSON.stringify({
        content: markdownText,
        fileName: fileName,
        lastSaved: new Date().toISOString()
      }))
      
      setAutoSaveStatus('saved')
      toast.info('Demo document saved locally! Sign up to save to the cloud.')
    } catch (error) {
      setAutoSaveStatus('failed')
      toast.error('Failed to save demo document')
    }
  }

  // Handle export (show signup prompt)
  const handleExport = () => {
    toast.info('Sign up to export your documents to various formats!')
  }

  // Handle new document
  const handleNew = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Create a new document anyway?')
      if (!confirmed) return
    }
    
    dispatch(setMarkdownText(demoContent))
    dispatch(setFileName('Demo Document'))
    dispatch(clearErrors())
    setAutoSaveStatus('saved')
  }

  // Toggle auto-save
  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled)
    setAutoSaveStatus(autoSaveEnabled ? 'disabled' : 'saved')
  }

  // Handle file name change
  const handleFileNameChange = (event) => {
    dispatch(setFileName(event.target.value))
  }

  // Format date function for demo
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return ''
    }
  }

  // Demo-specific props for EditorHeader
  const demoEditorProps = {
    fileName,
    handleFileNameChange,
    lastSaved: null, // Demo doesn't track real save times  
    formatDate,
    isPreviewMode,
    setIsPreviewMode: (value) => dispatch(setIsPreviewMode(value)),
    viewMode,
    setViewMode: (value) => dispatch(setViewMode(value)),
    isFullscreen,
    setIsFullscreen: (value) => dispatch(setIsFullscreen(value)),
    handleSave,
    isSaving: autoSaveStatus === 'saving',
    user: null, // Demo mode has no user
    autoSaveStatus,
    hasUnsavedChanges,
    autoSaveEnabled,
    onAutoSaveToggle: toggleAutoSave
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Demo banner - only show if user is not logged in */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 text-center shadow-lg">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-medium flex items-center">
              <span className="mr-2">🎯</span>
              <span>Demo Mode Active - Try all features risk-free!</span>
            </span>
            <button 
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col h-screen">
        <EditorHeader {...demoEditorProps} isDemo={true} />
        
        {isPreviewMode && <PreviewModeInfo />}
        
        <EditorToolbar 
          onFormatting={markdownOperations.applyFormatting}
          onInsert={markdownOperations.insertElement}
          textareaRef={textareaRef}
        />
        
        <EditorLayout
          markdownText={markdownText}
          htmlPreview={htmlPreview}
          viewMode={viewMode}
          isPreviewMode={isPreviewMode}
          isFullscreen={isFullscreen}
          onTextChange={handleTextChange}
          onViewModeChange={(mode) => dispatch(setViewMode(mode))}
          onTogglePreviewMode={() => dispatch(setIsPreviewMode(!isPreviewMode))}
          onToggleFullscreen={() => dispatch(setIsFullscreen(!isFullscreen))}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  )
}

export default DemoEditor

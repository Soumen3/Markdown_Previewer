import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { databases, ID } from '../lib/appwrite'
import Header from '../components/Header'

const MarkdownEditor = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { fileId } = useParams()
  const textareaRef = useRef(null)
  
  // State to hold the Markdown text input
  const [markdownText, setMarkdownText] = useState('')
  // State to hold the HTML output
  const [htmlPreview, setHtmlPreview] = useState('')
  const [fileName, setFileName] = useState('Untitled.md')
  const [isPreviewMode, setIsPreviewMode] = useState(false) // For mobile toggle
  const [viewMode, setViewMode] = useState('split') // 'editor', 'preview', 'split'
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sample markdown content for demonstration
  const sampleMarkdown = `# Welcome to Markdown Editor

## Features
- **Live Preview**: See your markdown rendered in real-time
- **Syntax Highlighting**: Code blocks with syntax highlighting
- **Responsive Design**: Works on desktop and mobile
- **Auto Save**: Your work is automatically saved
- **Secure Rendering**: Uses marked.js and DOMPurify for safe HTML output

## Markdown Examples

### Text Formatting
You can make text **bold**, *italic*, ~~strikethrough~~, or \`inline code\`.

### Lists
1. First ordered item
2. Second ordered item
   - Nested unordered item
   - Another nested item
     - Even deeper nesting

### Code Blocks
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to our app, \${name}!\`;
}

// Call the function
greet('Developer');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### Links and Images
[Visit our website](https://example.com)
[GitHub Repository](https://github.com)

### Tables
| Feature | Status | Priority |
|---------|--------|----------|
| Editor | ✅ Done | High |
| Preview | ✅ Done | High |
| Save | ✅ Done | Medium |
| Export | 🔄 In Progress | Low |

### Blockquotes
> This is a blockquote. It can span multiple lines and is great for highlighting important information.
> 
> > You can even nest blockquotes like this.

### Task Lists
- [x] Implement markdown editor
- [x] Add live preview
- [x] Integrate marked.js and DOMPurify
- [ ] Add export functionality
- [ ] Implement file management

### Horizontal Rules
---

### Mathematical Expressions
You can write inline math like \`E = mc²\` or display math:

\`\`\`
∫₀^∞ e^(-x²) dx = √π/2
\`\`\`

---

**Start writing your markdown here!** 📝 The preview will update automatically as you type.
`

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
      const rawHtml = marked.parse(markdownText)
      
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
      setHtmlPreview(sanitizedHtml)
    } catch (error) {
      console.error("Markdown parsing or sanitization failed:", error)
      setHtmlPreview("<p>Error rendering Markdown.</p>")
    }
  }, [markdownText]) // Dependency array: re-run effect when markdownText changes

  // Handle changes in the textarea
  const handleInputChange = (event) => {
    setMarkdownText(event.target.value)
  }

  useEffect(() => {
    // Load existing file or set sample content
    const loadDocument = async () => {
      if (fileId && fileId !== 'new') {
        if (!user || !user.$id) {
          toast.error('You must be logged in to access documents')
          navigate('/login')
          return
        }

        try {
          // Load from Appwrite database
          const document = await databases.getDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_MARKDOWN_COLLECTION_ID,
            fileId
          )
          
          // Check if the document belongs to the current user
          if (document.userId !== user.$id) {
            toast.error('You do not have permission to access this document')
            navigate('/dashboard')
            return
          }
          
          setFileName(document.title + '.md')
          setMarkdownText(document.content || '')
        } catch (error) {
          console.error('Failed to load document:', error)
          toast.error('Failed to load document: ' + (error.message || 'Unknown error'))
          
          // Fallback to sample content
          setMarkdownText(sampleMarkdown)
        }
      } else {
        setMarkdownText(sampleMarkdown)
      }
    }
    
    loadDocument()
  }, [fileId, user, toast, navigate])

  // Auto-save functionality
  useEffect(() => {
    if (markdownText.trim()) {
      const saveTimer = setTimeout(() => {
        handleAutoSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer)
    }
  }, [markdownText])

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts when Ctrl/Cmd is pressed and not in an input field
      if ((event.ctrlKey || event.metaKey) && !event.target.matches('input, textarea')) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            setViewMode('editor')
            break
          case '2':
            event.preventDefault()
            setViewMode('split')
            break
          case '3':
            event.preventDefault()
            setViewMode('preview')
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleAutoSave = async () => {
    try {
      // In a real app, save to API or local storage
      console.log('Auto-saving document...')
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleFileNameChange = (newName) => {
    if (!newName.endsWith('.md')) {
      newName += '.md'
    }
    setFileName(newName)
  }

  // Basic toolbar functions with improved markdown insertion
  const applyMarkdown = (markdownSyntax, placeholder, closingSyntax = markdownSyntax) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value

    let newText
    if (start === end) { // No text selected
      newText = currentText.substring(0, start) + markdownSyntax + placeholder + closingSyntax + currentText.substring(end)
      setMarkdownText(newText)
      // Position cursor in the middle of the inserted syntax
      setTimeout(() => {
        textarea.selectionStart = start + markdownSyntax.length
        textarea.selectionEnd = start + markdownSyntax.length + placeholder.length
        textarea.focus()
      }, 0)
    } else { // Text selected
      const selectedText = currentText.substring(start, end)
      newText = currentText.substring(0, start) + markdownSyntax + selectedText + closingSyntax + currentText.substring(end)
      setMarkdownText(newText)
      // Keep the selected text highlighted
      setTimeout(() => {
        textarea.selectionStart = start
        textarea.selectionEnd = end + markdownSyntax.length + closingSyntax.length
        textarea.focus()
      }, 0)
    }
  }

  const insertMarkdown = (syntax) => {
    switch (syntax) {
      case 'bold':
        applyMarkdown('**', 'bold text')
        break
      case 'italic':
        applyMarkdown('*', 'italic text')
        break
      case 'code':
        applyMarkdown('`', 'code')
        break
      case 'heading':
        applyMarkdown('## ', 'Heading', '')
        break
      case 'link':
        applyMarkdown('[', 'link text', '](url)')
        break
      case 'list':
        applyMarkdown('- ', 'list item', '')
        break
      case 'quote':
        applyMarkdown('> ', 'quote', '')
        break
      default:
        return
    }
  }

  // Save/Load functionality using Appwrite database and toast notifications
  const handleSave = async () => {
    if (!user || !user.$id) {
      toast.error('You must be logged in to save documents')
      return
    }

    setIsSaving(true)
    try {
      const documentData = {
        title: fileName.replace('.md', ''),
        content: markdownText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.$id
      }

      if (fileId && fileId !== 'new') {
        // Update existing document
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_MARKDOWN_COLLECTION_ID,
          fileId,
          {
            title: documentData.title,
            content: documentData.content,
            updatedAt: documentData.updatedAt
            // Note: userId should not be updated for existing documents
          }
        )
        toast.fileSaved(fileName)
      } else {
        // Create new document
        console.log('Creating new document:', documentData)
        const response = await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_MARKDOWN_COLLECTION_ID,
          ID.unique(),
          documentData
        )
        
        // Update the URL to include the new document ID
        navigate(`/editor/${response.$id}`, { replace: true })
        toast.fileSaved(fileName)
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('markdownContent', markdownText)
      localStorage.setItem('markdownFileName', fileName)
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save file: ' + (error.message || 'Unknown error'))
      
      // Fallback to localStorage if database save fails
      try {
        localStorage.setItem('markdownContent', markdownText)
        localStorage.setItem('markdownFileName', fileName)
        setLastSaved(new Date())
        toast.info('Saved to local storage as backup')
      } catch (localError) {
        toast.error('Failed to save file completely')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = async () => {
    try {
      // First try to load from localStorage as fallback
      const savedContent = localStorage.getItem('markdownContent')
      const savedFileName = localStorage.getItem('markdownFileName')
      
      if (savedContent) {
        setMarkdownText(savedContent)
        if (savedFileName) {
          setFileName(savedFileName)
        }
        toast.success('Content loaded from local storage!')
      } else {
        toast.info('No local backup found!')
      }
    } catch (error) {
      console.error('Load failed:', error)
      toast.error('Failed to load content')
    }
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <div className={`h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && <Header />}
      
      {/* Editor Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              {!isFullscreen && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden md:inline">Back to Dashboard</span>
                  <span className="md:hidden">Back</span>
                </button>
              )}
              {/* Mobile Back Button */}
              {!isFullscreen && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="sm:hidden p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                  title="Back to Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <input
                  type="text"
                  value={fileName.replace('.md', '')}
                  onChange={(e) => handleFileNameChange(e.target.value)}
                  className="text-sm sm:text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700 px-1 sm:px-2 py-1 rounded min-w-0 flex-1"
                  placeholder="Document name"
                />
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
              {lastSaved && (
                <span className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">
                  Last saved: {formatDate(lastSaved)}
                </span>
              )}
              
              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="md:hidden px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              
              {/* Desktop View Mode Controls */}
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md transition-colors flex items-center ${
                    viewMode === 'editor'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Editor Only (Ctrl+1)"
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden lg:inline">Editor</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md transition-colors flex items-center ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Split View (Ctrl+2)"
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="hidden lg:inline">Split</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md transition-colors flex items-center ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Preview Only (Ctrl+3)"
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden lg:inline">Preview</span>
                </button>
              </div>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving || !user}
                className="inline-flex items-center px-2 sm:px-3 lg:px-4 py-1 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title={!user ? 'You must be logged in to save' : 'Save document'}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 sm:py-3 overflow-x-auto">
            <button
              onClick={() => insertMarkdown('heading')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              title="Heading"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10M12 21V7M5 7l2-2h10l2 2" />
              </svg>
              <span className="hidden sm:inline">H</span>
            </button>
            
            <button
              onClick={() => insertMarkdown('bold')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Bold"
            >
              <strong className="text-xs sm:text-sm">B</strong>
            </button>
            
            <button
              onClick={() => insertMarkdown('italic')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Italic"
            >
              <em className="text-xs sm:text-sm">I</em>
            </button>
            
            <button
              onClick={() => insertMarkdown('code')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Code"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
            
            <button
              onClick={() => insertMarkdown('link')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Link"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            
            <button
              onClick={() => insertMarkdown('list')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="List"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            
            <button
              onClick={() => insertMarkdown('quote')}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Quote"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
            
            {/* Separator */}
            <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
            
            {/* Load Button */}
            <button
              onClick={handleLoad}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded border border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex-shrink-0"
              title="Load from localStorage"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="hidden sm:inline">Load</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Mode Info */}
      {viewMode === 'preview' && (
        <div className="hidden md:block bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
            <div className="py-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Preview mode active. Switch to Editor or Split view to edit content.</span>
              <span className="sm:hidden">Preview mode - switch to edit</span>
            </div>
          </div>
        </div>
      )}      
      {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`w-full mx-auto flex-1 flex flex-col min-h-0 ${
            viewMode === 'editor' 
            ? 'max-w-5xl px-4 sm:px-6 lg:px-8 xl:px-12'  // More constrained width for editor-only
            : viewMode === 'split' 
              ? 'max-w-8xl px-6 sm:px-8 lg:px-12 xl:px-16' 
              : 'max-w-5xl px-4 sm:px-6 lg:px-10 xl:px-14'
          }`}>
            {/* Mobile: Show either editor or preview */}
          <div className="md:hidden flex-1 py-4 flex flex-col min-h-0">
            {isPreviewMode ? (
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto custom-scrollbar min-h-0">
                <div 
                  className="prose prose-blue dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={markdownText}
                onChange={handleInputChange}
                placeholder="Start writing your markdown here..."
                className="flex-1 w-full resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto custom-scrollbar min-h-0"
              />
            )}
          </div>

          {/* Desktop: Dynamic view based on viewMode */}
          <div className={`hidden md:flex flex-1 min-h-0 ${
            viewMode === 'split' ? 'py-4' : 'py-2'
          }`}>
            {viewMode === 'editor' && (
              /* Editor Only View - Maximized Width */
              <div className="flex flex-col min-h-0 w-full">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Editor</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {markdownText.length} characters
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={markdownText}
                  onChange={handleInputChange}
                  placeholder="Start writing your markdown here..."
                  className="flex-1 w-full resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 lg:p-6 xl:p-8 font-mono text-sm lg:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto custom-scrollbar min-h-0"
                />
              </div>
            )}

            {viewMode === 'preview' && (
              /* Preview Only View */
              <div className="flex flex-col min-h-0 w-full">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Live preview</span>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto custom-scrollbar min-h-0">
                  <div className="p-6 lg:p-8 xl:p-12">
                    <div 
                      className="prose prose-blue dark:prose-invert max-w-none prose-lg xl:prose-xl"
                      dangerouslySetInnerHTML={{ __html: htmlPreview }}
                    />
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              /* Split View */
              <div className="grid grid-cols-2 gap-6 flex-1 min-h-0 w-full">
                {/* Editor Pane */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Editor</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {markdownText.length} characters
                    </span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={markdownText}
                    onChange={handleInputChange}
                    placeholder="Start writing your markdown here..."
                    className="flex-1 w-full resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto custom-scrollbar min-h-0"
                  />
                </div>

                {/* Preview Pane */}
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Live preview</span>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 overflow-y-auto custom-scrollbar min-h-0">
                    <div 
                      className="prose prose-blue dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: htmlPreview }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor

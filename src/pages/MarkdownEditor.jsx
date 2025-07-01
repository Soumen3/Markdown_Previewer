import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { useMarkdownOperations } from '../hooks/useMarkdownOperations'
import { 
  getMarkdownDocument, 
  createMarkdownDocument, 
  updateMarkdownDocument,
  checkDocumentPermission 
} from '../services/appwriteService'
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
  const textareaRef = useRef(null)
  const hasLoadedRef = useRef(false)
  
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
  const [isLoading, setIsLoading] = useState(true)

  // Use the markdown operations hook
  const { insertMarkdown } = useMarkdownOperations(textareaRef, setMarkdownText)

  // Sample markdown content for demonstration
  const sampleMarkdown = `# 👋 Welcome to Your Markdown Editor!

Hello there! We're excited to have you here. This powerful markdown editor is designed to make your writing experience smooth, productive, and enjoyable.

## 🌟 What You Can Do Here

- **✍️ Write**: Create beautiful documents with markdown syntax
- **👀 Preview**: See your content rendered in real-time as you type
- **💾 Save**: Your work is automatically saved to the cloud
- **📱 Access Anywhere**: Work seamlessly across desktop and mobile devices
- **🔒 Stay Secure**: Your documents are private and securely stored

## 🚀 Ready to Get Started?

This editor is packed with features to help you create amazing content. Whether you're writing documentation, taking notes, or crafting blog posts, we've got you covered!

## 📖 Markdown Examples

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

## 🎉 You're All Set!

**Ready to create something amazing?** 📝 Simply start typing above and watch your content come to life in the preview pane. Your creativity is the only limit!

> 💡 **Pro tip**: Use the toolbar buttons above for quick formatting.

Happy writing! ✨
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
    // Load existing file or set sample content - only on initial load or fileId change
    const loadDocument = async () => {
      // Don't reload if we've already loaded this fileId (except on fileId change)
      const currentKey = `${fileId || 'new'}-${user?.$id || 'anonymous'}`
      if (hasLoadedRef.current === currentKey) {
        return
      }
      
      setIsLoading(true)
      
      if (fileId && fileId !== 'new') {
        if (!user || !user.$id) {
          toast.error('You must be logged in to access documents')
          navigate('/login')
          setIsLoading(false)
          return
        }

        try {
          // Load from Appwrite database using service
          const document = await getMarkdownDocument(fileId)
          
          // Check if the document belongs to the current user
          if (document.userId !== user.$id) {
            toast.error('You do not have permission to access this document')
            navigate('/dashboard')
            setIsLoading(false)
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
      
      setIsLoading(false)
      hasLoadedRef.current = currentKey
    }
    
    loadDocument()
  }, [fileId, user?.$id]) // Simplified dependencies

  // Auto-save functionality - disabled to prevent conflicts
  // useEffect(() => {
  //   if (markdownText.trim()) {
  //     const saveTimer = setTimeout(() => {
  //       handleAutoSave()
  //     }, 2000) // Auto-save after 2 seconds of inactivity

  //     return () => clearTimeout(saveTimer)
  //   }
  // }, [markdownText])

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
    // Auto-save disabled to prevent conflicts with manual saves
    // The real saving is handled by the handleSave function
    console.log('Auto-save is disabled to prevent conflicts')
  }

  const handleFileNameChange = (newName) => {
    if (!newName.endsWith('.md')) {
      newName += '.md'
    }
    setFileName(newName)
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
        userId: user.$id
      }

      if (fileId && fileId !== 'new') {
        // Update existing document using service
        await updateMarkdownDocument(fileId, {
          title: documentData.title,
          content: documentData.content
        })
        toast.fileSaved(fileName)
      } else {
        // Create new document using service
        console.log('Creating new document:', documentData)
        const response = await createMarkdownDocument(documentData)
        
        // Update the URL to include the new document ID
        navigate(`/editor/${response.$id}`, { replace: true })
        toast.fileSaved(fileName)
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save file: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = async () => {
    if (!confirm('This will replace your current content with data from local storage. Continue?')) {
      return
    }
    
    try {
      // Load from localStorage only as a backup/recovery option
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
      <EditorHeader
        fileName={fileName}
        handleFileNameChange={handleFileNameChange}
        lastSaved={lastSaved}
        formatDate={formatDate}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        handleSave={handleSave}
        isSaving={isSaving}
        user={user}
      />

      {/* Toolbar */}
      <EditorToolbar
        insertMarkdown={insertMarkdown}
        handleLoad={handleLoad}
      />

      {/* Preview Mode Info */}
      {viewMode === 'preview' && <PreviewModeInfo />}
      
      {/* Main Editor Area */}
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

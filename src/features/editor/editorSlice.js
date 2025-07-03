import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  getMarkdownDocument, 
  createMarkdownDocument, 
  updateMarkdownDocument 
} from '../../services/appwriteService'

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

// Async thunks for API operations
export const loadDocument = createAsyncThunk(
  'editor/loadDocument',
  async ({ fileId, userId }, { rejectWithValue }) => {
    try {
      // Case 1: New document
      if (!fileId || fileId === 'new') {
        return { content: sampleMarkdown, title: 'Untitled', isNew: true }
      }

      // Case 2: Load existing document - requires authentication
      if (!userId) {
        return rejectWithValue('Authentication required to access saved documents')
      }

      // Try to fetch the document from the database
      const document = await getMarkdownDocument(fileId)
      
      // Check if the document belongs to the current user
      if (document.userId !== userId) {
        return rejectWithValue('You do not have permission to access this document')
      }
      
      return {
        content: document.content || '',
        title: document.title,
        isNew: false
      }
    } catch (error) {
      // Handle different types of errors
      if (error.code === 404 || error.message.includes('not found')) {
        return rejectWithValue('Document not found or does not exist')
      }
      if (error.code === 401 || error.message.includes('permission')) {
        return rejectWithValue('You do not have permission to access this document')
      }
      return rejectWithValue(error.message || 'Failed to load document')
    }
  }
)

export const saveDocument = createAsyncThunk(
  'editor/saveDocument',
  async ({ fileId, title, content, userId, isAutoSave = false }, { rejectWithValue }) => {
    try {
      const documentData = {
        title: title.replace('.md', ''),
        content,
        userId
      }

      if (fileId && fileId !== 'new') {
        // Update existing document
        await updateMarkdownDocument(fileId, {
          title: documentData.title,
          content: documentData.content
        })
        return { fileId, ...documentData, isNew: false, isAutoSave }
      } else {
        // Create new document
        const response = await createMarkdownDocument(documentData)
        return { 
          fileId: response.$id, 
          ...documentData, 
          isNew: true,
          newFileId: response.$id,
          isAutoSave
        }
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  // Content state
  markdownText: '',
  htmlPreview: '',
  fileName: 'Untitled.md',
  
  // UI state
  viewMode: 'split', // 'editor', 'preview', 'split'
  isPreviewMode: false, // For mobile toggle
  isFullscreen: false,
  
  // Loading and saving states
  isLoading: true,
  isSaving: false,
  loadError: null,
  saveError: null,
  
  // Document metadata
  lastSaved: null,
  currentFileId: null,
  hasUnsavedChanges: false
}

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setMarkdownText: (state, action) => {
      state.markdownText = action.payload
      state.hasUnsavedChanges = true
    },
    setHtmlPreview: (state, action) => {
      state.htmlPreview = action.payload
    },
    setFileName: (state, action) => {
      let newName = action.payload
      if (!newName.endsWith('.md')) {
        newName += '.md'
      }
      state.fileName = newName
      state.hasUnsavedChanges = true
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setIsPreviewMode: (state, action) => {
      state.isPreviewMode = action.payload
    },
    setIsFullscreen: (state, action) => {
      state.isFullscreen = action.payload
    },
    clearErrors: (state) => {
      state.loadError = null
      state.saveError = null
    },
    resetEditor: (state) => {
      return { ...initialState, isLoading: false }
    },
    loadFromLocalStorage: (state, action) => {
      const { content, fileName } = action.payload
      if (content) {
        state.markdownText = content
        if (fileName) {
          state.fileName = fileName
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Load document cases
      .addCase(loadDocument.pending, (state) => {
        state.isLoading = true
        state.loadError = null
      })
      .addCase(loadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.markdownText = action.payload.content
        state.fileName = action.payload.title + '.md'
        state.hasUnsavedChanges = false
        state.loadError = null
      })
      .addCase(loadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.loadError = action.payload
        // Fallback to sample content on error
        state.markdownText = sampleMarkdown
        state.fileName = 'Untitled.md'
      })
      
      // Save document cases
      .addCase(saveDocument.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        state.isSaving = false
        state.lastSaved = new Date().toISOString()
        state.hasUnsavedChanges = false
        state.saveError = null
        
        // Update fileId if it was a new document
        if (action.payload.newFileId) {
          state.currentFileId = action.payload.newFileId
        }
      })
      .addCase(saveDocument.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  }
})

export const {
  setMarkdownText,
  setHtmlPreview,
  setFileName,
  setViewMode,
  setIsPreviewMode,
  setIsFullscreen,
  clearErrors,
  resetEditor,
  loadFromLocalStorage
} = editorSlice.actions

// Selectors
export const selectMarkdownText = (state) => state.editor.markdownText
export const selectHtmlPreview = (state) => state.editor.htmlPreview
export const selectFileName = (state) => state.editor.fileName
export const selectViewMode = (state) => state.editor.viewMode
export const selectIsPreviewMode = (state) => state.editor.isPreviewMode
export const selectIsFullscreen = (state) => state.editor.isFullscreen
export const selectIsLoading = (state) => state.editor.isLoading
export const selectIsSaving = (state) => state.editor.isSaving
export const selectLastSaved = (state) => state.editor.lastSaved
export const selectHasUnsavedChanges = (state) => state.editor.hasUnsavedChanges
export const selectLoadError = (state) => state.editor.loadError
export const selectSaveError = (state) => state.editor.saveError
export const selectCurrentFileId = (state) => state.editor.currentFileId

export default editorSlice.reducer

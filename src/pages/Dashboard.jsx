import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { 
  getUserMarkdownDocuments, 
  deleteMarkdownDocument, 
  duplicateMarkdownDocument 
} from '../services/appwriteService'
import Header from '../components/Header'
import Dialog from '../components/Dialog'
import MarkdownFileCard from '../components/MarkdownFileCard'

function Dashboard() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [markdownFiles, setMarkdownFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('lastModified') // 'title', 'createdAt', 'lastModified'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)

  // Fetch files from Appwrite database
  const fetchMarkdownFiles = async () => {
    if (!user || !user.$id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Get documents for the current user using the service
      const documents = await getUserMarkdownDocuments(user.$id)
      console.log('Fetched markdown files:', documents)

      // Transform Appwrite documents to match our UI format
      const transformedFiles = documents.map(doc => ({
        id: doc.$id,
        name: doc.title + '.md',
        title: doc.title,
        content: doc.content,
        size: new Blob([doc.content]).size, // Calculate size from content
        created: new Date(doc.createdAt),
        lastModified: new Date(doc.updatedAt),
        preview: doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : ''),
        tags: [] // You can add tags functionality later
      }))

      setMarkdownFiles(transformedFiles)
    } catch (error) {
      console.error('Failed to fetch markdown files:', error)
      toast.error('Failed to load your files: ' + (error.message || 'Unknown error'))
      setMarkdownFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarkdownFiles()
  }, [user])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+N or Cmd+N for new file
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        handleNewFile()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredAndSortedFiles = markdownFiles
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'created':
          aValue = a.created
          bValue = b.created
          break
        case 'lastModified':
          aValue = a.lastModified
          bValue = b.lastModified
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleFileClick = (file) => {
    // Navigate to the markdown editor with the file ID
    console.log('Opening file:', file.name)
    navigate(`/editor/${file.id}`)
  }

  const handleDeleteFile = async (fileId, fileName, event) => {
    // Prevent triggering the file click event
    event.stopPropagation()
    
    // Set the file to delete and show dialog
    setFileToDelete({ id: fileId, name: fileName })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return

    try {
      await deleteMarkdownDocument(fileToDelete.id)
      
      toast.success(`"${fileToDelete.name}" has been deleted successfully`)
      
      // Refresh the files list
      fetchMarkdownFiles()
    } catch (error) {
      console.error('Failed to delete file:', error)
      toast.error(`Failed to delete "${fileToDelete.name}": ` + (error.message || 'Unknown error'))
    } finally {
      // Close dialog and reset state
      setShowDeleteDialog(false)
      setFileToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setFileToDelete(null)
  }

  const handleDuplicateFile = async (file, event) => {
    // Prevent triggering the file click event
    event.stopPropagation()
    
    try {
      const duplicateTitle = `${file.title} (Copy)`
      
      await duplicateMarkdownDocument(file.id, user.$id, duplicateTitle)
      
      toast.success(`"${duplicateTitle}" has been created successfully`)
      
      // Refresh the files list
      fetchMarkdownFiles()
    } catch (error) {
      console.error('Failed to duplicate file:', error)
      toast.error(`Failed to duplicate "${file.name}": ` + (error.message || 'Unknown error'))
    }
  }

  const handleNewFile = () => {
    // Navigate to the markdown editor for a new file
    console.log('Creating new file')
    navigate('/editor/new')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 100px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your markdown files...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />
      
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Markdown Files</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {markdownFiles.length} file{markdownFiles.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </div>
            <button
              onClick={handleNewFile}
              title="Create new file (Ctrl+N)"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New File
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="lastModified">Last Modified</option>
              <option value="title">Name</option>
              <option value="created">Created</option>
              <option value="size">Size</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Files List */}
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first markdown file'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleNewFile}
                  title="Create new file (Ctrl+N)"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New File
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedFiles.map((file) => (
              <MarkdownFileCard
                key={file.id}
                file={file}
                onFileClick={handleFileClick}
                onDuplicate={handleDuplicateFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone and will permanently remove the file from your account.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        cancelButtonClass="bg-gray-600 hover:bg-gray-700 text-white"
      />
    </div>
  )
}

export default Dashboard

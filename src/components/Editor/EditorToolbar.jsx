import React, { useRef } from 'react'

const EditorToolbar = ({ insertMarkdown, handleLoad, markdownText, toast }) => {
  const fileInputRef = useRef(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText)
      toast?.success('Content copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast?.error('Failed to copy to clipboard')
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check if file is a markdown file
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && !file.name.endsWith('.txt')) {
      toast?.error('Please select a markdown file (.md, .markdown, or .txt)')
      return
    }

    try {
      const content = await file.text()
      
      // Confirm before replacing content
      if (markdownText.trim() && !confirm('This will replace your current content with the uploaded file. Continue?')) {
        return
      }

      // Call the handleLoad function with the file content and name
      handleLoad(content, file.name)
      toast?.success(`File "${file.name}" uploaded successfully!`)
    } catch (error) {
      console.error('Failed to read file:', error)
      toast?.error('Failed to read the file')
    }

    // Reset file input
    event.target.value = ''
  }

  const handleDownload = () => {
    try {
      if (!markdownText.trim()) {
        toast?.error('No content to download')
        return
      }

      const blob = new Blob([markdownText], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      // Generate filename with current date/time
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `markdown-document-${timestamp}.md`
      
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast?.success(`File "${filename}" downloaded successfully!`)
    } catch (error) {
      console.error('Failed to download file:', error)
      toast?.error('Failed to download the file')
    }
  }
  return (
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
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            title="Copy content to clipboard"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Copy</span>
          </button>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded border border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex-shrink-0"
            title="Download as markdown file (.md)"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
          
          {/* Load Button - File Upload */}
          <button
            onClick={handleFileUpload}
            className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded border border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex-shrink-0"
            title="Upload markdown file (.md, .markdown, .txt)"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Upload</span>
          </button>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}

export default EditorToolbar

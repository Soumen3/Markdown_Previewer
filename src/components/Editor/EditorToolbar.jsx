import React from 'react'

const EditorToolbar = ({ insertMarkdown, handleLoad, markdownText, toast }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText)
      toast?.success('Content copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast?.error('Failed to copy to clipboard')
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
          
          {/* Load Button */}
          <button
            onClick={handleLoad}
            className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded border border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex-shrink-0"
            title="Load backup from localStorage (overwrites current content)"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span className="hidden sm:inline">Load</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorToolbar

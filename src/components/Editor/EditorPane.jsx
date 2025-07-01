import React from 'react'

const EditorPane = ({
  textareaRef,
  markdownText,
  handleInputChange,
  isLoading,
  showHeader = true,
  className = ""
}) => {
  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Editor</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {markdownText.length} characters
          </span>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={markdownText}
        onChange={handleInputChange}
        disabled={isLoading}
        placeholder={isLoading ? "Loading document..." : "Start writing your markdown here..."}
        className={`flex-1 w-full resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto custom-scrollbar min-h-0 disabled:opacity-50 disabled:cursor-not-allowed ${
          showHeader 
            ? 'p-4 lg:p-6 xl:p-8 lg:text-base' 
            : 'p-6'
        }`}
      />
    </div>
  )
}

export default EditorPane

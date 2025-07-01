import React from 'react'

const PreviewPane = ({
  htmlPreview,
  showHeader = true,
  className = ""
}) => {
  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live preview</span>
        </div>
      )}
      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto custom-scrollbar min-h-0">
        <div className={showHeader ? "p-6 lg:p-8 xl:p-12" : "p-6"}>
          <div 
            className={`prose prose-blue dark:prose-invert max-w-none ${
              showHeader ? 'prose-lg xl:prose-xl' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
          />
        </div>
      </div>
    </div>
  )
}

export default PreviewPane

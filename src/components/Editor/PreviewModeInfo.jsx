import React from 'react'

const PreviewModeInfo = () => {
  return (
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
  )
}

export default PreviewModeInfo

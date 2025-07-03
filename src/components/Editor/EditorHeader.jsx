import React from 'react'
import { useNavigate } from 'react-router-dom'

const EditorHeader = ({
  fileName,
  handleFileNameChange,
  lastSaved,
  formatDate,
  isPreviewMode,
  setIsPreviewMode,
  viewMode,
  setViewMode,
  isFullscreen,
  setIsFullscreen,
  handleSave,
  isSaving,
  user,
  autoSaveStatus,
  hasUnsavedChanges,
  autoSaveEnabled,
  onAutoSaveToggle,
  isDemo = false
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-none mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {!isFullscreen && (
              <button
                onClick={() => navigate(isDemo ? '/' : '/dashboard')}
                className="hidden sm:flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden md:inline">{isDemo ? 'Back to Home' : 'Back to Dashboard'}</span>
                <span className="md:hidden">Back</span>
              </button>
            )}
            {/* Mobile Back Button */}
            {!isFullscreen && (
              <button
                onClick={() => navigate(isDemo ? '/' : '/dashboard')}
                className="sm:hidden p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                title={isDemo ? 'Back to Home' : 'Back to Dashboard'}
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
            {/* Auto-save Status and Toggle */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-xs">
                {/* Auto-save toggle */}
                <button
                  onClick={() => onAutoSaveToggle && onAutoSaveToggle(!autoSaveEnabled)}
                  className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                    autoSaveEnabled 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`Auto-save is ${autoSaveEnabled ? 'enabled' : 'disabled'}`}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
                </button>
                
                {/* Auto-save status */}
                {autoSaveEnabled && (
                  <>
                    {autoSaveStatus === 'saving' && (
                      <span className="flex items-center text-blue-600 dark:text-blue-400">
                        <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Saved
                      </span>
                    )}
                    {autoSaveStatus === 'failed' && (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Failed
                      </span>
                    )}
                    {!autoSaveStatus && hasUnsavedChanges && (
                      <span className="text-orange-600 dark:text-orange-400">
                        Unsaved
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            
            {lastSaved && !autoSaveStatus && (
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
              title={!user ? 'You must be logged in to save to cloud' : 'Save document to cloud'}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 18a4.6 4.4 0 0 1 0 -9 5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15l3 3l3 -3" />
                  </svg>
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorHeader

import React from 'react'
import EditorPane from './EditorPane'
import PreviewPane from './PreviewPane'

const EditorLayout = ({
  viewMode,
  isPreviewMode,
  textareaRef,
  markdownText,
  handleInputChange,
  isLoading,
  htmlPreview
}) => {
  return (
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
            <PreviewPane
              htmlPreview={htmlPreview}
              showHeader={false}
              className="flex-1"
            />
          ) : (
            <EditorPane
              textareaRef={textareaRef}
              markdownText={markdownText}
              handleInputChange={handleInputChange}
              isLoading={isLoading}
              showHeader={false}
              className="flex-1"
            />
          )}
        </div>

        {/* Desktop: Dynamic view based on viewMode */}
        <div className={`hidden md:flex flex-1 min-h-0 ${
          viewMode === 'split' ? 'py-4' : 'py-2'
        }`}>
          {viewMode === 'editor' && (
            /* Editor Only View - Maximized Width */
            <EditorPane
              textareaRef={textareaRef}
              markdownText={markdownText}
              handleInputChange={handleInputChange}
              isLoading={isLoading}
              showHeader={true}
              className="w-full"
            />
          )}

          {viewMode === 'preview' && (
            /* Preview Only View */
            <PreviewPane
              htmlPreview={htmlPreview}
              showHeader={true}
              className="w-full"
            />
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
                  disabled={isLoading}
                  placeholder={isLoading ? "Loading document..." : "Start writing your markdown here..."}
                  className="flex-1 w-full resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-y-auto custom-scrollbar min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}

export default EditorLayout

import React from 'react'

function MarkdownFileCard({ 
  file, 
  onFileClick, 
  onDuplicate, 
  onDelete 
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleDuplicateClick = (event) => {
    event.stopPropagation()
    onDuplicate(file, event)
  }

  const handleDeleteClick = (event) => {
    event.stopPropagation()
    onDelete(file.id, file.name, event)
  }

  return (
    <div
      onClick={() => onFileClick(file)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {file.name}
          </h3>
        </div>
        <div className="flex items-center space-x-1 opacity-100 transition-opacity">
          <button 
            onClick={handleDuplicateClick}
            className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
            title="Duplicate file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            onClick={handleDeleteClick}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700 dark:hover:text-red-300"
            title="Delete file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {file.preview}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {file.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>Modified:</span>
          <span>{formatDate(file.lastModified)}</span>
        </div>
        <div className="flex justify-between">
          <span>Size:</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDate(file.created)}</span>
        </div>
      </div>
    </div>
  )
}

export default MarkdownFileCard

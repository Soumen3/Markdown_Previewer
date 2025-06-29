import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 py-12 transition-colors">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">MarkdownPreview</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Made with ❤️ for the writing community</p>
      </div>
    </footer>
  )
}

export default Footer

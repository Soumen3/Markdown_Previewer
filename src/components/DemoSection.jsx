import React from 'react'

function DemoSection() {
  return (
    <section id="demo" className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">See It In Action</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Experience the power of live markdown preview</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-700/50 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-300 text-sm">MarkdownPreview Editor</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="p-6 border-r dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">MARKDOWN INPUT</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              # Welcome to MarkdownPreview<br/>
              <br/>
              ## Features<br/>
              <br/>
              - **Real-time** preview<br/>
              - *Syntax* highlighting<br/>
              - `Code` blocks<br/>
              <br/>
              ```javascript<br/>
              console.log('Hello World!');<br/>
              ```
            </div>
          </div>
          <div className="p-6">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">LIVE PREVIEW</h4>
            <div className="prose dark:prose-invert">
              <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to MarkdownPreview</h1>
              <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Features</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li className="text-gray-600 dark:text-gray-300"><strong>Real-time</strong> preview</li>
                <li className="text-gray-600 dark:text-gray-300"><em>Syntax</em> highlighting</li>
                <li className="text-gray-600 dark:text-gray-300"><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Code</code> blocks</li>
              </ul>
              <div className="bg-gray-900 text-green-400 p-3 rounded mt-4 font-mono text-sm">
                console.log('Hello World!');
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DemoSection

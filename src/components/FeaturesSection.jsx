import React from 'react'

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Real-time Preview",
      description: "See your Markdown rendered instantly as you type. No delays, no waiting.",
      bgColor: "bg-blue-100"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Syntax Highlighting",
      description: "Beautiful code highlighting for multiple programming languages.",
      bgColor: "bg-green-100"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Easy to Use",
      description: "Clean, intuitive interface that gets out of your way and lets you focus on writing.",
      bgColor: "bg-purple-100"
    }
  ]

  return (
    <section id="features" className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Why Choose MarkdownPreview?</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Powerful features designed for the modern writer</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl dark:shadow-gray-700/50 transition-shadow">
            <div className={`w-12 h-12 ${feature.bgColor} dark:${feature.bgColor.replace('100', '900')} rounded-lg flex items-center justify-center mb-6`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

function HeroSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleStartWriting = () => {
    if (user) {
      // User is logged in, go to new editor
      navigate('/editor/new')
    } else {
      // User not logged in, go to signup with toast notification
      toast.info('Sign up to start creating and saving your markdown documents!')
      navigate('/signup')
    }
  }

  const handleViewDemo = () => {
    // Always navigate to demo for "View Demo" button
    navigate('/demo')
  }

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
        Markdown Live
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Preview</span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
        Write, edit, and preview your Markdown documents in real-time with our powerful and intuitive editor. 
        Perfect for developers, writers, and anyone who loves clean, structured content.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          onClick={handleStartWriting}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
        >
          {user ? 'Start Writing Now' : 'Get Started Free'}
        </button>
        <button 
          onClick={handleViewDemo}
          className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all"
        >
          View Demo
        </button>
      </div>
    </div>
  )
}

export default HeroSection

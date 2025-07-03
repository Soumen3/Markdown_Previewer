import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

function CTASection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleLaunchEditor = () => {
    if (user) {
      // User is logged in, go to new editor
      navigate('/editor/new')
    } else {
      // User not logged in, go to signup with toast notification
      toast.info('Sign up to start creating and saving your markdown documents!')
      navigate('/signup')
    }
  }

  return (
    <section className="py-20 text-center">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Start Writing?</h2>
        <p className="text-xl mb-8 opacity-90">Join thousands of writers who love our markdown editor</p>
        <button 
          onClick={handleLaunchEditor}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-semibold"
        >
          {user ? 'Launch Editor Now' : 'Get Started Free'}
        </button>
      </div>
    </section>
  )
}

export default CTASection

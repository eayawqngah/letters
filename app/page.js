'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PenLine, Home, Table, Eye, Edit, Trash2, LogOut, Mail, Lock, User } from 'lucide-react'
import LetterModal from '@/components/LetterModal'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [letters, setLetters] = useState([])
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')
  const [shakeError, setShakeError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [selectedLetter, setSelectedLetter] = useState(null)

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  // Load letters when user is authenticated
  useEffect(() => {
    if (user) {
      loadLetters()
    }
  }, [user])

  async function loadLetters() {
    setIsLoading(true)
    const { data } = await supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false })
    
    setLetters(data || [])
    setTimeout(() => setIsLoading(false), 300)
  }

  async function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    setShakeError(false)

    // Validation
    if (isSignUp) {
      if (!email || !password) {
        setAuthError('Please fill in all fields')
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
        return
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters')
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
        return
      }
    } else {
      if (!email || !password) {
        setAuthError('Please enter your email and password')
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
        return
      }
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      if (error) {
        setAuthError(error.message)
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
      } else {
        setAuthError('')
        localStorage.setItem('rememberedEmail', email)
        alert('Check your email to confirm your account!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthError(error.message)
        setShakeError(true)
        setTimeout(() => setShakeError(false), 500)
      } else {
        localStorage.setItem('rememberedEmail', email)
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setLetters([])
    setEmail('')
    setPassword('')
  }

  function openCreateModal() {
    setModalMode('create')
    setSelectedLetter(null)
    setModalOpen(true)
  }

  function openEditModal(letter) {
    setModalMode('edit')
    setSelectedLetter(letter)
    setModalOpen(true)
  }

  function openViewModal(letter) {
    setModalMode('view')
    setSelectedLetter(letter)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedLetter(null)
  }

  function handleModalSave() {
    loadLetters()
    closeModal()
  }

  function handleModalDelete() {
    loadLetters()
    closeModal()
  }

  async function handleDeleteLetter(id) {
    if (!confirm('Are you sure you want to delete this letter?')) return

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting letter')
    } else {
      loadLetters()
    }
  }

  // Login/Signup Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#FCEBF1] via-[#ECE3D2] to-[#D7DAB3] flex items-center justify-center p-4">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          .shake {
            animation: shake 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
        `}</style>
        
        <div className="w-full max-w-md fade-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#4A6644] mb-2">Letters Never Sent</h1>
            <p className="text-[#4A6644]/70">A safe space for words you'll never send</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#F4C7D0] transition-all duration-300 hover:shadow-3xl">
            {/* User Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-[#C66F80] to-[#F4C7D0] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-[#F4C7D0]/30 p-1 rounded-xl">
              <button
                onClick={() => {
                  setIsSignUp(false)
                  setAuthError('')
                  setShakeError(false)
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  !isSignUp
                    ? 'bg-[#C66F80] text-white shadow-md transform scale-105'
                    : 'text-[#4A6644] hover:bg-white/50'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true)
                  setAuthError('')
                  setShakeError(false)
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isSignUp
                    ? 'bg-[#C66F80] text-white shadow-md transform scale-105'
                    : 'text-[#4A6644] hover:bg-white/50'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className={`bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${shakeError ? 'shake' : ''}`}>
                  {authError}
                </div>
              )}

              {/* Email field */}
              <div className="slide-in" style={{animationDelay: '0.1s'}}>
                <label className="block text-sm font-semibold text-[#4A6644] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#C66F80] transition-all duration-300" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#F4C7D0] rounded-xl focus:outline-none focus:border-[#C66F80] focus:ring-2 focus:ring-[#C66F80]/20 text-[#4A6644] placeholder-[#4A6644]/40 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="slide-in" style={{animationDelay: '0.2s'}}>
                <label className="block text-sm font-semibold text-[#4A6644] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#C66F80] transition-all duration-300" />
                  <input
                    type="password"
                    placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#F4C7D0] rounded-xl focus:outline-none focus:border-[#C66F80] focus:ring-2 focus:ring-[#C66F80]/20 text-[#4A6644] placeholder-[#4A6644]/40 transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full from-[#C66F80] to-[#b35e70] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#4A6644]/60">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setAuthError('')
                      setShakeError(false)
                    }}
                    className="text-[#C66F80] font-semibold hover:underline transition-all duration-200"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setAuthError('')
                      setShakeError(false)
                    }}
                    className="text-[#C66F80] font-semibold hover:underline transition-all duration-200"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-[#4A6644]/60 slide-in" style={{animationDelay: '0.3s'}}>
            <p>Your letters are private and encrypted.</p>
            <p>We'll never send them without your permission.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FCEBF1] via-[#ECE3D2] to-[#D7DAB3]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .slide-in {
          animation: slideIn 0.4s ease-out;
        }
        .scale-in {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>

      {/* Header with Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#F4C7D0] sticky top-0 z-10 slide-in">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PenLine className="w-6 h-6 text-[#C66F80] transition-transform duration-300 hover:rotate-12" />
              <h1 className="text-2xl font-bold text-[#4A6644]">Letters Never Sent</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#C66F80] text-white rounded-lg hover:bg-[#b35e70] transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                New Letter
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A6644] text-white rounded-lg hover:bg-[#3d5538] transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Navigation Bar */}
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'home'
                  ? 'bg-[#C66F80] text-white transform scale-105'
                  : 'text-[#4A6644] hover:bg-[#F4C7D0]'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                currentView === 'table'
                  ? 'bg-[#C66F80] text-white transform scale-105'
                  : 'text-[#4A6644] hover:bg-[#F4C7D0]'
              }`}
            >
              <Table className="w-4 h-4" />
              All Letters
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C66F80]"></div>
          </div>
        )}

        {/* Home Page */}
        {!isLoading && currentView === 'home' && (
          <div className="fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-[#4A6644]">Welcome back</h2>
              <p className="text-[#4A6644]/70">A safe space for words you'll never send</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border border-[#F4C7D0] scale-in">
              <h3 className="text-xl font-bold mb-4 text-[#4A6644]">Recent Letters</h3>
              {letters.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#4A6644]/60 mb-4">No letters yet</p>
                  <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-[#C66F80] text-white rounded-lg hover:bg-[#b35e70] transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                  >
                    Write Your First Letter
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {letters.slice(0, 5).map((letter, index) => (
                    <div
                      key={letter.id}
                      className="border border-[#F4C7D0] rounded-lg p-4 hover:bg-[#FCEBF1] transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-md"
                      onClick={() => openViewModal(letter)}
                      style={{animation: `slideIn 0.4s ease-out ${index * 0.1}s backwards`}}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-[#4A6644]">
                          To: {letter.recipient_name || 'Untitled'}
                        </div>
                        <div className="text-sm text-[#4A6644]/60">
                          {new Date(letter.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-[#4A6644]/80 text-sm line-clamp-2">
                        {letter.letter_content}
                      </p>
                      {letter.mood && (
                        <span className="inline-block mt-2 px-3 py-1 bg-[#F4C7D0] text-[#C66F80] rounded-full text-xs font-medium transition-all duration-300 hover:bg-[#C66F80] hover:text-white">
                          {letter.mood}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table View */}
        {!isLoading && currentView === 'table' && (
          <div className="fade-in">
            <h2 className="text-3xl font-bold mb-6 text-[#4A6644]">All Your Letters</h2>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#F4C7D0]">
              <table className="w-full">
                <thead className="bg-[#C66F80] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Letter #</th>
                    <th className="px-6 py-4 text-left font-semibold">Title (To)</th>
                    <th className="px-6 py-4 text-left font-semibold">Mood</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Preview</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4C7D0]">
                  {letters.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-[#4A6644]/60">
                        No letters yet. Write your first letter!
                      </td>
                    </tr>
                  ) : (
                    letters.map((letter, index) => (
                      <tr key={letter.id} className="hover:bg-[#FCEBF1] transition-all duration-300">
                        <td className="px-6 py-4 font-semibold text-[#C66F80]">
                          #{letters.length - index}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#4A6644]">
                          {letter.recipient_name || 'Untitled'}
                        </td>
                        <td className="px-6 py-4">
                          {letter.mood && (
                            <span className="px-3 py-1 bg-[#F4C7D0] text-[#C66F80] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#C66F80] hover:text-white">
                              {letter.mood}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#4A6644]/70">
                          {new Date(letter.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-[#4A6644]/70 max-w-md truncate">
                          {letter.letter_content.substring(0, 80)}...
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openViewModal(letter)}
                              className="p-2 text-[#9FAA74] hover:bg-[#D7DAB3] rounded transition-all duration-300 transform hover:scale-110"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(letter)}
                              className="p-2 text-[#4A6644] hover:bg-[#9FAA74] hover:text-white rounded transition-all duration-300 transform hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLetter(letter.id)}
                              className="p-2 text-[#C66F80] hover:bg-[#F4C7D0] rounded transition-all duration-300 transform hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {letters.length > 0 && (
              <div className="mt-4 text-[#4A6644]/70 text-sm">
                Total letters: {letters.length}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Letter Modal */}
      {modalOpen && (
        <LetterModal
          mode={modalMode}
          letter={selectedLetter}
          onClose={closeModal}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          userId={user?.id}
        />
      )}
    </div>
  )
}
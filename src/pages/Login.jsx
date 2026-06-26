import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import WelcomeSplash from '../components/WelcomeSplash'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSplash, setShowSplash] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
    navigate('/')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await login(email, password)
      if (error) {
        setError(error.message)
      } else {
        setShowSplash(true)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showSplash) {
    return <WelcomeSplash onComplete={handleSplashComplete} />
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#1B1A1C] p-5">
      <div className="absolute top-0 left-0 flex items-center gap-3 p-6">
        <img src="/logo.png?v=2" alt="Exodia Operations" className="h-[46px] w-auto" />
        <span className="text-white text-xl font-bold tracking-wide">Exodia Operations</span>
      </div>

      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[#1B1A1C] text-3xl font-bold">Welcome Players!</h1>
          <p className="text-[#3E4048] text-sm mt-2">Sign in to Operations Guild</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border-l-4 border-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[#1B1A1C] font-medium text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="px-4 py-3 border border-[#CACDD7] rounded-md text-sm transition-colors focus:outline-none focus:border-[#FF5900] focus:ring-1 focus:ring-[#FF5900]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[#1B1A1C] font-medium text-sm">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-[#CACDD7] rounded-md text-sm transition-colors focus:outline-none focus:border-[#FF5900] focus:ring-1 focus:ring-[#FF5900]"
              />
<button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#FF5900] cursor-pointer flex items-center justify-center"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF5900] text-white font-semibold py-3 rounded-md text-base cursor-pointer transition-all hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Entering Guild...' : 'Enter Guild'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

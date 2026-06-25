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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF5900] cursor-pointer"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15a3 3 0 10-2.8-2.9" />
                    <path fillRule="evenodd" d="M12 2C6.99 2 2.88 5.61 2 10.64c.12 4.8 3.68 8.72 8 9.36 4.32-.64 7.88-4.56 8-9.36C19.12 5.61 14.01 2 12 2zm0 9.36A3 3 0 109 12a3 3 0 003-3v.11c.89.16 1.6.87 1.76 1.76.1.58.58 1.06.98 1.16.58.16 1.2.16 1.76 0 .4-.1 1.02-.52 1.38-.36.36-.82.64-1.34.82-.52.18-1.06.27-1.62.27a3 3 0 01-3-3 3 3 0 012.8-2.9z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 15a3 3 0 10-2.8-2.9" />
                    <path fillRule="evenodd" d="M12 2C6.99 2 2.88 5.61 2 10.64c.12 4.8 3.68 8.72 8 9.36 4.32-.64 7.88-4.56 8-9.36C19.12 5.61 14.01 2 12 2zm0 9.36A3 3 0 109 12a3 3 0 003-3v.11c.89.16 1.6.87 1.76 1.76.1.58.58 1.06.98 1.16.58.16 1.2.16 1.76 0 .4-.1 1.02-.52 1.38-.36.36-.82.64-1.34.82-.52.18-1.06.27-1.62.27a3 3 0 01-3-3 3 3 0 012.8-2.9z" clipRule="evenodd" />
                  </svg>
                )}
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

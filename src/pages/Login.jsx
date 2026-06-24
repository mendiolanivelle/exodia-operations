import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await login(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#1B1A1C] p-5">
      <div className="absolute top-0 left-0 flex items-center gap-3 p-6">
        <img src="/logo.png" alt="Exodia Operations" className="h-[46px] w-auto" />
        <span className="text-white text-xl font-bold tracking-wide">Exodia Operations</span>
      </div>

      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[#1B1A1C] text-3xl font-bold">Exodia Operations</h1>
          <p className="text-[#3E4048] text-sm mt-2">Sign in to access the operations portal</p>
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="px-4 py-3 border border-[#CACDD7] rounded-md text-sm transition-colors focus:outline-none focus:border-[#FF5900] focus:ring-1 focus:ring-[#FF5900]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF5900] text-white font-semibold py-3 rounded-md text-base cursor-pointer transition-all hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

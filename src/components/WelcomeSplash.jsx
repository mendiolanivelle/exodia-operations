import { useState, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'

function WelcomeSplash({ onComplete }) {
  const { user } = useAuth()
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const fadeIn = setTimeout(() => setOpacity(1), 50)
    const fadeOut = setTimeout(() => setOpacity(0), 2800)
    const done = setTimeout(onComplete, 3400)
    return () => {
      clearTimeout(fadeIn)
      clearTimeout(fadeOut)
      clearTimeout(done)
    }
  }, [onComplete])

  const username = user?.email ? user.email.split('@')[0] : ''

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1B1A1C]">
      <div
        className="flex flex-col items-center gap-8 transition-opacity duration-500"
        style={{ opacity }}
      >
        <img src="/logo.png?v=2" alt="Operations Department" className="h-24 w-auto" />
        <h1 className="text-white text-3xl font-bold tracking-wide">
          Welcome Player {username}
        </h1>
      </div>
    </div>
  )
}

export default WelcomeSplash
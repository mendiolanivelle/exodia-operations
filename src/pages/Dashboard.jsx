import { useAuth } from '../lib/useAuth'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#CACDD7]/20">
      <header className="bg-white px-10 py-5 flex justify-between items-center shadow-sm">
        <h1 className="text-[#1B1A1C] text-2xl font-bold">Exodia Operations Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-[#3E4048] text-sm">{user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-10 py-10 max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
          <h2 className="text-[#1B1A1C] text-xl font-semibold mb-2">Welcome to Operations</h2>
          <p className="text-[#3E4048]">You are now logged in. This is your operations dashboard.</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-[#3E4048] text-base font-medium mb-4">Active Projects</h3>
            <p className="text-[#FF5900] text-5xl font-bold">0</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-[#3E4048] text-base font-medium mb-4">Pending Tasks</h3>
            <p className="text-[#FF5900] text-5xl font-bold">0</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-[#3E4048] text-base font-medium mb-4">Team Members</h3>
            <p className="text-[#FF5900] text-5xl font-bold">0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

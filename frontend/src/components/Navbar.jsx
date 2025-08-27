import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-semibold text-sky-700">Medical AI</Link>
        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link to="/" className="text-slate-700 hover:text-sky-700">Home</Link>
              <Link to="/login" className="px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700">Login</Link>
              <Link to="/signup" className="px-3 py-1 rounded-md border border-sky-600 text-sky-700 hover:bg-sky-50">Signup</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-slate-700 hover:text-sky-700">Dashboard</Link>
              <button onClick={onLogout} className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}


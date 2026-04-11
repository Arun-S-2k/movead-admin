import { useState } from 'react'
import { supabase } from './supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Drivers from './pages/Drivers'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else setLoggedIn(true)
    setLoading(false)
  }

  if (loggedIn) {
    return (
      <Layout active={activePage} onNavigate={setActivePage}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'campaigns' && <Campaigns />}
        {activePage === 'drivers' && <Drivers />}
      </Layout>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: '#E05409', fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 4 }}>MoveAd</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 32, marginTop: 4 }}>Admin Portal</p>
        <input
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <button
          style={{ width: '100%', padding: '14px', backgroundColor: '#E05409', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginTop: 8 }}
          onClick={handleLogin}
          disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

export default App
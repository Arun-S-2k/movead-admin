import { LayoutDashboard, Megaphone, Users, LogOut } from 'lucide-react'
import { supabase } from '../supabase'

interface Props {
  active: string
  onNavigate: (page: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'drivers', label: 'Drivers', icon: Users },
]

export default function Sidebar({ active, onNavigate }: Props) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <>
      <div className="sidebar-desktop">
        <div>
          <h2 style={{ color: '#E05409', fontSize: 22, fontWeight: 'bold', margin: 0, marginBottom: 4 }}>MoveAd</h2>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 32, marginTop: 0 }}>Admin Portal</p>
          <nav>
            {menuItems.map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`nav-item ${active === item.id ? 'nav-active' : ''}`}>
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="nav-item" style={{ color: '#888' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="bottom-nav">
        {menuItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`bottom-nav-item ${active === item.id ? 'bottom-nav-active' : ''}`}>
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={handleLogout} className="bottom-nav-item">
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </>
  )
}
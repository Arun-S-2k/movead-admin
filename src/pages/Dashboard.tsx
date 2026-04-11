import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ drivers: 0, campaigns: 0, uploads: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: drivers }, { count: campaigns }, { count: uploads }] = await Promise.all([
        supabase.from('drivers').select('*', { count: 'exact', head: true }),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('photo_uploads').select('*', { count: 'exact', head: true }),
      ])
      setStats({ drivers: drivers || 0, campaigns: campaigns || 0, uploads: uploads || 0 })
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Drivers', value: stats.drivers, color: '#E05409' },
    { label: 'Active Campaigns', value: stats.campaigns, color: '#3B82F6' },
    { label: 'Total Photo Uploads', value: stats.uploads, color: '#22C55E' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8, marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: '#888', marginBottom: 32, marginTop: 0 }}>Overview of MoveAd platform</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(card => (
          <div key={card.label} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#888', fontSize: 13, margin: 0, marginBottom: 8 }}>{card.label}</p>
            <h2 style={{ color: card.color, fontSize: 36, fontWeight: 'bold', margin: 0 }}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: 0, marginBottom: 16, color: '#111', fontSize: 16 }}>Recent Activity</h3>
        <p style={{ color: '#888', fontSize: 14 }}>No recent activity yet. Data will appear once drivers start uploading photos.</p>
      </div>
    </div>
  )
}
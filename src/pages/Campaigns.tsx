import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface Campaign {
  id: string
  name: string
  advertiser: string
  status: string
  start_date: string
  end_date: string
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
      setCampaigns(data || [])
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const statusColor: Record<string, string> = {
    active: '#22C55E',
    initiated: '#3B82F6',
    finished: '#888',
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8, marginTop: 0 }}>Campaigns</h1>
      <p style={{ color: '#888', marginBottom: 32, marginTop: 0 }}>All advertising campaigns</p>

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#888' }}>
          No campaigns yet. Add campaigns from Supabase dashboard.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map(c => (
            <div key={c.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: 4, color: '#111', fontSize: 16 }}>{c.name}</h3>
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{c.advertiser} • {c.start_date} → {c.end_date}</p>
              </div>
              <span style={{ backgroundColor: statusColor[c.status] + '20', color: statusColor[c.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
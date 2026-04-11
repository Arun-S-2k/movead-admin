import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface Driver {
  id: string
  name: string
  mobile: string
  vehicle_number: string
  brand: string
  model: string
  fuel_type: string
  created_at: string
}

const PAGE_SIZE = 10

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filtered, setFiltered] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fuelFilter, setFuelFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data } = await supabase.from('drivers').select('*').order('created_at', { ascending: false })
      setDrivers(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    fetchDrivers()
  }, [])

  useEffect(() => {
    let result = drivers
    if (search) {
      result = result.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.mobile?.includes(search) ||
        d.vehicle_number?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (fuelFilter !== 'All') {
      result = result.filter(d => d.fuel_type === fuelFilter)
    }
    setFiltered(result)
    setPage(1)
  }, [search, fuelFilter, drivers])

  const fuels = ['All', 'CNG', 'Petrol', 'Electric', 'LPG']
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', margin: 0, marginBottom: 4 }}>Drivers</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>{filtered.length} drivers found</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, mobile, vehicle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fuels.map(f => (
            <button
              key={f}
              onClick={() => setFuelFilter(f)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: fuelFilter === f ? '#E05409' : '#E5E7EB',
                backgroundColor: fuelFilter === f ? '#FFF4EE' : '#fff',
                color: fuelFilter === f ? '#E05409' : '#555',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: fuelFilter === f ? '600' : '400',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#888' }}>
          No drivers found.
        </div>
      ) : (
        <>
          {/* Table — hidden on mobile via CSS */}
          <div className="desktop-only">
            <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    {['Name', 'Mobile', 'Vehicle No', 'Brand', 'Model', 'Fuel', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d, i) => (
                    <tr key={d.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#111', borderBottom: '1px solid #F3F4F6' }}>{d.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.mobile}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.vehicle_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.brand || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.model || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.fuel_type || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — shown on mobile via CSS */}
          <div className="mobile-only">
            {paginated.map(d => (
              <div key={d.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#111' }}>{d.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{d.mobile}</p>
                  </div>
                  <span style={{ backgroundColor: '#FFF4EE', color: '#E05409', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: '600' }}>{d.fuel_type || 'N/A'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Vehicle No</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '500' }}>{d.vehicle_number || '-'}</p>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Brand / Model</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '500' }}>{d.brand || '-'} {d.model || ''}</p>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Joined</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '500' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#ccc' : '#555', fontSize: 13 }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid', borderColor: page === i + 1 ? '#E05409' : '#E5E7EB', backgroundColor: page === i + 1 ? '#E05409' : '#fff', color: page === i + 1 ? '#fff' : '#555', cursor: 'pointer', fontSize: 13 }}>
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#ccc' : '#555', fontSize: 13 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
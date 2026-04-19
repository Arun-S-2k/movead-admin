import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Eye, ArrowLeft, Calendar, Image as ImageIcon, MapPin, Target, CheckCircle2, XCircle } from 'lucide-react'

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

interface PhotoUpload {
  id: string
  driver_id: string
  photo_url: string
  latitude: number
  longitude: number
  location_name: string
  uploaded_at: string
}

const PAGE_SIZE = 10

const DriverDetailsView = ({ driver, onBack }: { driver: Driver, onBack: () => void }) => {
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoUpload | null>(null);

  // Campaign state
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  const [assignCampaignId, setAssignCampaignId] = useState('');
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchActiveCampaign();
    fetchPhotos();
  }, [driver.id]);

  const fetchActiveCampaign = async () => {
    setLoadingCampaign(true);
    const { data, error } = await supabase
      .from('driver_campaigns')
      .select('*, campaigns(*)')
      .eq('driver_id', driver.id)
      .eq('status', 'active')
      .single();

    if (data) {
      setActiveCampaign(data);
    } else {
      // If no active campaign, fetch available campaigns to assign
      const { data: camps } = await supabase.from('campaigns').select('*').eq('status', 'Active');
      setAvailableCampaigns(camps || []);
    }
    setLoadingCampaign(false);
  };

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    const { data } = await supabase
      .from('photo_uploads')
      .select('*')
      .eq('driver_id', driver.id)
      .order('uploaded_at', { ascending: false });
    
    const fetchedPhotos = data || [];
    setPhotos(fetchedPhotos);
    if (fetchedPhotos.length > 0) {
      setSelectedPhoto(fetchedPhotos[0]);
    }
    setLoadingPhotos(false);
  };

  const handleAssignCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    const { error } = await supabase.from('driver_campaigns').insert({
      driver_id: driver.id,
      campaign_id: assignCampaignId,
      assigned_on: assignStart,
      expected_end: assignEnd,
      status: 'active'
    });
    setAssigning(false);
    if (!error) {
      fetchActiveCampaign();
    } else {
      alert("Error assigning campaign. Did you run the SQL script in Supabase?");
    }
  };

  // Calendar heatmap data logic
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const currentDay = today.getDate();

  const heatmapData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    if (day > currentDay) return 'future';

    // check if a photo was uploaded on this day of the current month
    const hasPhoto = photos.some(p => {
      const pDate = new Date(p.uploaded_at);
      return pDate.getFullYear() === year && pDate.getMonth() === month && pDate.getDate() === day;
    });

    return hasPhoto ? 'uploaded' : 'missed';
  });

  const currentMonthUploaded = heatmapData.filter(status => status === 'uploaded').length;
  const currentMonthMissed = heatmapData.filter(status => status === 'missed').length;
  const totalPhotosAllTime = photos.length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 8, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} color="#555" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', margin: 0, marginBottom: 4 }}>{driver.name}</h1>
          <p style={{ color: '#555', margin: 0, fontSize: 14 }}>Driver Profile & Statistics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Profile Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: '600', color: '#111', margin: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#C24100" /> Driver Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Mobile</p>
              <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{driver.mobile}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Vehicle Number</p>
              <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{driver.vehicle_number || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Vehicle Model</p>
              <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{driver.brand} {driver.model}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Fuel Type</p>
              <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{driver.fuel_type || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Joined On</p>
              <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{new Date(driver.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Campaign Card / Assignment Form */}
        {loadingCampaign ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#555', margin: 0 }}>Loading campaign data...</p>
          </div>
        ) : activeCampaign ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: '600', color: '#111', margin: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="#C24100" /> Active Campaign
            </h2>
            <div style={{ backgroundColor: '#FFF4EE', border: '1px solid #FCDAB7', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#C24100', fontWeight: '700', marginBottom: 4 }}>CAMPAIGN ID: {activeCampaign.campaigns?.campaign_code || 'N/A'}</p>
              <p style={{ margin: 0, fontSize: 16, color: '#111', fontWeight: 'bold' }}>{activeCampaign.campaigns?.name || 'Unknown Campaign'}</p>
            </div>
            <div style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '600', marginBottom: 8 }}>Campaign Tenure</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Assigned On</p>
                  <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{activeCampaign.assigned_on}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '500' }}>Expected End</p>
                  <p style={{ margin: 0, fontSize: 14, color: '#111', fontWeight: '600' }}>{activeCampaign.expected_end}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: '600', color: '#111', margin: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="#C24100" /> Assign Campaign
            </h2>
            <form onSubmit={handleAssignCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '600' }}>Select Campaign</label>
                <select required value={assignCampaignId} onChange={e => setAssignCampaignId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }}>
                  <option value="">-- Choose Campaign --</option>
                  {availableCampaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_code} - {c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '600' }}>Assigned On</label>
                  <input required type="date" value={assignStart} onChange={e => setAssignStart(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '600' }}>Expected End</label>
                  <input required type="date" value={assignEnd} onChange={e => setAssignEnd(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <button type="submit" disabled={assigning || !assignCampaignId} style={{ marginTop: 8, padding: '10px', backgroundColor: '#C24100', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', opacity: assigning || !assignCampaignId ? 0.7 : 1 }}>
                {assigning ? 'Assigning...' : 'Assign Driver to Campaign'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: '600', color: '#111', margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ImageIcon size={18} color="#C24100" /> Photo Gallery
        </h2>

        {loadingPhotos ? (
          <p style={{ color: '#555', fontSize: 14 }}>Loading photos...</p>
        ) : photos.length === 0 ? (
          <p style={{ color: '#555', fontSize: 14 }}>No photos uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Thumbnails (Left side) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '120px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              {photos.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPhoto(p)}
                  style={{ 
                    width: '100px', height: '100px', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: selectedPhoto?.id === p.id ? '3px solid #C24100' : '1px solid #E5E7EB',
                    opacity: selectedPhoto?.id === p.id ? 1 : 0.6,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}>
                  <img src={p.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumbnail" />
                </div>
              ))}
            </div>

            {/* Featured Photo (Right side) */}
            {selectedPhoto && (
              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: '100%', height: '400px', borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                  <img src={selectedPhoto.photo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="featured" />
                </div>
                <div style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={18} color="#555" />
                    <span style={{ fontSize: 14, color: '#111', fontWeight: '500' }}>{selectedPhoto.location_name || 'Location unavailable'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color="#555" />
                    <span style={{ fontSize: 14, color: '#555', fontWeight: '500' }}>{new Date(selectedPhoto.uploaded_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heatmap & Stats */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: '600', color: '#111', margin: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="#C24100" /> Monthly Compliance
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          {/* Calendar Grid */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: 12, color: '#555', fontWeight: '600' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} style={{ padding: '12px 0' }}></div>
              ))}
              {heatmapData.map((status, i) => {
                const day = i + 1;
                let bgColor = '#F3F4F6'; // future
                let color = '#9CA3AF'; // WCAG accessible gray for empty/future text
                let border = '1px solid transparent';
                if (status === 'uploaded') { bgColor = '#DCFCE7'; color = '#15803D'; border = '1px solid #BBF7D0'; } // darker green
                if (status === 'missed') { bgColor = '#FEE2E2'; color = '#B91C1C'; border = '1px solid #FECACA'; } // darker red
                
                return (
                  <div key={day} style={{
                    backgroundColor: bgColor,
                    color: color,
                    border: border,
                    padding: '10px 0',
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 color="#15803D" size={24} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#15803D', fontWeight: '600' }}>Days Uploaded (Month)</p>
                <p style={{ margin: 0, fontSize: 20, color: '#14532D', fontWeight: 'bold' }}>{currentMonthUploaded}</p>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#FEE2E2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 12 }}>
              <XCircle color="#B91C1C" size={24} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#B91C1C', fontWeight: '600' }}>Days Missed (Month)</p>
                <p style={{ margin: 0, fontSize: 20, color: '#7F1D1D', fontWeight: 'bold' }}>{currentMonthMissed}</p>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
              <ImageIcon color="#555" size={24} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#555', fontWeight: '600' }}>Total Uploads (All Time)</p>
                <p style={{ margin: 0, fontSize: 20, color: '#111', fontWeight: 'bold' }}>{totalPhotosAllTime}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#555', margin: 0, marginTop: 8, fontWeight: '500' }}>
              Tenure: {Math.max(0, Math.floor((today.getTime() - new Date(driver.created_at).getTime()) / (1000 * 3600 * 24)))} days since joining.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filtered, setFiltered] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fuelFilter, setFuelFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

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

  if (selectedDriver) {
    return <DriverDetailsView driver={selectedDriver} onBack={() => setSelectedDriver(null)} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', margin: 0, marginBottom: 4 }}>Drivers</h1>
          <p style={{ color: '#555', margin: 0, fontSize: 14 }}>{filtered.length} drivers found</p>
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
                borderColor: fuelFilter === f ? '#C24100' : '#E5E7EB',
                backgroundColor: fuelFilter === f ? '#FFF4EE' : '#fff',
                color: fuelFilter === f ? '#C24100' : '#555',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: fuelFilter === f ? '600' : '500',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#555' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#555' }}>
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
                    {['Name', 'Mobile', 'Vehicle No', 'Brand', 'Model', 'Fuel', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
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
                      <td style={{ padding: '12px 16px', fontSize: 14, borderBottom: '1px solid #F3F4F6' }}>
                        <button
                          onClick={() => setSelectedDriver(d)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#C24100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4
                          }}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
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
                    <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{d.mobile}</p>
                  </div>
                  <span style={{ backgroundColor: '#FFF4EE', color: '#C24100', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: '700' }}>{d.fuel_type || 'N/A'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#555', fontWeight: '500' }}>Vehicle No</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '600' }}>{d.vehicle_number || '-'}</p>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#555', fontWeight: '500' }}>Brand / Model</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '600' }}>{d.brand || '-'} {d.model || ''}</p>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#555', fontWeight: '500' }}>Joined</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: '600' }}>{new Date(d.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriver(d)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#FFF4EE',
                    color: '#C24100',
                    border: '1px solid #FCDAB7',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                  <Eye size={16} /> View Profile
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#ccc' : '#555', fontSize: 13, fontWeight: '500' }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid', borderColor: page === i + 1 ? '#C24100' : '#E5E7EB', backgroundColor: page === i + 1 ? '#C24100' : '#fff', color: page === i + 1 ? '#fff' : '#555', cursor: 'pointer', fontSize: 13, fontWeight: '600' }}>
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#ccc' : '#555', fontSize: 13, fontWeight: '500' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
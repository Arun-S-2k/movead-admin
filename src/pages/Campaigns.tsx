import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Eye, ArrowLeft, Target, Users, LayoutGrid, List as ListIcon, Calendar, Plus, X } from 'lucide-react'

// Layout mode alerts replaced with real Supabase queries
const CampaignDetailsView = ({ campaign, onBack }: { campaign: any, onBack: () => void }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedDrivers = async () => {
      // Fetch from driver_campaigns and join drivers
      const { data, error } = await supabase
        .from('driver_campaigns')
        .select(`
          assigned_on,
          expected_end,
          status,
          drivers (
            id,
            name,
            mobile,
            vehicle_number,
            brand,
            model
          )
        `)
        .eq('campaign_id', campaign.id);

      if (data) {
        // Flatten the data for the table
        const formatted = data.map(mapping => ({
          ...mapping.drivers,
          start_date: mapping.assigned_on,
          end_date: mapping.expected_end,
          mapping_status: mapping.status
        }));
        setDriversList(formatted);
      }
      setLoading(false);
    };

    fetchAssignedDrivers();
  }, [campaign.id]);

  const totalPages = Math.ceil(driversList.length / pageSize);
  const paginatedDrivers = driversList.slice((page - 1) * pageSize, page * pageSize);

  const handleViewDriver = (driver: any) => {
    // In a full router setup, you'd navigate here.
    // For now, alert to simulate action as requested
    alert(`To view ${driver.name}, go back to the Drivers tab and search for ${driver.vehicle_number}.`);
  };

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
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', margin: 0, marginBottom: 4 }}>{campaign.name}</h1>
          <p style={{ color: '#555', margin: 0, fontSize: 14 }}>Campaign Overview & Assigned Drivers</p>
        </div>
      </div>

      {/* Campaign Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ backgroundColor: '#FFF4EE', padding: 10, borderRadius: 8 }}>
              <Target size={24} color="#C24100" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#555', fontWeight: '500' }}>Advertiser</p>
              <p style={{ margin: 0, fontSize: 16, color: '#111', fontWeight: 'bold' }}>{campaign.advertiser}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ backgroundColor: '#DCFCE7', padding: 10, borderRadius: 8 }}>
              <Users size={24} color="#15803D" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: '#555', fontWeight: '500' }}>Total Assigned Drivers</p>
              <p style={{ margin: 0, fontSize: 20, color: '#111', fontWeight: 'bold' }}>{driversList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver List Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#111', margin: 0 }}>Drivers on this Campaign</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Show</span>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none', fontSize: 13, color: '#111', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: 13, color: '#555' }}>entries</span>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#555' }}>Loading assigned drivers...</p>
      ) : driversList.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#555' }}>
          No drivers assigned to this campaign yet. Go to the Drivers tab to assign them.
        </div>
      ) : (
        <>
          {/* Table — hidden on mobile via CSS */}
          <div className="desktop-only">
            <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    {['Driver Name', 'Mobile', 'Vehicle No', 'Duration', 'Uploads', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDrivers.map((d, i) => (
                    <tr key={d.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#111', borderBottom: '1px solid #F3F4F6', fontWeight: '500' }}>{d.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.mobile}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#111', borderBottom: '1px solid #F3F4F6', fontWeight: '600' }}>{d.vehicle_number}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{d.start_date} → {d.end_date}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: '600', color: '#111' }}>Pending Verification</span>
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#555', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>
                            Live check needed
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 14, borderBottom: '1px solid #F3F4F6' }}>
                        <button
                          onClick={() => handleViewDriver(d)}
                          style={{
                            background: '#FFF4EE',
                            border: '1px solid #FCDAB7',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: '#C24100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 12px',
                            fontSize: 13,
                            fontWeight: '600',
                            gap: 6
                          }}
                          title="Locate Driver"
                        >
                          <Eye size={16} /> Driver info
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
            {paginatedDrivers.map(d => (
              <div key={d.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#111' }}>{d.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{d.mobile}</p>
                  </div>
                  <span style={{ backgroundColor: '#F9FAFB', color: '#111', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: '700', border: '1px solid #E5E7EB' }}>
                    {d.vehicle_number}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} color="#888" />
                    <p style={{ margin: 0, fontSize: 13, color: '#555', fontWeight: '500' }}>{d.start_date} to {d.end_date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDriver(d)}
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
                  <Eye size={16} /> Driver info
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
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
  );
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Create Campaign Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampAdvertiser, setNewCampAdvertiser] = useState('');
  const [newCampStart, setNewCampStart] = useState('');
  const [newCampEnd, setNewCampEnd] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    // Fetch real campaigns
    const { data: camps, error: campErr } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    
    // Fetch assigned drivers count for each campaign
    const { data: mappings } = await supabase.from('driver_campaigns').select('campaign_id, driver_id').eq('status', 'active');
    
    if (camps) {
      const enrichedCamps = camps.map(c => {
        // Count how many mappings match this campaign_id
        const assignedCount = mappings ? mappings.filter(m => m.campaign_id === c.id).length : 0;
        return {
          ...c,
          assigned_drivers: assignedCount
        };
      });
      setCampaigns(enrichedCamps);
    }
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // Fetch count to generate sequential ID (e.g. CMP-001)
    const { count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
    const codeNumber = (count || 0) + 1;
    const campaignCode = `CMP-${String(codeNumber).padStart(3, '0')}`;

    const { error } = await supabase.from('campaigns').insert({
      campaign_code: campaignCode,
      name: newCampName,
      advertiser: newCampAdvertiser,
      start_date: newCampStart,
      end_date: newCampEnd,
      status: 'Active'
    });

    setCreating(false);
    if (!error) {
      setShowCreateModal(false);
      setNewCampName('');
      setNewCampAdvertiser('');
      setNewCampStart('');
      setNewCampEnd('');
      fetchCampaigns(); // Refresh list
    } else {
      alert('Error creating campaign. Did you run the SQL script?');
    }
  };

  const statusColor: Record<string, string> = {
    Active: '#15803D',
    Initiated: '#0284C7',
    Finished: '#555',
  }
  const statusBg: Record<string, string> = {
    Active: '#DCFCE7',
    Initiated: '#E0F2FE',
    Finished: '#F3F4F6',
  }

  if (selectedCampaign) {
    return <CampaignDetailsView campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8, marginTop: 0 }}>Campaigns</h1>
          <p style={{ color: '#555', margin: 0, fontSize: 14 }}>Manage advertising campaigns and view assigned drivers</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#C24100',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 4px rgba(194, 65, 0, 0.2)'
            }}
          >
            <Plus size={18} /> Create Campaign
          </button>

          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: '#fff', padding: 4, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#FFF4EE' : 'none',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? '#C24100' : '#888',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: '600',
                fontSize: 13
              }}
            >
              <LayoutGrid size={16} /> <span className="desktop-only">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#FFF4EE' : 'none',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                cursor: 'pointer',
                color: viewMode === 'list' ? '#C24100' : '#888',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: '600',
                fontSize: 13
              }}
            >
              <ListIcon size={16} /> <span className="desktop-only">List</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#555' }}>Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#555' }}>
          No campaigns found. Create your first campaign to get started.
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {campaigns.map(c => (
            <div key={c.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#C24100', fontWeight: '700', marginBottom: 4 }}>{c.campaign_code || 'N/A'}</p>
                  <h3 style={{ margin: 0, color: '#111', fontSize: 18, fontWeight: 'bold' }}>{c.name}</h3>
                  <p style={{ margin: 0, color: '#555', fontSize: 14, marginTop: 4 }}>{c.advertiser}</p>
                </div>
                <span style={{ backgroundColor: statusBg[c.status] || '#F3F4F6', color: statusColor[c.status] || '#555', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>
                  {c.status}
                </span>
              </div>

              <div style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="#555" />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#555', fontWeight: '600' }}>Duration</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: 'bold' }}>{c.start_date}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} color="#555" />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#555', fontWeight: '600' }}>Drivers</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#111', fontWeight: 'bold' }}>{c.assigned_drivers} assigned</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCampaign(c)}
                style={{
                  width: '100%',
                  padding: '12px',
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
                  gap: 8,
                  marginTop: 4
                }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Campaign Code</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Campaign Name</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Advertiser</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Duration</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Assigned Drivers</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: '#555', fontWeight: '700', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#C24100', fontWeight: '700', borderBottom: '1px solid #F3F4F6' }}>{c.campaign_code || 'N/A'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#111', fontWeight: '600', borderBottom: '1px solid #F3F4F6' }}>{c.name}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{c.advertiser}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#555', borderBottom: '1px solid #F3F4F6' }}>{c.start_date} → {c.end_date}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#111', fontWeight: '600', borderBottom: '1px solid #F3F4F6' }}>{c.assigned_drivers}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, borderBottom: '1px solid #F3F4F6' }}>
                      <span style={{ backgroundColor: statusBg[c.status] || '#F3F4F6', color: statusColor[c.status] || '#555', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, borderBottom: '1px solid #F3F4F6' }}>
                      <button
                        onClick={() => setSelectedCampaign(c)}
                        style={{
                          background: '#FFF4EE',
                          border: '1px solid #FCDAB7',
                          borderRadius: 6,
                          cursor: 'pointer',
                          color: '#C24100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: '600',
                          gap: 6
                        }}
                        title="View Details"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#111' }}>Create New Campaign</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#888" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 }}>Campaign Name</label>
                <input required type="text" value={newCampName} onChange={e => setNewCampName(e.target.value)} placeholder="e.g. Summer City Drive" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 }}>Advertiser</label>
                <input required type="text" value={newCampAdvertiser} onChange={e => setNewCampAdvertiser(e.target.value)} placeholder="e.g. Coca-Cola" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 }}>Start Date</label>
                  <input required type="date" value={newCampStart} onChange={e => setNewCampStart(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 }}>End Date</label>
                  <input required type="date" value={newCampEnd} onChange={e => setNewCampEnd(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#555', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: '#C24100', color: '#fff', fontWeight: 'bold', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
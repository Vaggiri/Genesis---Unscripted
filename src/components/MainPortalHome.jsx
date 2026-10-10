import React, { useState } from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building,
  Sparkles
} from 'lucide-react';

export default function MainPortalHome({ 
  onNavigate, 
  stats, 
  settings, 
  classrooms = [] 
}) {
  const [quickSearch, setQuickSearch] = useState('');
  const [quickBlock, setQuickBlock] = useState('All');

  // Filter classrooms for the quick-lookup on landing page
  const filteredQuickRooms = (classrooms || []).filter(room => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(quickSearch.toLowerCase()) ||
      room.block.toLowerCase().includes(quickSearch.toLowerCase());
    const matchesBlock = quickBlock === 'All' || room.block === quickBlock;
    return matchesSearch && matchesBlock;
  }).slice(0, 4); // show top 4 for quick mobile glance

  return (
    <div style={{ padding: '1rem 0 2rem' }}>
      
      {/* Optional Campus Alert Banner */}
      {settings?.banner_active && settings?.banner_message && (
        <div style={{
          backgroundColor: 'var(--amrita-gold-bg)',
          border: '1px solid var(--amrita-gold-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1.25rem',
          fontSize: '0.825rem',
          color: 'var(--status-flagged-text)',
          fontWeight: 500
        }}>
          <Sparkles size={16} color="var(--amrita-gold)" style={{ flexShrink: 0 }} />
          <span>{settings.banner_message}</span>
        </div>
      )}

      {/* Clean Hero for Mobile & Desktop */}
      <div style={{ textAlign: 'center', padding: '1rem 0 1.75rem' }}>
        <span className="badge badge-maroon" style={{ marginBottom: '0.5rem' }}>
          Amrita E-Governance Portal
        </span>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.2 }}>
          Campus Operations & Space Radar
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
          Find vacant classrooms instantly, request gate visitor clearance, and track campus lab services.
        </p>

        {/* Live Quick Counter Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--status-available-bg)',
          border: '1px solid var(--status-available-border)',
          color: 'var(--status-available-text)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: '0.85rem'
        }}>
          <span className="pulse-dot available" />
          <span>{stats.availableRooms || 6} Classrooms Free Right Now</span>
        </div>
      </div>

      {/* 4 Core Quick Access Action Cards (Touch-Optimized for Mobile) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
        marginBottom: '2rem'
      }}>
        
        {/* Card 1: Classroom Occupancy */}
        <div 
          onClick={() => onNavigate('classrooms')}
          className="card-amrita"
          style={{
            padding: '1.15rem',
            cursor: 'pointer',
            borderLeft: '4px solid var(--status-available)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--status-available-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Compass size={22} color="var(--status-available)" />
              </div>
              <span className="badge badge-available">Live Matrix</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Classroom Occupancy
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Find free lecture halls & labs with live schedules and crowd reports.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Find Rooms Now</span>
            <ArrowRight size={15} />
          </div>
        </div>

        {/* Card 2: Parent Gate Pass */}
        <div 
          onClick={() => onNavigate('parent-epass')}
          className="card-amrita"
          style={{
            padding: '1.15rem',
            cursor: 'pointer',
            borderLeft: '4px solid var(--amrita-maroon)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--amrita-maroon-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={22} color="var(--amrita-maroon)" />
              </div>
              <span className="badge badge-maroon">E-Governance</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Parent Gate Pass
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Fast QR pre-clearance for parent hostel visits and gate verification.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Generate Pass</span>
            <ArrowRight size={15} />
          </div>
        </div>

        {/* Card 3: FabLab Service */}
        <div 
          onClick={() => onNavigate('fablab')}
          className="card-amrita"
          style={{
            padding: '1.15rem',
            cursor: 'pointer',
            borderLeft: '4px solid var(--status-lab)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--status-lab-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={22} color="var(--status-lab)" />
              </div>
              <span className="badge badge-lab">Makerspace</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              FabLab Service Request
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Interactive intake assistant for 3D printing & PCB fabrication.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Submit Request</span>
            <ArrowRight size={15} />
          </div>
        </div>

        {/* Card 4: Admin Portal */}
        <div 
          onClick={() => onNavigate('admin')}
          className="card-amrita"
          style={{
            padding: '1.15rem',
            cursor: 'pointer',
            borderLeft: '4px solid var(--amrita-gold)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--amrita-gold-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sliders size={22} color="var(--amrita-gold)" />
              </div>
              <span className="badge badge-flagged">Admin</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              Admin Console
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Edit timetables, manage rooms, and review student crowd reports.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Manage Portal</span>
            <ArrowRight size={15} />
          </div>
        </div>

      </div>

      {/* Quick Classroom Availability Finder Right on Landing Page */}
      <div className="card-amrita" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Quick Room Finder
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Check live status of any room on campus right now
            </p>
          </div>

          <button
            onClick={() => onNavigate('classrooms')}
            className="btn-amrita"
            style={{ minHeight: '38px', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <span>Full Matrix</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Quick Search & Block Filters */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search room (e.g. 101, 204)..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', minHeight: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {['All', 'AB-1', 'AB-2', 'AB-3'].map(b => (
              <button
                key={b}
                onClick={() => setQuickBlock(b)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: quickBlock === b ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                  backgroundColor: quickBlock === b ? 'var(--amrita-maroon-bg)' : '#ffffff',
                  color: quickBlock === b ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Room Results Cards */}
        {filteredQuickRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No rooms match your search. Click "Full Matrix" to explore all.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {filteredQuickRooms.map(room => {
              const isAvail = room.status === 'available';
              const isFlag = room.is_flagged || room.status === 'flagged_occupied';
              return (
                <div 
                  key={room.id}
                  onClick={() => onNavigate('classrooms')}
                  style={{
                    backgroundColor: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      Room {room.room_number}
                    </span>
                    <span className={`badge ${isFlag ? 'badge-flagged' : isAvail ? 'badge-available' : 'badge-occupied'}`} style={{ fontSize: '0.675rem' }}>
                      {isFlag ? 'Flagged' : isAvail ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {room.block} • Floor {room.floor} • {room.capacity} Seats
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

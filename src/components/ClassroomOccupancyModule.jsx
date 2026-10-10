import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Compass, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Flag, 
  RefreshCw,
  Filter,
  Wind,
  Tv,
  Zap,
  Monitor
} from 'lucide-react';
import { api } from '../services/api';
import RoomTimetableModal from './RoomTimetableModal';
import ReportRoomModal from './ReportRoomModal';

export default function ClassroomOccupancyModule({ simulatedContext }) {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Modals state
  const [timetableModalRoom, setTimetableModalRoom] = useState(null);
  const [reportModalRoom, setReportModalRoom] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getClassrooms(simulatedContext.day, simulatedContext.time);
      setClassrooms(res.classrooms || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [simulatedContext.day, simulatedContext.time]);

  const toggleAmenity = (key) => {
    if (selectedAmenities.includes(key)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== key));
    } else {
      setSelectedAmenities([...selectedAmenities, key]);
    }
  };

  const filteredClassrooms = classrooms.filter(room => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.currentSession?.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.flagAlert?.batch || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedBlock !== 'All' && room.block !== selectedBlock) return false;
    if (selectedType !== 'All' && room.room_type !== selectedType) return false;
    if (selectedStatus === 'available' && room.status !== 'available') return false;
    if (selectedStatus === 'occupied' && room.status !== 'occupied' && room.status !== 'reported_occupied') return false;
    if (selectedStatus === 'flagged' && !room.is_flagged && room.status !== 'flagged_occupied') return false;

    if (selectedAmenities.length > 0) {
      const roomAmenities = Array.isArray(room.amenities) ? room.amenities : [];
      const hasAll = selectedAmenities.every(a => roomAmenities.includes(a));
      if (!hasAll) return false;
    }

    return true;
  });

  const blocks = ['All', 'AB-1', 'AB-2', 'AB-3', 'CIR'];

  const availableCount = classrooms.filter(r => r.status === 'available').length;
  const occupiedCount = classrooms.filter(r => r.status === 'occupied' || r.status === 'reported_occupied').length;
  const flaggedCount = classrooms.filter(r => r.is_flagged || r.status === 'flagged_occupied').length;

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Header & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.65rem)', color: 'var(--text-main)', fontWeight: 800 }}>
            Classroom & Lab Occupancy
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time space radar across Amrita campus blocks
          </p>
        </div>

        <button 
          onClick={loadData}
          className="btn-secondary"
          style={{ minHeight: '38px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Status Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.65rem 0.85rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        overflowX: 'auto',
        fontSize: '0.8rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
          <span className="pulse-dot available" />
          <span>Available: <strong>{availableCount}</strong></span>
        </div>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
          <span className="pulse-dot occupied" />
          <span>In Class: <strong>{occupiedCount}</strong></span>
        </div>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
          <span className="pulse-dot flagged" />
          <span>Flagged: <strong>{flaggedCount}</strong></span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="card-amrita" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Room Number (101, 204), Block, or Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', minHeight: '42px' }}
            />
          </div>

          {/* Block Filter Horizontal Scroll Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: '4px' }}>
              BLOCK:
            </span>
            {blocks.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBlock(b)}
                style={{
                  padding: '0.4rem 0.85rem',
                  minHeight: '36px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedBlock === b ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                  backgroundColor: selectedBlock === b ? 'var(--amrita-maroon-bg)' : '#ffffff',
                  color: selectedBlock === b ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
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

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {[
              { id: 'All', label: 'All Status' },
              { id: 'available', label: 'Available' },
              { id: 'occupied', label: 'In Class' },
              { id: 'flagged', label: 'Flagged' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.5rem',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedStatus === tab.id ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                  backgroundColor: selectedStatus === tab.id ? 'var(--amrita-maroon)' : '#ffffff',
                  color: selectedStatus === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Classroom Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem', color: 'var(--amrita-maroon)' }} />
          <p style={{ fontSize: '0.85rem' }}>Loading campus room matrix...</p>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="card-amrita" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Compass size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
          <p style={{ fontWeight: 600 }}>No classrooms match your filter</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {filteredClassrooms.map((room) => {
            const isAvailable = room.status === 'available';
            const isFlagged = room.is_flagged || room.status === 'flagged_occupied';
            const isOccupied = room.status === 'occupied' || room.status === 'reported_occupied';
            const flag = room.flagAlert;

            return (
              <div
                key={room.id}
                className="card-amrita"
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isFlagged
                    ? '4px solid var(--amrita-gold)'
                    : isAvailable
                      ? '4px solid var(--status-available)'
                      : '4px solid var(--status-occupied)'
                }}
              >
                <div>
                  {/* Top Bar: Room Number & Block */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Room {room.room_number}
                        </span>
                        {isFlagged && (
                          <span className="badge badge-flagged" style={{ fontSize: '0.65rem' }}>
                            <AlertTriangle size={11} /> FLAGGED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {room.block} • Floor {room.floor} • {room.capacity} Seats
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      color: 'var(--text-secondary)',
                      textTransform: 'capitalize',
                      fontWeight: 600
                    }}>
                      {room.room_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Banner */}
                  <div style={{ marginBottom: '1rem' }}>
                    {/* FLAGGED WARNING */}
                    {isFlagged && flag && (
                      <div style={{
                        backgroundColor: 'var(--status-flagged-bg)',
                        border: '1px solid var(--status-flagged-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-flagged-text)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          <AlertTriangle size={14} />
                          <span>Flagged: Reported {flag.count}x Unscheduled</span>
                        </div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                          <strong>Batch:</strong> {flag.batch} ({flag.department})
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--status-flagged-text)' }}>
                          Activity: {flag.purpose} {flag.is_lab && '🔬 (Lab)'}
                        </div>
                      </div>
                    )}

                    {/* SCHEDULED OCCUPIED */}
                    {!isFlagged && isOccupied && (
                      <div style={{
                        backgroundColor: 'var(--status-occupied-bg)',
                        border: '1px solid var(--status-occupied-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-occupied-text)', fontWeight: 700, fontSize: '0.8rem' }}>
                            <span className="pulse-dot occupied" />
                            <span>{room.badgeText}</span>
                          </div>
                          {room.currentSession?.is_lab && (
                            <span className="badge badge-lab" style={{ fontSize: '0.65rem' }}>
                              <FlaskConical size={10} /> Lab Class
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {room.currentSession?.subject_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {room.currentSession?.batch} • {room.currentSession?.department}
                        </div>
                      </div>
                    )}

                    {/* AVAILABLE */}
                    {!isFlagged && isAvailable && (
                      <div style={{
                        backgroundColor: 'var(--status-available-bg)',
                        border: '1px solid var(--status-available-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-available-text)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <span className="pulse-dot available" />
                          <span>{room.badgeText}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--status-available-text)' }}>
                          {room.nextSlot ? `Free until ${room.nextSlot.start_time}` : 'Free all day for study & project teams'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amenities Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {Array.isArray(room.amenities) && room.amenities.map((item, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.675rem',
                          backgroundColor: 'var(--bg-surface-alt)',
                          border: '1px solid var(--border-light)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {item.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons (Touch friendly) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setTimetableModalRoom(room)}
                    className="btn-secondary"
                    style={{ minHeight: '38px', padding: '0.4rem', fontSize: '0.775rem' }}
                  >
                    <Calendar size={13} />
                    <span>Timetable</span>
                  </button>

                  <button
                    onClick={() => setReportModalRoom(room)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      minHeight: '38px',
                      backgroundColor: 'var(--amrita-maroon-bg)',
                      color: 'var(--amrita-maroon)',
                      border: '1px solid var(--amrita-maroon-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Flag size={13} />
                    <span>Report</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RoomTimetableModal
        isOpen={Boolean(timetableModalRoom)}
        onClose={() => setTimetableModalRoom(null)}
        classroom={timetableModalRoom}
      />

      <ReportRoomModal
        isOpen={Boolean(reportModalRoom)}
        onClose={() => setReportModalRoom(null)}
        classroom={reportModalRoom}
        onReportSubmitted={() => loadData()}
      />

    </div>
  );
}

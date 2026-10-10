import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Compass, 
  Clock, 
  Users, 
  Building, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Tv, 
  Wind, 
  Zap, 
  Monitor, 
  HelpCircle,
  Flag,
  Sparkles,
  RefreshCw,
  Info
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
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'available' | 'occupied' | 'flagged'
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

  // Filter logic
  const filteredClassrooms = classrooms.filter(room => {
    // Search
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.currentSession?.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.flagAlert?.batch || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Block filter
    if (selectedBlock !== 'All' && room.block !== selectedBlock) return false;

    // Type filter
    if (selectedType !== 'All' && room.room_type !== selectedType) return false;

    // Status filter
    if (selectedStatus === 'available' && room.status !== 'available') return false;
    if (selectedStatus === 'occupied' && room.status !== 'occupied' && room.status !== 'reported_occupied') return false;
    if (selectedStatus === 'flagged' && !room.is_flagged && room.status !== 'flagged_occupied') return false;

    // Amenities filter
    if (selectedAmenities.length > 0) {
      const roomAmenities = Array.isArray(room.amenities) ? room.amenities : [];
      const hasAll = selectedAmenities.every(a => roomAmenities.includes(a));
      if (!hasAll) return false;
    }

    return true;
  });

  const blocks = ['All', 'AB-1', 'AB-2', 'AB-3', 'CIR'];
  const roomTypes = [
    { id: 'All', label: 'All Room Types' },
    { id: 'lecture_hall', label: 'Lecture Halls' },
    { id: 'lab_computer', label: 'Computer Labs' },
    { id: 'lab_electronics', label: 'IoT & Hardware Labs' },
    { id: 'project_room', label: 'Project Pods' },
    { id: 'seminar_hall', label: 'Seminar Halls' }
  ];

  // Counts
  const availableCount = classrooms.filter(r => r.status === 'available').length;
  const occupiedCount = classrooms.filter(r => r.status === 'occupied' || r.status === 'reported_occupied').length;
  const flaggedCount = classrooms.filter(r => r.is_flagged || r.status === 'flagged_occupied').length;

  return (
    <div style={{ padding: '1.5rem 0 4rem' }}>
      
      {/* Title & Context */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-emerald">Live Classroom Space Locator</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Current Matrix: <strong>{simulatedContext.day} ({simulatedContext.time || 'Live Clock'})</strong>
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Classroom & Lab Occupancy Matrix
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time schedule cross-indexing and student crowd verification. No reservations required — instant availability for student project teams.
          </p>
        </div>

        <button 
          onClick={loadData}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
          title="Refresh Room Matrix"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Live Matrix</span>
        </button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        background: 'rgba(17, 24, 39, 0.65)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        fontSize: '0.825rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <Compass size={15} color="#818cf8" />
          <span>Total Indexed: <strong>{classrooms.length}</strong></span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
          <span className="pulse-dot dot-available" />
          <span>Available Now: <strong>{availableCount}</strong></span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185' }}>
          <span className="pulse-dot dot-occupied" />
          <span>In Scheduled Class: <strong>{occupiedCount}</strong></span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>Flagged Unscheduled: <strong>{flaggedCount}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Search Input & Status Filters */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by Room Number (e.g. 101, 204), Block, or Batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0, 0, 0, 0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {[
                { id: 'All', label: 'All Status' },
                { id: 'available', label: '🟢 Available' },
                { id: 'occupied', label: '🔴 Occupied' },
                { id: 'flagged', label: '⚠️ Flagged' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedStatus === tab.id ? 'var(--primary)' : 'transparent',
                    color: selectedStatus === tab.id ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Block Selection Pills & Room Types */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Block Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>BLOCK:</span>
              {blocks.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBlock(b)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    border: selectedBlock === b ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                    background: selectedBlock === b ? 'rgba(79, 70, 229, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedBlock === b ? '#c7d2fe' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Room Type Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TYPE:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.775rem'
                }}
              >
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AMENITIES:</span>
            
            {[
              { id: 'ac', label: 'Air Conditioned', icon: Wind },
              { id: 'projector', label: 'Projector', icon: Tv },
              { id: 'power_sockets', label: 'High Power Sockets', icon: Zap },
              { id: 'smart_board', label: 'Smart Board', icon: Monitor }
            ].map(amenity => {
              const Icon = amenity.icon;
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #34d399' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isSelected ? '#34d399' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={12} />
                  <span>{amenity.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Classrooms Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem', color: '#818cf8' }} />
          <p>Indexing campus block timetables & telemetry...</p>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <Compass size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.4rem' }}>No matching classrooms found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Try relaxing your search terms or filters to locate open spaces.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredClassrooms.map((room) => {
            const isAvailable = room.status === 'available';
            const isFlagged = room.is_flagged || room.status === 'flagged_occupied';
            const isOccupied = room.status === 'occupied' || room.status === 'reported_occupied';
            const flag = room.flagAlert;

            return (
              <div 
                key={room.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isFlagged 
                    ? '1.5px solid rgba(245, 158, 11, 0.65)' 
                    : isAvailable 
                      ? '1px solid rgba(16, 185, 129, 0.35)' 
                      : '1px solid rgba(244, 63, 94, 0.35)',
                  background: isFlagged
                    ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(19, 27, 46, 0.85) 100%)'
                    : 'var(--bg-card)',
                  boxShadow: isFlagged ? '0 0 25px -5px rgba(245, 158, 11, 0.25)' : 'var(--shadow-md)'
                }}
              >
                <div>
                  {/* Top Bar: Room Number & Block */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                          Room {room.room_number}
                        </span>
                        {isFlagged && (
                          <span className="badge badge-amber" style={{ fontSize: '0.675rem' }} title="Reported >=2 times this week for unscheduled use">
                            <AlertTriangle size={11} /> FLAGGED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                        <span>{room.block}</span>
                        <span>•</span>
                        <span>Floor {room.floor}</span>
                        <span>•</span>
                        <span>{room.capacity} Seats</span>
                      </div>
                    </div>

                    {/* Room Type Tag */}
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}>
                      {room.room_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Ground Status Box */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    
                    {/* CASE 1: PERMANENTLY FLAGGED */}
                    {isFlagged && flag && (
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <AlertTriangle size={15} />
                          <span>Flagged: Reported {flag.count}x Unscheduled This Week</span>
                        </div>
                        <div style={{ color: '#fef08a', fontSize: '0.775rem', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                          {flag.reason}
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.65rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                          <div><strong>Occupying Batch:</strong> {flag.batch}</div>
                          <div><strong>Department:</strong> {flag.department}</div>
                          <div><strong>Activity:</strong> {flag.purpose} {flag.is_lab && '🔬 (Lab Session)'}</div>
                        </div>
                        <div style={{ marginTop: '0.45rem', fontSize: '0.725rem', color: '#fde68a' }}>
                          ⚠️ <em>Room may NOT be vacant even if master timetable shows free!</em>
                        </div>
                      </div>
                    )}

                    {/* CASE 2: SCHEDULED OCCUPIED */}
                    {!isFlagged && isOccupied && (
                      <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: '10px',
                        padding: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fb7185', fontWeight: 700, fontSize: '0.825rem' }}>
                            <span className="pulse-dot dot-occupied" />
                            <span>{room.badgeText}</span>
                          </div>
                          {room.currentSession?.is_lab && (
                            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                              <FlaskConical size={10} /> Lab Class
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>
                          {room.currentSession?.subject_name}
                        </div>
                        
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><strong>Batch:</strong> {room.currentSession?.batch}</div>
                          <div><strong>Dept:</strong> {room.currentSession?.department}</div>
                          {room.currentSession?.end_time && (
                            <div style={{ color: '#fda4af', marginTop: '2px' }}>
                              <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                              Occupied until {room.currentSession?.end_time}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CASE 3: AVAILABLE NOW */}
                    {!isFlagged && isAvailable && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '10px',
                        padding: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#34d399', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                          <span className="pulse-dot dot-available" />
                          <span>{room.badgeText}</span>
                        </div>
                        
                        <div style={{ fontSize: '0.775rem', color: '#d1fae5' }}>
                          {room.nextSlot ? (
                            <span>
                              Free until <strong>{room.nextSlot.start_time}</strong> (Next: {room.nextSlot.subject_name} - {room.nextSlot.batch})
                            </span>
                          ) : (
                            <span>No further scheduled lectures today. Free for study & project teams!</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Amenities Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {Array.isArray(room.amenities) && room.amenities.map((item, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.675rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem 0.5rem',
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

                {/* Card Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <button
                    onClick={() => setTimetableModalRoom(room)}
                    className="btn-secondary"
                    style={{ fontSize: '0.775rem', padding: '0.5rem' }}
                  >
                    <Calendar size={13} />
                    <span>View Schedule</span>
                  </button>

                  <button
                    onClick={() => setReportModalRoom(room)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: isFlagged ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.15)',
                      color: isFlagged ? '#fcd34d' : '#fb7185',
                      border: `1px solid ${isFlagged ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.3)'}`,
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Flag size={13} />
                    <span>Report Status</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Timetable Modal */}
      <RoomTimetableModal
        isOpen={Boolean(timetableModalRoom)}
        onClose={() => setTimetableModalRoom(null)}
        classroom={timetableModalRoom}
      />

      {/* Crowdsourced Report Modal */}
      <ReportRoomModal
        isOpen={Boolean(reportModalRoom)}
        onClose={() => setReportModalRoom(null)}
        classroom={reportModalRoom}
        onReportSubmitted={() => {
          loadData();
        }}
      />

    </div>
  );
}

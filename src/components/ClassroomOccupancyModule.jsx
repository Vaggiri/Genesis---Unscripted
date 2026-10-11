import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Compass, 
  Calendar, 
  AlertTriangle, 
  FlaskConical, 
  Flag, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import RoomTimetableModal from './RoomTimetableModal';
import ReportRoomModal from './ReportRoomModal';

export default function ClassroomOccupancyModule({ simulatedContext = {}, user }) {
  const isFaculty = user?.role === 'faculty';
  const [bookingRoomModal, setBookingRoomModal] = useState(null);
  const [facultyPurpose, setFacultyPurpose] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState(1);
  const [bookingError, setBookingError] = useState(null);
  const [bookingAlternatives, setBookingAlternatives] = useState([]);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [timetableModalRoom, setTimetableModalRoom] = useState(null);
  const [reportModalRoom, setReportModalRoom] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getClassrooms(simulatedContext.day, simulatedContext.time);
      if (data && data.classrooms) {
        setClassrooms(data.classrooms);
      }
    } catch (err) {
      console.warn('Failed to load classrooms:', err);
    } finally {
      setLoading(false);
    }
  }, [simulatedContext.day, simulatedContext.time]);

  const handleConfirmRoomBooking = async () => {
    if (!bookingRoomModal) return;
    setSubmittingBooking(true);
    setBookingError(null);
    setBookingAlternatives([]);

    try {
      await api.bookRoom({
        room_id: bookingRoomModal.id,
        booking_date: bookingDate,
        slot_number: Number(bookingSlot),
        purpose: facultyPurpose || 'Faculty Academic Session'
      });
      setBookingRoomModal(null);
      setFacultyPurpose('');
      loadData();
    } catch (err) {
      if (err.status === 409) {
        setBookingError(err.message || 'Room conflict detected.');
        if (err.data?.alternatives) {
          setBookingAlternatives(err.data.alternatives);
        }
      } else {
        setBookingError(err.message || 'Failed to book room.');
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleMarkClassVacant = async (room) => {
    if (!window.confirm(`Mark class in ${room.room_number} as cancelled/vacant so other faculty or students can use it?`)) return;
    try {
      await api.submitReport({
        room_id: room.id,
        report_type: 'class_cancelled_empty',
        reported_batch: 'Faculty Notice',
        reported_department: 'Academic',
        purpose: 'Faculty notified class cancelled / free for session',
        occupancy_level: 'Empty'
      });
      alert(`Room ${room.room_number} marked as vacant! Space Radar updated.`);
      loadData();
    } catch (err) {
      alert(`Error marking vacant: ${err.message}`);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredClassrooms = classrooms.filter(room => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.currentSession?.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.flagAlert?.batch || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedBlock !== 'All' && room.block !== selectedBlock) return false;
    if (selectedStatus === 'available' && room.status !== 'available') return false;
    if (selectedStatus === 'occupied' && room.status !== 'occupied' && room.status !== 'reported_occupied') return false;
    if (selectedStatus === 'flagged' && !room.is_flagged && room.status !== 'flagged_occupied') return false;

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
                <div style={{ display: 'grid', gridTemplateColumns: isFaculty ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setTimetableModalRoom(room)}
                    className="btn-secondary"
                    style={{ minHeight: '36px', padding: '0.35rem', fontSize: '0.75rem' }}
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
                      gap: '0.3rem',
                      minHeight: '36px',
                      backgroundColor: 'var(--amrita-maroon-bg)',
                      color: 'var(--amrita-maroon)',
                      border: '1px solid var(--amrita-maroon-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Flag size={13} />
                    <span>Report</span>
                  </button>

                  {/* Faculty Exclusive Classroom Booking Feature */}
                  {isFaculty && (
                    <>
                      <button
                        onClick={() => handleMarkClassVacant(room)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '36px',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Mark your scheduled class as cancelled / free"
                      >
                        <span>Mark Free</span>
                      </button>

                      <button
                        onClick={() => {
                          setBookingRoomModal(room);
                          setBookingError(null);
                          setBookingAlternatives([]);
                        }}
                        disabled={room.status === 'occupied'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '36px',
                          backgroundColor: 'var(--amrita-maroon)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: room.status === 'occupied' ? 'not-allowed' : 'pointer',
                          opacity: room.status === 'occupied' ? 0.6 : 1
                        }}
                      >
                        <span>Book Room</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Faculty Room Reservation Modal */}
      {bookingRoomModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '1.5rem', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Faculty Classroom Reservation
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Reserving <strong>Room {bookingRoomModal.room_number}</strong> ({bookingRoomModal.block}, Floor {bookingRoomModal.floor})
            </p>

            {bookingError && (
              <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#9f1239' }}>
                <p style={{ fontWeight: 700 }}>⚠️ {bookingError}</p>
                {bookingAlternatives.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: 600 }}>Available alternative rooms for this slot:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                      {bookingAlternatives.map((alt) => (
                        <li key={alt.id} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setBookingRoomModal(alt)}>
                          {alt.room_number} ({alt.block}) - Click to pick
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Booking Date:
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Timetable Period / Slot:
                </label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(Number(e.target.value))}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value={1}>Slot 1 (08:45 - 09:35 AM)</option>
                  <option value={2}>Slot 2 (09:40 - 10:30 AM)</option>
                  <option value={3}>Slot 3 (10:45 - 11:35 AM)</option>
                  <option value={4}>Slot 4 (11:40 - 12:30 PM)</option>
                  <option value={5}>Slot 5 (01:30 - 02:20 PM)</option>
                  <option value={6}>Slot 6 (02:25 - 03:15 PM)</option>
                  <option value={7}>Slot 7 (03:30 - 04:20 PM)</option>
                  <option value={8}>Slot 8 (04:25 - 05:15 PM)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Academic Purpose / Session Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Remedial Session, Hackathon Mentoring, Project Review"
                value={facultyPurpose}
                onChange={(e) => setFacultyPurpose(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setBookingRoomModal(null)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoomBooking}
                disabled={submittingBooking}
                className="btn-amrita"
                style={{ fontSize: '0.8rem' }}
              >
                {submittingBooking ? 'Reserving...' : 'Confirm Room Reservation'}
              </button>
            </div>
          </div>
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

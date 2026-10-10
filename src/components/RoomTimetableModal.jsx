import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, User, FlaskConical, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function RoomTimetableModal({ isOpen, onClose, classroom }) {
  if (!isOpen || !classroom) return null;

  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      try {
        const data = await api.getTimetables(classroom.id);
        setTimetables(data || []);
      } catch (err) {
        console.error('Failed to load timetables:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [classroom.id]);

  const currentDaySlots = timetables
    .filter(t => t.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(79, 70, 229, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={22} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Master Timetable: Room {classroom.room_number}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {classroom.block} • Floor {classroom.floor} • Seating Capacity: {classroom.capacity}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.25)',
          overflowX: 'auto',
          padding: '0 1rem'
        }}>
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: selectedDay === day ? '2px solid var(--primary-light)' : '2px solid transparent',
                color: selectedDay === day ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule Content */}
        <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading master timetable from cloud database...
            </div>
          ) : currentDaySlots.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px dashed rgba(16, 185, 129, 0.25)',
              borderRadius: '12px'
            }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#6ee7b7', marginBottom: '0.4rem' }}>
                Entire Day Free & Vacant!
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                No scheduled academic lectures are booked for Room {classroom.room_number} on {selectedDay}. Ideal for hackathons, study circles, and project teams!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {currentDaySlots.map((slot, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: slot.is_lab ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${slot.is_lab ? 'rgba(6, 182, 212, 0.25)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '105px'
                    }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        SLOT #{slot.slot_number}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Clock size={12} color="#818cf8" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>
                          {slot.subject_name}
                        </h4>
                        {slot.subject_code && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            {slot.subject_code}
                          </span>
                        )}
                        {slot.is_lab && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.675rem' }}>
                            <FlaskConical size={11} /> Lab Practical
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        <span>
                          <strong>Batch:</strong> {slot.batch}
                        </span>
                        <span>
                          <strong>Department:</strong> {slot.department}
                        </span>
                        <span>
                          <User size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {slot.faculty_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            Close Timetable
          </button>
        </div>
      </div>
    </div>
  );
}

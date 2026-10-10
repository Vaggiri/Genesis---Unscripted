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
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--amrita-maroon-bg)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
              Timetable: Room {classroom.room_number}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {classroom.block} • Floor {classroom.floor} • Capacity {classroom.capacity} Seats
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Day Selector */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface-alt)',
          overflowX: 'auto',
          padding: '0 0.5rem'
        }}>
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.65rem 0.85rem',
                minHeight: '40px',
                background: 'transparent',
                border: 'none',
                borderBottom: selectedDay === day ? '2px solid var(--amrita-maroon)' : '2px solid transparent',
                color: selectedDay === day ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                fontWeight: selectedDay === day ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div style={{ padding: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading schedule...
            </div>
          ) : currentDaySlots.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              backgroundColor: 'var(--status-available-bg)',
              border: '1px dashed var(--status-available-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckCircle2 size={32} color="var(--status-available)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '1rem', color: 'var(--status-available-text)', fontWeight: 700, marginBottom: '0.25rem' }}>
                Entire Day Free & Vacant!
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                No scheduled academic lectures in Room {classroom.room_number} on {selectedDay}.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentDaySlots.map((slot, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {slot.subject_name}
                      </span>
                      {slot.is_lab && (
                        <span className="badge badge-lab" style={{ fontSize: '0.65rem' }}>
                          Lab
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {slot.batch} • {slot.department} • {slot.faculty_name}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg-surface-alt)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap'
                  }}>
                    {slot.start_time} - {slot.end_time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ minHeight: '36px', fontSize: '0.8rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

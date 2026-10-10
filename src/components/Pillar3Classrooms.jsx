import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Wind, 
  Tv, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sparkles,
  Layers,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CAMPUS_BLOCKS, INITIAL_ROOMS } from '../utils/mockData';
import { playSuccessSound } from '../utils/audio';

export default function Pillar3Classrooms() {
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVacant, setOnlyVacant] = useState(false);
  const [filterAc, setFilterAc] = useState(false);
  const [filterProjector, setFilterProjector] = useState(false);
  const [filterPower, setFilterPower] = useState(false);
  
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedRoomSchedule, setSelectedRoomSchedule] = useState(null);

  const filteredRooms = rooms.filter(room => {
    if (selectedBlock !== 'ALL' && room.blockId !== selectedBlock) return false;
    if (onlyVacant && room.status !== 'VACANT') return false;
    if (filterAc && !room.ac) return false;
    if (filterProjector && !room.projector) return false;
    if (filterPower && !room.powerOutlets) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return room.roomNumber.toLowerCase().includes(q) || 
             room.name.toLowerCase().includes(q) ||
             room.floor.toLowerCase().includes(q);
    }
    return true;
  });

  const vacantCount = rooms.filter(r => r.status === 'VACANT').length;
  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;

  const handleHoldRoom = (room) => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 }
    });
    playSuccessSound();
    alert(`🎉 Success! Reserved ${room.roomNumber} (${room.name}) for your Project Team for the next 45 minutes.`);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.08, pointerEvents: 'none' }}>
          <MapPin size={240} color="#10B981" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-emerald">PILLAR 3: RESOURCE UTILITY</span>
              <span className="badge badge-cyan">TIMETABLE-AWARE VACANCY</span>
            </div>
            <h1 style={{ fontSize: 28, color: '#FFFFFF', marginBottom: 6 }}>
              Live Classroom & Study Space Locator
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 740, lineHeight: 1.5 }}>
              Indexes academic block timetables across Amrita to uncover unoccupied air-conditioned classrooms, seminar halls, and project labs in real time—eliminating corridor wandering for hackathon teams.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 18px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-heading)' }}>{vacantCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>VACANT NOW</div>
            </div>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '10px 18px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FB7185', fontFamily: 'var(--font-heading)' }}>{occupiedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IN LECTURE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Selector Tabs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setSelectedBlock('ALL')}
          className={selectedBlock === 'ALL' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: 13, padding: '10px 20px' }}
        >
          All Academic Blocks ({rooms.length})
        </button>
        {CAMPUS_BLOCKS.map(block => (
          <button
            key={block.id}
            onClick={() => setSelectedBlock(block.id)}
            className={selectedBlock === block.id ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '10px 20px' }}
          >
            <span>{block.name}</span>
            <span className="badge badge-emerald" style={{ fontSize: 10, padding: '1px 6px', marginLeft: 6 }}>
              {block.freeRoomsNow} Free
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: 13 }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by Room ID (e.g. AB2-304), Name, or Floor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setOnlyVacant(!onlyVacant)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: onlyVacant ? '1px solid #10B981' : '1px solid var(--border-subtle)',
              background: onlyVacant ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
              color: onlyVacant ? '#34D399' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={14} />
            <span>Only Vacant Rooms</span>
          </button>

          <button
            onClick={() => setFilterAc(!filterAc)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: filterAc ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
              background: filterAc ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface-elevated)',
              color: filterAc ? '#38BDF8' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Wind size={14} />
            <span>Air Conditioned</span>
          </button>

          <button
            onClick={() => setFilterProjector(!filterProjector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: filterProjector ? '1px solid #8B5CF6' : '1px solid var(--border-subtle)',
              background: filterProjector ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface-elevated)',
              color: filterProjector ? '#A78BFA' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Tv size={14} />
            <span>Projector</span>
          </button>

          <button
            onClick={() => setFilterPower(!filterPower)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: filterPower ? '1px solid #F59E0B' : '1px solid var(--border-subtle)',
              background: filterPower ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-elevated)',
              color: filterPower ? '#FBBF24' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Zap size={14} />
            <span>Power Sockets</span>
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {filteredRooms.map(room => (
          <div 
            key={room.id}
            className="glass-panel"
            style={{
              padding: 20,
              borderTop: room.status === 'VACANT' ? '3px solid #10B981' : '3px solid #F43F5E',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* Room Top Bar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="brand-font" style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{room.roomNumber}</span>
                    <span className="mono-font" style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: 4 }}>
                      {room.floor}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600 }}>{room.name}</h4>
                </div>

                <span className={room.status === 'VACANT' ? 'badge badge-emerald' : 'badge badge-rose'}>
                  {room.status === 'VACANT' && <span className="pulsing-dot" style={{ width: 6, height: 6 }}></span>}
                  {room.status}
                </span>
              </div>

              {/* Status and Current Slot */}
              <div style={{
                background: room.status === 'VACANT' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                border: room.status === 'VACANT' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: room.status === 'VACANT' ? '#34D399' : '#FB7185' }}>
                  <Clock size={14} />
                  <span>{room.freeUntil}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Current Slot: {room.currentSubject}
                </div>
              </div>

              {/* Amenities list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {room.amenities.map((amenity, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      fontSize: 10, 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      color: 'var(--text-muted)', 
                      padding: '3px 8px', 
                      borderRadius: 4, 
                      border: '1px solid var(--border-subtle)' 
                    }}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                <Users size={14} />
                <span>Cap: <strong>{room.capacity} seats</strong></span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setSelectedRoomSchedule(room)}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '6px 10px' }}
                >
                  <Calendar size={13} />
                  Schedule
                </button>

                {room.status === 'VACANT' && (
                  <button
                    onClick={() => handleHoldRoom(room)}
                    className="btn-primary"
                    style={{ fontSize: 11, padding: '6px 12px', background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    <Bookmark size={13} />
                    Reserve 45m
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Room Timetable Schedule Inspector */}
      {selectedRoomSchedule && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 540, padding: 26, background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, color: '#FFFFFF' }}>{selectedRoomSchedule.roomNumber} Master Timetable</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedRoomSchedule.name} • {selectedRoomSchedule.floor}</span>
              </div>
              <button 
                onClick={() => setSelectedRoomSchedule(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-dim)' }}>09:00 AM – 10:30 AM</span>
                <span style={{ color: '#FFFFFF' }}>23CSE204: Operating Systems Lecture</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-dim)' }}>10:45 AM – 12:15 PM</span>
                <span style={{ color: '#FFFFFF' }}>23AIE302: Neural Networks Seminar</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: '#34D399', fontWeight: 600 }}>12:15 PM – 06:30 PM (CURRENT)</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>FREE WINDOW • OPEN COLLABORATION</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-dim)' }}>06:30 PM – 08:00 PM</span>
                <span style={{ color: '#FFFFFF' }}>IEEE Student Branch Workshop</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedRoomSchedule(null)}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Close Timetable Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

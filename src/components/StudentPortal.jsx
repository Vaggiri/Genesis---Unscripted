import React, { useState } from 'react';
import {
  Bot,
  Building2,
  Cpu,
  Calendar,
  CheckCircle2,
  User,
  Settings,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';
import SmartLabFinderBot from './SmartLabFinderBot';
import LabDirectoryView from './LabDirectoryView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';

export default function StudentPortal({ user, simulatedContext, bookings = [], onNewBooking }) {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState('ai_bot'); // 'ai_bot' | 'directory' | 'my_bookings' | 'classrooms' | 'profile'

  const myBookings = bookings.filter(b => b.studentRoll === user?.roll_no);

  const navTabs = [
    { id: 'ai_bot', label: 'AI Matcher', icon: Bot, isHighlight: true },
    { id: 'directory', label: 'Labs & Stock', icon: Building2 },
    { id: 'my_bookings', label: `My Requests (${myBookings.length})`, icon: Clock },
    { id: 'classrooms', label: 'Space Radar', icon: Calendar },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  return (
    <div style={{ padding: '1.25rem 0 3.5rem' }}>

      {/* Student Profile Overview Card */}
      <div className="card-amrita" style={{
        padding: '1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.15rem'
          }}>
            AK
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {user?.name || 'Adithya K.'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Student Innovator
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Roll No: <strong>{user?.roll_no || 'CB.EN.U4CSE23012'}</strong> • {user?.department || 'Computer Science & Engineering'} • {user?.batch || 'B.Tech CSE-B'}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Active Project Slots:</span>{' '}
            <strong style={{ color: 'var(--amrita-maroon)' }}>{myBookings.length} Booked</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Classroom Access:</span>{' '}
            <span style={{ color: 'var(--status-available)', fontWeight: 700 }}>Occupancy Radar (View Only)</span>
          </div>
        </div>
      </div>

      {/* Navigation Ribbons Grid (Amrita Theme, No horizontal scrolling, Desktop only now) */}
      <div className="amrita-tile-grid" style={{ marginBottom: '1.25rem' }}>
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`amrita-ribbon-tile ${isActive ? 'active' : ''}`}
              style={{
                outline: 'none',
                backgroundColor: isActive ? '#fff9fa' : tab.isHighlight ? '#fef2f4' : '#ffffff'
              }}
            >
              <span className="amrita-ribbon-tile-label" style={{ fontWeight: tab.isHighlight ? 800 : 700 }}>
                {tab.label}
              </span>
              <div className="amrita-ribbon-tile-ribbon" style={{ backgroundColor: tab.isHighlight ? 'var(--amrita-maroon-dark)' : 'var(--amrita-maroon)' }}>
                <Icon size={16} color="#ffffff" strokeWidth={2.2} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab Container */}
      <div>

        {/* 1. AI Lab Finder Bot */}
        {activeTab === 'ai_bot' && (
          <SmartLabFinderBot
            user={user}
            onBookingSubmitted={(newReq) => {
              onNewBooking(newReq);
              setActiveTab('my_bookings');
            }}
          />
        )}

        {/* 2. Innovation Labs & Component Stock Directory */}
        {activeTab === 'directory' && (
          <LabDirectoryView
            onBookLab={(lab) => {
              setActiveTab('ai_bot');
            }}
          />
        )}

        {/* 3. My Bookings Status & Approval Queue */}
        {activeTab === 'my_bookings' && (
          <div className="card-amrita" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  My Innovation Facility Requests
                </h3>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Track requests submitted via the AI matcher. Faculty sign-off is required prior to equipment access.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ai_bot')}
                className="btn-amrita"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                + New Request
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No active lab requests yet.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Use the AI Matcher bot to describe your project and reserve lab time!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myBookings.map(b => (
                  <div
                    key={b.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          {b.labName}
                        </strong>
                        <span className={`badge ${b.status === 'approved' ? 'badge-available' : b.status === 'rejected' ? 'badge-occupied' : 'badge-flagged'}`}>
                          {b.status === 'approved' ? 'APPROVED' : b.status === 'rejected' ? 'DECLINED' : 'PENDING FACULTY APPROVAL'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--amrita-maroon)', fontWeight: 600, margin: '0 0 2px' }}>
                        Project: {b.projectTitle}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Slot: <strong>{b.slotTime}</strong> • Faculty Assigned: <strong>{b.facultyAssigned}</strong> • Submitted: {b.submittedAt}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {b.status === 'approved' ? (
                        <div style={{ color: 'var(--status-available)', fontWeight: 700, fontSize: '0.785rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} />
                          <span>Pass Ready for Lab Entry</span>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--status-flagged)', fontWeight: 600, fontSize: '0.75rem' }}>
                          Awaiting In-Charge Review
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Classroom Occupancy Radar (Strictly View-Only for Students) */}
        {activeTab === 'classrooms' && (
          <div>
            <div style={{
              backgroundColor: 'var(--amrita-maroon-bg)',
              border: '1px solid var(--amrita-maroon-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              color: 'var(--amrita-maroon)',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>Student Academic Notice:</strong> You can view real-time classroom occupancy & department timetables to discover open study spots.
              </span>
            </div>

            <ClassroomOccupancyModule
              simulatedContext={simulatedContext}
              user={user}
            />
          </div>
        )}

        {/* 5. Profile & Settings */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '1rem' }}>
                Student Innovator Profile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Student Name</span>
                  <strong>{user?.name}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Roll Number</span>
                  <strong>{user?.roll_no}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Department</span>
                  <strong>{user?.department}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Batch / Year</span>
                  <strong>{user?.batch}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Institutional Email</span>
                  <strong>{user?.email}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Faculty Mentor</span>
                  <strong>Dr. K. Swaminathan (AMR-FAC-209)</strong>
                </div>
              </div>
            </div>

            <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} /> Notification Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Notify me via email when Faculty approves my lab booking</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Alert me when idle machine gap becomes available on 3D printers</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Send slot reminder 30 minutes before lab reservation</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span style={{ fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {tab.id === 'my_bookings' ? 'Requests' : tab.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

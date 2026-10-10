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
  ChevronRight,
  LogOut
} from 'lucide-react';
import SmartLabFinderBot from './SmartLabFinderBot';
import LabDirectoryView from './LabDirectoryView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';

export default function StudentPortal({ user, simulatedContext, bookings = [], onNewBooking, onLogout }) {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState('ai_bot'); // 'ai_bot' | 'directory' | 'my_bookings' | 'classrooms' | 'profile'

  const myBookings = bookings.filter(b => b.studentRoll === user?.roll_no);

  const navTabs = [
    { id: 'ai_bot', label: 'AI Lab Matcher', shortLabel: 'AI Match', icon: Sparkles },
    { id: 'directory', label: 'Labs & Stock', shortLabel: 'Labs', icon: Building2 },
    { id: 'my_bookings', label: 'My Requests', shortLabel: 'Requests', icon: Clock, count: myBookings.length },
    { id: 'classrooms', label: 'Space Radar', shortLabel: 'Radar', icon: Calendar },
    { id: 'profile', label: 'Profile & Settings', shortLabel: 'Profile', icon: User }
  ];

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>

      {/* Student Profile Overview Card */}
      <div className="card-amrita" style={{
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(164, 18, 63, 0.25)',
            flexShrink: 0
          }}>
            AK
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {user?.name || 'Adithya K.'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Student Innovator
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Roll No: <strong>{user?.roll_no || 'CB.EN.U4AIE23045'}</strong> • {user?.department || 'Computer Science & Engineering'}
            </div>
          </div>
        </div>

        {/* Quick Stats & Log Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Slots:</span>{' '}
            <strong style={{ color: 'var(--amrita-maroon)' }}>{myBookings.length} Active</strong>
          </div>
          <button
            onClick={onLogout}
            className="hide-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#b91c1c',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Log Out of Session"
          >
            <LogOut size={13} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Modern Desktop Segmented Tab Navigation Bar */}
      <nav className="nav-segmented-bar" aria-label="Portal Navigation">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`nav-segment-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="nav-counter-pill">{tab.count}</span>
              )}
            </button>
          );
        })}
      </nav>

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
            <div className="mobile-stack-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  My Innovation Facility Requests
                </h3>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.45 }}>
                  Track requests submitted via the AI matcher. Faculty sign-off is required prior to equipment access.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ai_bot')}
                className="btn-amrita mobile-full-btn"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', whiteSpace: 'nowrap' }}
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
                          <span>Approved • Slot Reserved</span>
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

            {/* Session Security Card with Explicit Log Out Button */}
            <div className="card-amrita" style={{ padding: '1.25rem 1.5rem', maxWidth: '640px', borderLeft: '4px solid #ef4444' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={16} /> Session Security
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                Currently logged in as student <strong>{user?.name}</strong> ({user?.roll_no}). Log out when working on public or lab workstations.
              </p>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <LogOut size={15} />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Native Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="mobile-badge">{tab.count}</span>
                )}
              </div>
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

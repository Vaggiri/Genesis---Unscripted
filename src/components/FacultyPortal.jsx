import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Building2, 
  Calendar, 
  UserCheck, 
  Clock, 
  Settings, 
  User, 
  Bot, 
  Sparkles, 
  BookOpen,
  LogOut
} from 'lucide-react';
import FacultyApprovalsView from './FacultyApprovalsView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import LabDirectoryView from './LabDirectoryView';
import SmartLabFinderBot from './SmartLabFinderBot';

export default function FacultyPortal({ user, simulatedContext, bookings = [], onApprove, onReject, onNewBooking, onLogout }) {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'classrooms' | 'bot' | 'directory' | 'profile'

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const facultyTabs = [
    { id: 'approvals', label: 'Approvals Queue', shortLabel: 'Approvals', icon: UserCheck, count: pendingCount },
    { id: 'classrooms', label: 'Classrooms Radar', shortLabel: 'Classrooms', icon: Calendar },
    { id: 'bot', label: 'AI Matcher', shortLabel: 'AI Match', icon: Sparkles },
    { id: 'directory', label: 'Labs & Stock', shortLabel: 'Labs', icon: Building2 },
    { id: 'profile', label: 'Profile & Settings', shortLabel: 'Profile', icon: User }
  ];

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>

      {/* Faculty Profile Overview Card */}
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
            KS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {user?.name || 'Dr. K. Swaminathan'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Faculty & Lab In-Charge
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ID: <strong>{user?.emp_id || 'AMR-FAC-209'}</strong> • {user?.department || 'Computer Science & Engineering'}
            </div>
          </div>
        </div>

        {/* Quick Privilege Badges & Log Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div className="hide-mobile" style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ padding: '0.3rem 0.6rem', backgroundColor: 'var(--status-available-bg)', color: 'var(--status-available-text)', border: '1px solid var(--status-available-border)', borderRadius: '6px', fontWeight: 700 }}>
              Classroom Reservation
            </span>
            <span style={{ padding: '0.3rem 0.6rem', backgroundColor: 'var(--amrita-maroon-bg)', color: 'var(--amrita-maroon)', border: '1px solid var(--amrita-maroon-border)', borderRadius: '6px', fontWeight: 700 }}>
              Lab Sign-off
            </span>
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
      <nav className="nav-segmented-bar" aria-label="Faculty Navigation">
        {facultyTabs.map(tab => {
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

      {/* Active Tab View */}
      <div>

        {/* 1. Student Lab Booking Approvals Queue */}
        {activeTab === 'approvals' && (
          <FacultyApprovalsView
            bookings={bookings}
            onApprove={onApprove}
            onReject={onReject}
            facultyUser={user}
          />
        )}

        {/* 2. Classroom Space Radar & Faculty Reservation */}
        {activeTab === 'classrooms' && (
          <div>
            <div style={{
              backgroundColor: 'var(--status-available-bg)',
              border: '1px solid var(--status-available-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              color: 'var(--status-available-text)',
              fontWeight: 700,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>Faculty Exclusive:</strong> You can reserve any unoccupied classroom across AB-1 and AB-3.
              </span>
            </div>

            <ClassroomOccupancyModule
              simulatedContext={simulatedContext}
              user={user}
            />
          </div>
        )}

        {/* 3. AI Lab Finder Bot */}
        {activeTab === 'bot' && (
          <SmartLabFinderBot
            user={user}
            onBookingSubmitted={onNewBooking}
          />
        )}

        {/* 4. Innovation Labs & Component Stock Directory */}
        {activeTab === 'directory' && (
          <LabDirectoryView
            onBookLab={(lab) => setActiveTab('bot')}
          />
        )}

        {/* 5. Profile & Settings */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '1rem' }}>
                Faculty Official Profile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Faculty Name</span>
                  <strong>{user?.name}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Employee ID</span>
                  <strong>{user?.emp_id}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Department</span>
                  <strong>{user?.department}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Designation</span>
                  <strong>{user?.designation}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Official Email</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>
            </div>

            <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} /> Notification & Approval Preferences
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Instant alert on incoming student equipment/slot requests</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Auto-approve verified 3D print jobs during low-utilization idle hours</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Send weekly equipment utilization report to Department Head</span>
                </label>
              </div>
            </div>

            {/* Session Security Card with Explicit Log Out Button */}
            <div className="card-amrita" style={{ padding: '1.25rem 1.5rem', maxWidth: '640px', borderLeft: '4px solid #ef4444' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={16} /> Session Security
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                Currently logged in as faculty <strong>{user?.name}</strong> ({user?.emp_id}). Log out when leaving faculty terminal.
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
      <nav className="mobile-bottom-nav" aria-label="Faculty Mobile Bottom Navigation">
        {facultyTabs.map(tab => {
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

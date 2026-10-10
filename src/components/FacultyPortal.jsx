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
  BookOpen
} from 'lucide-react';
import FacultyApprovalsView from './FacultyApprovalsView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import LabDirectoryView from './LabDirectoryView';
import SmartLabFinderBot from './SmartLabFinderBot';

export default function FacultyPortal({ user, simulatedContext, bookings = [], onApprove, onReject, onNewBooking }) {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'classrooms' | 'bot' | 'directory' | 'profile' | 'settings'

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const facultyTabs = [
    { id: 'approvals', label: `Student Lab Approvals (${pendingCount})`, icon: UserCheck, isHighlight: pendingCount > 0 },
    { id: 'classrooms', label: 'Classroom Booking (Faculty Exclusive)', icon: Calendar },
    { id: 'bot', label: 'AI Lab & Facility Matcher', icon: Bot },
    { id: 'directory', label: 'All Innovation Labs & Stock', icon: Building2 },
    { id: 'profile', label: 'Faculty Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div style={{ padding: '1.25rem 0 3.5rem' }}>
      
      {/* Faculty Profile Overview Card */}
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
            KS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {user?.name || 'Dr. K. Swaminathan'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Faculty & Lab In-Charge
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Employee ID: <strong>{user?.emp_id || 'AMR-FAC-209'}</strong> • {user?.department || 'Computer Science & Engineering'} • {user?.designation || 'Associate Professor & Lab In-Charge'}
            </div>
          </div>
        </div>

        {/* Quick Privilege Badges */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ padding: '0.35rem 0.65rem', backgroundColor: 'var(--status-available-bg)', color: 'var(--status-available-text)', border: '1px solid var(--status-available-border)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            ✔️ Classroom Booking Privileges Active
          </div>
          <div style={{ padding: '0.35rem 0.65rem', backgroundColor: 'var(--amrita-maroon-bg)', color: 'var(--amrita-maroon)', border: '1px solid var(--amrita-maroon-border)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            🔒 Lab In-Charge Sign-off Active
          </div>
        </div>
      </div>

      {/* Navigation Ribbons Grid */}
      <div className="amrita-tile-grid" style={{ marginBottom: '1.25rem' }}>
        {facultyTabs.map(tab => {
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
                <strong>Faculty Exclusive Feature:</strong> You have administrative clearance to reserve any unoccupied classroom across AB-1 and AB-3 for special reviews, hackathons, or makeup sessions.
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

        {/* 5. Faculty Profile */}
        {activeTab === 'profile' && (
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
        )}

        {/* 6. Settings */}
        {activeTab === 'settings' && (
          <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Faculty Notification & Approval Preferences
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
        )}

      </div>

    </div>
  );
}

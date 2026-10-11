import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  User, 
  Clock, 
  Sparkles, 
  Upload, 
  Package, 
  LogOut, 
  Check,
  Bell
} from 'lucide-react';
import VoiceChatBot from './VoiceChatBot';
import LabDirectoryView from './LabDirectoryView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import JobUpload from './JobUpload';
import InventorySearch from './InventorySearch';
import NotificationsView from './NotificationsView';
import YuktiLogo from './YuktiLogo';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';

export default function StudentPortal({ user, simulatedContext, bookings = [], onNewBooking, onLogout, forcedTab = null, onClearForcedTab = null }) {
  const [activeTab, setActiveTab] = useState('ai_bot'); // 'ai_bot' | 'job_upload' | 'inventory' | 'directory' | 'my_bookings' | 'classrooms' | 'notifications' | 'profile'
  const [checkingInId, setCheckingInId] = useState(null);
  const { unreadCount } = useNotifications();

  React.useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
      if (onClearForcedTab) onClearForcedTab();
    }
  }, [forcedTab, onClearForcedTab]);

  const fullName = user?.full_name || user?.name || 'Student Innovator';
  const rollNo = user?.roll_no || 'Amrita Student';
  const dept = user?.department || 'Computer Science & Engineering';

  const myBookings = user?.role === 'student'
    ? bookings
    : bookings.filter(b => b.user_id === user?.id || (user?.roll_no && b.studentRoll === user.roll_no) || b.studentName === fullName);

  const handleCheckIn = async (bookingId) => {
    try {
      setCheckingInId(bookingId);
      await api.checkInBooking(bookingId);
      alert('Check-in confirmed! Workstation / slot verified.');
      if (onNewBooking) onNewBooking();
    } catch (err) {
      alert(`Check-in failed: ${err.message}`);
    } finally {
      setCheckingInId(null);
    }
  };

  const navTabs = [
    { id: 'ai_bot', label: 'AI Voice Assistant', shortLabel: 'AI Assistant', icon: Sparkles },
    { id: 'job_upload', label: 'FabLab Work Orders', shortLabel: '3D/PCB Job', icon: Upload },
    { id: 'inventory', label: 'Drawer Component Stock', shortLabel: 'Components', icon: Package },
    { id: 'directory', label: 'Labs & Resources', shortLabel: 'Labs', icon: Building2 },
    { id: 'my_bookings', label: 'My Reservations', shortLabel: 'Reservations', icon: Clock, count: myBookings.length },
    { id: 'classrooms', label: 'Space Radar', shortLabel: 'Radar', icon: Calendar },
    { id: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User }
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
          <YuktiLogo size={46} style={{ borderRadius: '13px', boxShadow: '0 4px 12px rgba(164, 18, 63, 0.25)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {fullName}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Student Innovator
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Roll No: <strong>{rollNo}</strong> • {dept}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('job_upload')}
            className="btn-amrita"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Upload size={14} />
            <span>Upload 3D/PCB File</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--amrita-maroon)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--amrita-maroon)' : 'var(--border-light)'}`,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--amrita-maroon)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '10px'
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'ai_bot' && (
        <VoiceChatBot
          currentUser={user}
          onBookSlot={() => {
            setActiveTab('directory');
          }}
        />
      )}

      {activeTab === 'job_upload' && (
        <JobUpload
          onJobSubmitted={() => {
            setActiveTab('my_bookings');
            if (onNewBooking) onNewBooking();
          }}
        />
      )}

      {activeTab === 'inventory' && (
        <InventorySearch />
      )}

      {activeTab === 'directory' && (
        <LabDirectoryView
          onBookSlot={() => {
            setActiveTab('my_bookings');
            if (onNewBooking) onNewBooking();
          }}
        />
      )}

      {activeTab === 'my_bookings' && (
        <div className="card-amrita" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              My Facility & Machine Reservations
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live Supabase Realtime synchronization active
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No reservations recorded yet.</p>
              <p style={{ fontSize: '0.75rem' }}>Upload a 3D print file or use the AI Assistant to schedule machine time.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {myBookings.map((b) => (
                <div key={b.id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-maroon" style={{ fontSize: '0.65rem' }}>
                        {b.labName || 'Innovation Facility'}
                      </span>
                      <span className={`badge ${
                        b.status === 'approved' ? 'badge-available' :
                        b.status === 'rejected' ? 'badge-flagged' :
                        b.status === 'completed' ? 'badge-available' :
                        'badge-occupied'
                      }`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                        {b.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem' }}>
                      {b.projectTitle || b.purpose || 'Laboratory Research Slot'}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Window: <strong>{b.slotTime || `${new Date(b.start_ts).toLocaleTimeString()} - ${new Date(b.end_ts).toLocaleTimeString()}`}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {b.status === 'approved' && !b.checked_in_at && (
                      <button
                        onClick={() => handleCheckIn(b.id)}
                        disabled={checkingInId === b.id}
                        className="btn-amrita"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Check size={13} />
                        <span>{checkingInId === b.id ? 'Checking in...' : 'Check-In at Bench'}</span>
                      </button>
                    )}
                    {b.checked_in_at && (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Checked-In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'classrooms' && (
        <ClassroomOccupancyModule
          simulatedContext={simulatedContext}
          user={user}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsView />
      )}

      {activeTab === 'profile' && (
        <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '540px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Innovator Profile & Credentials
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Full Name:</span> <strong>{fullName}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Roll Number:</span> <strong>{rollNo}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{dept}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Batch:</span> <strong>{user?.batch || '2023-2027'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>System Role:</span> <strong className="text-amrita-maroon">Student Innovator</strong></div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ color: '#b91c1c', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={14} /> Sign Out of Amrita Yukti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

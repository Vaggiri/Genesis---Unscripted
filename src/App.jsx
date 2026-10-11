import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import StudentPortal from './components/StudentPortal';
import FacultyPortal from './components/FacultyPortal';
import LabInchargePortal from './components/LabInchargePortal';
import AdminPortal from './components/AdminPortal';
import NotificationsView from './components/NotificationsView';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import { useBookings } from './hooks/useBookings';
import { api } from './services/api';

export default function App() {
  const { user, profile, role, loading: authLoading, signOut } = useAuth();
  const { unreadCount, addNotification } = useNotifications();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Synthesized notification chime (zero audio dependencies)
  const playNotificationChime = (tone = 'high') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone === 'high' ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(tone === 'high' ? 1320 : 880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioContext may be restricted before first interaction
    }
  };

  // Real-time facility bookings hook with Supabase Realtime subscription
  const {
    bookings,
    createBooking,
    updateBookingStatus
  } = useBookings({
    enabled: Boolean(user),
    onRealtimeEvent: (payload) => {
      if (payload.eventType === 'INSERT') {
        playNotificationChime('high');
        addNotification({
          title: 'New Lab Booking Event',
          message: `Booking created: ${payload.new?.purpose || 'Equipment Reservation'} (${payload.new?.room_id || 'Room'})`,
          type: 'request',
          category: 'booking',
          target_roles: ['student', 'faculty', 'lab_incharge', 'admin']
        });
        setToastNotification({
          id: `toast-${Date.now()}`,
          type: 'new_request',
          title: '🔔 New Lab Booking Event',
          message: `Booking created: ${payload.new?.purpose || 'Equipment Reservation'}`
        });
      } else if (payload.eventType === 'UPDATE') {
        const isAppr = payload.new?.status === 'approved';
        playNotificationChime(isAppr ? 'high' : 'low');
        addNotification({
          title: isAppr ? 'Booking Approved' : payload.new?.status === 'rejected' ? 'Booking Declined' : 'Booking Status Changed',
          message: `Reservation for ${payload.new?.room_id || 'lab slot'} has been ${payload.new?.status || 'updated'}.`,
          type: isAppr ? 'approved' : payload.new?.status === 'rejected' ? 'rejected' : 'status',
          category: 'booking',
          target_roles: ['student', 'faculty', 'lab_incharge', 'admin']
        });
        setToastNotification({
          id: `toast-${Date.now()}`,
          type: payload.new?.status || 'updated',
          title: isAppr ? '✅ Booking Approved!' : '⚠️ Booking Status Changed',
          message: `Booking status updated to ${String(payload.new?.status || '').toUpperCase()}`
        });
      }
    }
  });

  const [simulatedContext] = useState({
    day: 'Monday',
    time: ''
  });

  const [settings, setSettings] = useState({
    campus_name: 'Amrita Vishwa Vidyapeetham',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active: true
  });

  const refreshGlobalData = async () => {
    try {
      const setRes = await api.getSettings();
      if (setRes) setSettings(setRes);
    } catch (err) {
      console.warn('Refresh error:', err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  // Auto-dismiss toast notification after 6 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  const handleNewBooking = async (newBooking) => {
    try {
      await createBooking(newBooking);
      setToastNotification({
        id: `toast-${Date.now()}`,
        type: 'approved',
        title: 'Booking Confirmed',
        message: 'Your slot request has been recorded.'
      });
    } catch (err) {
      setToastNotification({
        id: `toast-${Date.now()}`,
        type: 'error',
        title: 'Booking Conflict / Notice',
        message: err.message || 'Unable to record slot.'
      });
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'approved');
    } catch (err) {
      console.warn('Approve error:', err);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'rejected');
    } catch (err) {
      console.warn('Reject error:', err);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid var(--border-light)',
          borderTopColor: 'var(--amrita-maroon)',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }} />
        <h3 style={{ color: 'var(--amrita-maroon)', fontWeight: 800, margin: 0 }}>Amrita Yukti</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Verifying security session...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentUser = user ? {
    ...(profile || {}),
    id: user.id,
    email: user.email,
    role: role || profile?.role || 'student',
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    roll_no: profile?.roll_no || user.user_metadata?.roll_no || 'AMRITA-STUDENT',
    emp_id: profile?.emp_id || user.user_metadata?.emp_id || 'AMRITA-FACULTY',
    department: profile?.department || user.user_metadata?.department || 'Engineering'
  } : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Navbar with secure session indicator and role badge */}
      <Navbar
        currentUser={currentUser}
        onLogout={signOut}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>
          {!currentUser ? (
            <LoginPage />
          ) : (
            <>
              {currentUser.role === 'student' && (
                <StudentPortal 
                  user={currentUser} 
                  simulatedContext={simulatedContext}
                  bookings={bookings}
                  onNewBooking={handleNewBooking}
                  onLogout={signOut}
                />
              )}

              {currentUser.role === 'faculty' && (
                <FacultyPortal 
                  user={currentUser} 
                  simulatedContext={simulatedContext}
                  bookings={bookings}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onNewBooking={handleNewBooking}
                  onLogout={signOut}
                />
              )}

              {currentUser.role === 'lab_incharge' && (
                <LabInchargePortal
                  currentUser={currentUser}
                  onBookSlot={handleNewBooking}
                />
              )}

              {currentUser.role === 'admin' && (
                <AdminPortal
                  onRefreshNeeded={refreshGlobalData}
                  settings={settings}
                  onSaveSettings={(newSet) => setSettings(newSet)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        backgroundColor: '#ffffff',
        padding: '1.25rem 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--amrita-maroon)' }}>AMRITA</span>
            <span>•</span>
            <span>Centralized Innovation Facility Booking & Utilization Portal</span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GENESIS 2026 • Amrita Yukti
          </div>
        </div>
      </footer>

      {/* Live Realtime Notification Toast */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '420px',
          width: 'calc(100vw - 40px)',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(164, 18, 63, 0.12)',
          borderLeft: `5px solid ${toastNotification.type === 'approved' ? '#10b981' : toastNotification.type === 'error' ? '#ef4444' : '#A4123F'}`,
          borderTop: '1px solid #f1f5f9',
          borderRight: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9',
          padding: '1rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          animation: 'slideInRight 0.35s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>
                {toastNotification.type === 'approved' ? '🎉' : toastNotification.type === 'error' ? '⚠️' : '🔔'}
              </span>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '0.9rem', 
                color: toastNotification.type === 'approved' ? '#065f46' : toastNotification.type === 'error' ? '#991b1b' : 'var(--amrita-maroon)' 
              }}>
                {toastNotification.title}
              </span>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: '#94a3b8',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.45 }}>
            {toastNotification.message}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Realtime Sync: Active</span>
            <span style={{ color: 'var(--amrita-maroon)', fontWeight: 600 }}>Amrita Yukti</span>
          </div>
        </div>
      )}

      {/* Notifications Modal Center (triggered from Navbar bell) */}
      {showNotificationsModal && (
        <div 
          onClick={() => setShowNotificationsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Notifications & Alerts Center
              </h3>
              <button 
                onClick={() => setShowNotificationsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>
            <NotificationsView />
          </div>
        </div>
      )}
    </div>
  );
}

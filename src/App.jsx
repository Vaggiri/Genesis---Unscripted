import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import StudentPortal from './components/StudentPortal';
import FacultyPortal from './components/FacultyPortal';
import AdminPortal from './components/AdminPortal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import AiTunnelModal from './components/AiTunnelModal';
import { getStoredUser, setStoredUser } from './services/auth';
import { getStoredBookings, saveStoredBookings } from './services/labsData';
import { api } from './services/api';

export default function App() {
  // If stored user exists in sessionStorage/localStorage, initialize with it; default to null (shows Login Page)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Global Centralized Booking Requests State (persisted)
  const [bookings, setBookings] = useState(() => getStoredBookings());
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
      osc.frequency.setValueAtTime(tone === 'high' ? 880 : 587.33, ctx.currentTime); // A5 or D5
      osc.frequency.exponentialRampToValueAtTime(tone === 'high' ? 1320 : 880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // AudioContext may be restricted before first gesture
    }
  };

  // Cross-Tab Real-time BroadcastChannel & Backend Synchronization
  useEffect(() => {
    let channel = null;
    try {
      channel = new BroadcastChannel('amrita_innovatex_sync');
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'NEW_BOOKING_SUBMITTED') {
          setBookings(prev => {
            const exists = prev.some(b => b.id === data.booking.id);
            if (exists) return prev;
            return [data.booking, ...prev];
          });

          // If current user is faculty, show toast & play chime
          if (currentUser?.role === 'faculty') {
            playNotificationChime('high');
            setToastNotification({
              id: `toast-${Date.now()}`,
              type: 'new_request',
              title: '🔔 New Lab Slot Request Received!',
              message: `${data.booking.studentName} (${data.booking.studentRoll}) requested ${data.booking.labName} for ${data.booking.slotTime}.`,
              bookingId: data.booking.id
            });
          }
        } else if (data.type === 'BOOKING_STATUS_CHANGED') {
          setBookings(prev => prev.map(b => b.id === data.bookingId ? { ...b, status: data.status } : b));
          
          // If current user is student and matches, notify
          if (currentUser?.role === 'student') {
            playNotificationChime(data.status === 'approved' ? 'high' : 'low');
            setToastNotification({
              id: `toast-${Date.now()}`,
              type: data.status,
              title: data.status === 'approved' ? '✅ Lab Slot Request Approved!' : '⚠️ Lab Slot Request Updated',
              message: `Your booking request has been marked as ${data.status.toUpperCase()} by faculty in-charge.`,
              bookingId: data.bookingId
            });
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // Storage event listener fallback for older multi-tab browsers
    const handleStorageChange = (e) => {
      if (e.key === 'amrita_innovatex_bookings' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setBookings(fresh);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initial background fetch from backend server
    fetch('/api/innovation/bookings')
      .then(res => res.json())
      .then(data => {
        if (data?.bookings?.length) {
          setBookings(prev => {
            // merge without duplicates
            const map = new Map();
            [...prev, ...data.bookings].forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  // Auto-dismiss toast notification after 6 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  const handleNewBooking = (newBooking) => {
    setBookings(prev => {
      const updated = [newBooking, ...prev];
      saveStoredBookings(updated);
      return updated;
    });

    // Broadcast to other open tabs
    try {
      const ch = new BroadcastChannel('amrita_innovatex_sync');
      ch.postMessage({ type: 'NEW_BOOKING_SUBMITTED', booking: newBooking });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}

    // Sync to backend server
    fetch('/api/innovation/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch(() => {});
  };

  const handleApproveBooking = (bookingId) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b);
      saveStoredBookings(updated);
      return updated;
    });

    try {
      const ch = new BroadcastChannel('amrita_innovatex_sync');
      ch.postMessage({ type: 'BOOKING_STATUS_CHANGED', bookingId, status: 'approved' });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}

    fetch(`/api/innovation/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    }).catch(() => {});
  };

  const handleRejectBooking = (bookingId) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b);
      saveStoredBookings(updated);
      return updated;
    });

    try {
      const ch = new BroadcastChannel('amrita_innovatex_sync');
      ch.postMessage({ type: 'BOOKING_STATUS_CHANGED', bookingId, status: 'rejected' });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}

    fetch(`/api/innovation/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    }).catch(() => {});
  };

  const [simulatedContext, setSimulatedContext] = useState({
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

  const [pagesConfig, setPagesConfig] = useState([]);

  const refreshGlobalData = async () => {
    try {
      const [pagesRes, setRes] = await Promise.all([
        api.getPages(),
        api.getSettings()
      ]);
      if (setRes) setSettings(setRes);
      if (pagesRes) setPagesConfig(pagesRes);
    } catch (err) {
      console.warn('Refresh error:', err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setStoredUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Navbar with secure session indicator and no exposed admin link */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div className="container">
          {!currentUser ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              {currentUser.role === 'student' && (
                <StudentPortal 
                  user={currentUser} 
                  simulatedContext={simulatedContext}
                  bookings={bookings}
                  onNewBooking={handleNewBooking}
                  onLogout={handleLogout}
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
                  onLogout={handleLogout}
                />
              )}

              {currentUser.role === 'admin' && (
                <AdminPortal
                  onRefreshNeeded={refreshGlobalData}
                  settings={settings}
                  pagesConfig={pagesConfig}
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
            GENESIS 2026 • Amrita InnovateX
          </div>
        </div>
      </footer>

      {/* Live Cross-Tab Notification Toast */}
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
          borderLeft: `5px solid ${toastNotification.type === 'approved' ? '#10b981' : '#A4123F'}`,
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
                {toastNotification.type === 'approved' ? '🎉' : '🔔'}
              </span>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '0.9rem', 
                color: toastNotification.type === 'approved' ? '#065f46' : 'var(--amrita-maroon)' 
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
            <span>Live Sync: Active • Just now</span>
            <span style={{ color: 'var(--amrita-maroon)', fontWeight: 600 }}>Amrita InnovateX</span>
          </div>
        </div>
      )}

      {/* Supabase Cloud Database Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => refreshGlobalData()}
      />

      {/* OmniRoute & ngrok Cloud Bridge Modal */}
      <AiTunnelModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}

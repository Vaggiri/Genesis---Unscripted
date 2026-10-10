import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import StudentPortal from './components/StudentPortal';
import ParentPortal from './components/ParentPortal';
import FacultyPortal from './components/FacultyPortal';
import WardenPortal from './components/WardenPortal';
import WorkersManagerPortal from './components/WorkersManagerPortal';
import AdminPortal from './components/AdminPortal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import { getStoredUser, setStoredUser, DEMO_USERS } from './services/auth';
import { api } from './services/api';

export default function App() {
  // If stored user exists in localStorage, initialize with it; default to null (shows Login Page)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

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
                />
              )}

              {currentUser.role === 'parent' && (
                <ParentPortal 
                  user={currentUser} 
                />
              )}

              {currentUser.role === 'faculty' && (
                <FacultyPortal 
                  user={currentUser} 
                />
              )}

              {currentUser.role === 'warden' && (
                <WardenPortal 
                  user={currentUser} 
                />
              )}

              {currentUser.role === 'workers_manager' && (
                <WorkersManagerPortal 
                  user={currentUser} 
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
            GENESIS 2026 • Campus Setu
          </div>
        </div>
      </footer>

      {/* Supabase Cloud Database Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => refreshGlobalData()}
      />
    </div>
  );
}

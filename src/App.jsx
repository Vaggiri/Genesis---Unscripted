import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MainPortalHome from './components/MainPortalHome';
import ClassroomOccupancyModule from './components/ClassroomOccupancyModule';
import ParentEPassPreview from './components/ParentEPassPreview';
import FabLabPreview from './components/FabLabPreview';
import AdminPortal from './components/AdminPortal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import { api } from './services/api';
import { Building2, Compass, ShieldCheck, Cpu, Sliders } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'classrooms' | 'parent-epass' | 'fablab' | 'admin'
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  
  const [simulatedContext, setSimulatedContext] = useState({
    day: 'Monday',
    time: ''
  });

  const [settings, setSettings] = useState({
    campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active: true
  });

  const [pagesConfig, setPagesConfig] = useState([]);
  const [classroomsList, setClassroomsList] = useState([]);

  const [stats, setStats] = useState({
    totalRooms: 10,
    availableRooms: 6,
    flaggedRooms: 1,
    totalReports: 3
  });

  const refreshGlobalData = async () => {
    try {
      const [classRes, pagesRes, setRes, reportsRes] = await Promise.all([
        api.getClassrooms(simulatedContext.day, simulatedContext.time),
        api.getPages(),
        api.getSettings(),
        api.getReports()
      ]);

      if (setRes) setSettings(setRes);
      if (pagesRes) setPagesConfig(pagesRes);

      const rooms = classRes?.classrooms || [];
      setClassroomsList(rooms);

      const avail = rooms.filter(r => r.status === 'available').length;
      const flagged = rooms.filter(r => r.is_flagged || r.status === 'flagged_occupied').length;

      setStats({
        totalRooms: rooms.length,
        availableRooms: avail,
        flaggedRooms: flagged,
        totalReports: (reportsRes || []).length
      });
    } catch (err) {
      console.warn('Refresh global data error:', err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, [simulatedContext.day, simulatedContext.time]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Container */}
      <main style={{ flex: 1 }}>
        <div className="container">
          {activeTab === 'home' && (
            <MainPortalHome
              onNavigate={(tab) => setActiveTab(tab)}
              stats={stats}
              settings={settings}
              classrooms={classroomsList}
            />
          )}

          {activeTab === 'classrooms' && (
            <ClassroomOccupancyModule
              simulatedContext={simulatedContext}
            />
          )}

          {activeTab === 'parent-epass' && (
            <ParentEPassPreview
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'fablab' && (
            <FabLabPreview
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPortal
              onRefreshNeeded={refreshGlobalData}
              settings={settings}
              pagesConfig={pagesConfig}
              onSaveSettings={(newSet) => setSettings(newSet)}
            />
          )}
        </div>
      </main>

      {/* Amrita Institutional Footer */}
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
            <span>Vishwa Vidyapeetham</span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GENESIS 2026 • CampusSync
          </div>
        </div>
      </footer>

      {/* Mobile Smartphone Bottom Navigation Bar (1-Thumb Reachability) */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('home')}
          className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Building2 size={20} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('classrooms')}
          className={`mobile-nav-item ${activeTab === 'classrooms' ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('parent-epass')}
          className={`mobile-nav-item ${activeTab === 'parent-epass' ? 'active' : ''}`}
        >
          <ShieldCheck size={20} />
          <span>Gate Pass</span>
        </button>

        <button
          onClick={() => setActiveTab('fablab')}
          className={`mobile-nav-item ${activeTab === 'fablab' ? 'active' : ''}`}
        >
          <Cpu size={20} />
          <span>FabLab</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
        >
          <Sliders size={20} />
          <span>Admin</span>
        </button>
      </nav>

      {/* Supabase Cloud Database Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => refreshGlobalData()}
      />
    </div>
  );
}

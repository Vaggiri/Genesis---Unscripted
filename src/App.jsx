import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MainPortalHome from './components/MainPortalHome';
import ClassroomOccupancyModule from './components/ClassroomOccupancyModule';
import ParentEPassPreview from './components/ParentEPassPreview';
import FabLabPreview from './components/FabLabPreview';
import AdminPortal from './components/AdminPortal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import { api } from './services/api';
import { Building2, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'classrooms' | 'parent-epass' | 'fablab' | 'admin'
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  
  // Simulated day & time (e.g. 'Monday', '09:15', or empty string for real clock)
  const [simulatedContext, setSimulatedContext] = useState({
    day: 'Monday',
    time: ''
  });

  const [settings, setSettings] = useState({
    campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. If an unscheduled batch has occupied a room, submit a report to alert peers!',
    banner_active: true
  });

  const [pagesConfig, setPagesConfig] = useState([]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        simulatedContext={simulatedContext}
        setSimulatedContext={setSimulatedContext}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div className="container">
          {activeTab === 'home' && (
            <MainPortalHome
              onNavigate={(tab) => setActiveTab(tab)}
              stats={stats}
              settings={settings}
              pagesConfig={pagesConfig}
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

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.95)',
        padding: '2rem 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={16} color="#818cf8" />
            <span style={{ color: '#fff', fontWeight: 600 }}>CampusSync Ecosystem</span>
            <span>•</span>
            <span>Amrita Vishwa Vidyapeetham</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>GENESIS 2026 Hackathon (Problem Statement #9)</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={13} />
              <span>Supabase Cloud Integration</span>
            </button>
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

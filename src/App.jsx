import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Pillar1Pass from './components/Pillar1Pass';
import Pillar2FabLab from './components/Pillar2FabLab';
import Pillar3Classrooms from './components/Pillar3Classrooms';
import Review1Dossier from './components/Review1Dossier';
import DemoControls from './components/DemoControls';

export default function App() {
  const [activeTab, setActiveTab] = useState('dossier'); // Defaults to Review 1 Pitch Deck for initial judge review, or can switch to pillar1

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Presentation / Demo Canvas */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dossier' && (
          <Review1Dossier onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'pillar1' && (
          <Pillar1Pass />
        )}

        {activeTab === 'pillar2' && (
          <Pillar2FabLab />
        )}

        {activeTab === 'pillar3' && (
          <Pillar3Classrooms />
        )}
      </main>

      {/* Footer Info */}
      <footer style={{
        marginTop: 40,
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 16px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>GENESIS '26 Hackathon & Ideathon</span>
          <span>•</span>
          <span>Amrita Vishwa Vidyapeetham, Coimbatore</span>
          <span>•</span>
          <span style={{ color: '#38BDF8', fontWeight: 600 }}>Problem Statement #9 (Unified Campus Portal)</span>
        </div>
        <p>Review 1 Pure Demo Environment • Designed for Panel Evaluation</p>
      </footer>

      {/* Quick Judge Demo Hotbar */}
      <DemoControls activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

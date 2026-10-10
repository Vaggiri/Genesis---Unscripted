import React, { useState } from 'react';
import { 
  Building2, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { INNOVATION_LABS } from '../services/labsData';

export default function LabDirectoryView({ onBookLab }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabDetails, setSelectedLabDetails] = useState(null);

  const filteredLabs = INNOVATION_LABS.filter(lab => {
    const matchesCat = selectedCategory === 'all' || lab.category === selectedCategory;
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.specs.softwareInstalled?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          lab.benchComponents?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Search and Category Filter Bar */}
      <div className="card-amrita" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search labs by software (PyTorch, Vivado), IC (LM741), or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ minHeight: '38px', fontSize: '0.825rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Innovation Labs' },
            { id: 'software', label: 'AI & Software Labs' },
            { id: 'hardware_circuit', label: 'VLSI & Circuit Labs' },
            { id: 'rapid_prototyping', label: 'FabLab & 3D Prototyping' },
            { id: 'robotics_iot', label: 'Robotics & IoT' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedCategory === cat.id ? '2px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                backgroundColor: selectedCategory === cat.id ? 'var(--amrita-maroon-bg)' : '#ffffff',
                color: selectedCategory === cat.id ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredLabs.map(lab => (
          <div
            key={lab.id}
            className="card-amrita"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'var(--transition)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-maroon" style={{ fontSize: '0.675rem', textTransform: 'uppercase' }}>
                  {lab.category.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-available)' }}>
                  {lab.currentUtilization} Utilized
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {lab.name}
              </h4>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                📍 {lab.block} • {lab.floor} • Capacity: {lab.capacity} seats
              </p>

              {/* Hardware / Workstation Highlights */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', backgroundColor: 'var(--bg-surface-alt)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.65rem' }}>
                <strong style={{ color: 'var(--amrita-maroon)' }}>Hardware: </strong> 
                {lab.specs.workstations || lab.specs.equipment?.[0]}
              </div>

              {/* Software Versions tags */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Installed Software & Toolchains:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {lab.specs.softwareInstalled?.slice(0, 4).map((sw, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '0.685rem', padding: '0.15rem 0.45rem', backgroundColor: '#e2e8f0', borderRadius: '4px', fontWeight: 600 }}>
                      {sw}
                    </span>
                  ))}
                  {lab.specs.softwareInstalled?.length > 4 && (
                    <span style={{ fontSize: '0.685rem', padding: '0.15rem 0.35rem', color: 'var(--text-muted)' }}>
                      +{lab.specs.softwareInstalled.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* In-Stock Bench Components if applicable */}
              {lab.benchComponents?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                    In-Stock Hardware & Components:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {lab.benchComponents.slice(0, 3).map((comp, cIdx) => (
                      <span key={cIdx} style={{ fontSize: '0.685rem', padding: '0.15rem 0.45rem', backgroundColor: 'var(--status-available-bg)', color: 'var(--status-available-text)', border: '1px solid var(--status-available-border)', borderRadius: '4px', fontWeight: 600 }}>
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions & Next Open Slot */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Next Open Slot:</span>
                <strong style={{ fontSize: '0.785rem', color: 'var(--amrita-maroon)' }}>{lab.availableSlotsToday[0] || '10:00 AM Tomorrow'}</strong>
              </div>

              <button
                type="button"
                onClick={() => onBookLab(lab)}
                className="btn-amrita"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.785rem' }}
              >
                Book Facility
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

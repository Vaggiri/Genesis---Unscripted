import React from 'react';
import { ShieldCheck, QrCode, CheckCircle2, UserCheck, Smartphone, ArrowRight, Clock } from 'lucide-react';

export default function ParentEPassPreview({ onNavigate }) {
  return (
    <div style={{ padding: '2rem 0 4rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} />
          <span>Pillar 1: Campus E-Governance (Problem Statement #9)</span>
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Parent Hostel Visit & Gate E-Pass
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Replacing manual paper visitor slips, lost logbooks, and physical warden signature chases with verified dynamic QR clearance.
        </p>
      </div>

      {/* Visual Workflow Carousel / Step Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Smartphone size={20} color="#818cf8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Pre-Visit Induction</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Parents input student roll number, visitor head count, vehicle registration, and arrival window from home or en route.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <UserCheck size={20} color="#10b981" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. 1-Click Warden Clearance</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Hostel wardens receive verified push requests on their console, eliminating physical signature hunts across residential hostels.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <QrCode size={20} color="#38bdf8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Dynamic Fast-Lane Pass</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Anti-screenshot QR code with rotating timestamps verified in &lt;1s at Main Gate camera consoles with automatic digital logs.
          </p>
        </div>

      </div>

      {/* Interactive Mockup Demonstration */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.35)', background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.9) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>Interactive Token Preview</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Generated Visitor E-Pass Token #AMR-2026-981</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>Warden Clearance Verified</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          
          {/* Mock QR Pass */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#111827',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              AMRITA UNIVERSITY FAST-LANE GATE PASS
            </div>
            
            {/* Mock QR graphic */}
            <div style={{
              width: '160px',
              height: '160px',
              margin: '0 auto 0.75rem',
              background: '#0f172a',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <QrCode size={120} />
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              TN 38 BX 4419 • Car
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
              Visiting: Adithya K. (D-Block Hostel, Room 312)
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '6px', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
              Valid Today Until 18:00 IST
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>STUDENT & HOSTEL CLEARANCE</div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Adithya K. • Roll: CB.EN.U4CSE23012</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Hostel D, Room 312 • Approved by Warden Murugesh</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>GATE SECURITY VERIFICATION</div>
              <div style={{ fontWeight: 700, color: '#34d399' }}>Sub-Second Camera OCR Scan Ready</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Instant Entry Logged timestamp written to Supabase Cloud</div>
            </div>

            <button
              onClick={() => onNavigate('classrooms')}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              <span>Back to Active Classroom Occupancy Matrix</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

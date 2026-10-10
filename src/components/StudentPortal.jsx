import React, { useState } from 'react';
import { 
  Compass, 
  Cpu, 
  User, 
  ShieldCheck, 
  Building2, 
  FileEdit, 
  MessageSquare, 
  Download, 
  FileText, 
  AlertCircle, 
  GraduationCap, 
  Calendar, 
  Award, 
  Clock, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  X,
  ExternalLink
} from 'lucide-react';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import FabLabPreview from './FabLabPreview';

export default function StudentPortal({ user, simulatedContext }) {
  // Default to classroom availability as core innovation feature
  const [activeTab, setActiveTab] = useState('rooms');

  // Exact 18 tiles from the user's portal layout + 2 core PS#9 innovation modules (20 total = 5 complete rows of 4)
  const portalTiles = [
    // Row 1
    { id: 'profile', label: 'PROFILE', icon: GraduationCap, isRupee: false },
    { id: 'payments', label: 'PAYMENTS', icon: null, isRupee: true },
    { id: 'gatepass', label: 'GATE PASS', icon: Building2, isRupee: false },
    { id: 'services', label: 'SERVICES', icon: FileEdit, isRupee: false },

    // Row 2
    { id: 'complaints', label: 'COMPLAINTS', icon: MessageSquare, isRupee: false },
    { id: 'downloads', label: 'DOWNLOADS', icon: Download, isRupee: false },
    { id: 'documents', label: 'Documents', icon: FileText, isRupee: false },
    { id: 'incidents', label: 'INCIDENTS', icon: MessageSquare, isRupee: false },

    // Row 3
    { id: 'attendance', label: 'CLASS ATTENDANCE', icon: GraduationCap, isRupee: false },
    { id: 'leave', label: 'LEAVE LIST', icon: Building2, isRupee: false },
    { id: 'awards', label: 'AWARDS', icon: GraduationCap, isRupee: false },
    { id: 'timetable', label: 'TIMETABLE', icon: User, isRupee: false },

    // Row 4
    { id: 'supplimentary', label: 'SUPPLIMENTARY', icon: null, isRupee: true },
    { id: 'marks', label: 'MARKS', icon: User, isRupee: false },
    { id: 'refund', label: 'REFUND', icon: GraduationCap, isRupee: false },
    { id: 'course_feedback', label: 'COURSE-FEEDBACK', icon: GraduationCap, isRupee: false },

    // Row 5
    { id: 'tlp_feedback', label: 'TLP FEEDBACK', icon: GraduationCap, isRupee: false },
    { id: 'exit_survey', label: 'EXIT SURVEY', icon: GraduationCap, isRupee: false },
    { id: 'rooms', label: 'CLASSROOM AVAILABILITY', icon: Compass, isRupee: false, isCore: true },
    { id: 'fablab', label: 'FABLAB REQUEST', icon: Cpu, isRupee: false, isCore: true }
  ];

  const currentActiveTile = portalTiles.find(t => t.id === activeTab) || portalTiles[0];

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>
      
      {/* Student Profile Card Header */}
      <div className="card-amrita" style={{ 
        padding: '1rem 1.25rem', 
        marginBottom: '1.25rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '0.75rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.15rem'
          }}>
            AK
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Adithya K.'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Student Portal
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Roll: <strong>{user?.roll_no || 'CB.EN.U4CSE23012'}</strong> • {user?.batch || 'B.Tech CSE-B (2023-2027)'} • {user?.hostel || 'Hostel D, Rm 312'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Class Attendance:</span>{' '}
            <strong style={{ color: 'var(--status-available)' }}>{user?.attendance || '88.4%'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CGPA:</span>{' '}
            <strong style={{ color: 'var(--amrita-maroon)' }}>{user?.cgpa || '8.92'}</strong>
          </div>
        </div>
      </div>

      {/* Official Amrita 4-Column Angled Ribbon Grid (No horizontal scrolling!) */}
      <div className="amrita-tile-grid">
        {portalTiles.map((tile) => {
          const Icon = tile.icon;
          const isActive = activeTab === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => setActiveTab(tile.id)}
              className={`amrita-ribbon-tile ${isActive ? 'active' : ''}`}
              title={`Open ${tile.label}`}
              style={{
                outline: 'none',
                position: 'relative'
              }}
            >
              {/* Left Label in Amrita Maroon */}
              <span className="amrita-ribbon-tile-label">
                {tile.label}
              </span>

              {/* Right Slanted Maroon Ribbon with White Icon */}
              <div className="amrita-ribbon-tile-ribbon">
                {tile.isRupee ? (
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1 }}>₹</span>
                ) : Icon ? (
                  <Icon size={16} color="#ffffff" strokeWidth={2.2} />
                ) : (
                  <GraduationCap size={16} color="#ffffff" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module Header & Container */}
      <div style={{ marginTop: '0.5rem' }}>
        
        {/* Module Title Ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          border: '1px solid var(--border-light)',
          borderBottom: '2px solid var(--amrita-maroon)',
          marginBottom: '-1px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-maroon" style={{ fontSize: '0.7rem' }}>
              Active Module
            </span>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {currentActiveTile.label}
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Select any tile above to switch modules
          </span>
        </div>

        {/* Tab Content Display Area */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          border: '1px solid var(--border-light)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>

          {/* 1. Core Feature: Classroom & Lab Space Radar */}
          {activeTab === 'rooms' && (
            <ClassroomOccupancyModule simulatedContext={simulatedContext} />
          )}

          {/* 2. Core Feature: FabLab Prototyping Intake */}
          {activeTab === 'fablab' && (
            <FabLabPreview onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* 3. Student Profile */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Student Name</span>
                  <strong>{user?.name}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Roll Number</span>
                  <strong>{user?.roll_no}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Department</span>
                  <strong>{user?.department}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Current Semester</span>
                  <strong>{user?.semester}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Hostel Stay</span>
                  <strong>{user?.hostel}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Institutional Email</span>
                  <strong>{user?.email}</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Faculty Advisor</span>
                  <strong>Dr. K. Swaminathan (AMR-FAC-209)</strong>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Admission Year</span>
                  <strong>2023 (B.Tech Regular)</strong>
                </div>
              </div>
            </div>
          )}

          {/* 4. Payments */}
          {activeTab === 'payments' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--status-available-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--status-available-border)' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--status-available-text)' }}>Tuition & Lab Fee (Even Semester 2026)</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receipt #AMR-2026-091 • Paid via NetBanking</span>
                  </div>
                  <span className="badge badge-available">PAID ₹1,25,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>FabLab Prototyping Material Wallet</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active PLA Filament / Resin balance</span>
                  </div>
                  <strong style={{ color: 'var(--amrita-maroon)' }}>₹1,500 Available</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>Hostel & Mess Advance Deposit</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>D-Block Dining Facility</span>
                  </div>
                  <span className="badge badge-available">PAID ₹48,000</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Gate Pass */}
          {activeTab === 'gatepass' && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Automated QR Outing & Campus Gate E-Pass clearance.
              </p>
              <div style={{ backgroundColor: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--status-available-text)', fontSize: '0.95rem' }}>Active Day Outing Pass #GP-2026-881</span>
                  <span className="badge badge-available">APPROVED</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', lineHeight: 1.5 }}>
                  Valid: Today 14:00 - 18:30 IST • Verified by Warden Murugesh R. (D-Block)
                </div>
              </div>
              <button className="btn-amrita" style={{ fontSize: '0.85rem' }}>
                Request New Outing Pass
              </button>
            </div>
          )}

          {/* 6. Services */}
          {activeTab === 'services' && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Campus IT, Wi-Fi MAC Registration, and Hardware Lab Requests.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <strong>Amrita Wi-Fi MAC Registry</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0' }}>Registered Device: MacBook Pro (WiFi-6)</p>
                  <span className="badge badge-available">Active</span>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <strong>Innovation Lab Lockers</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0' }}>FabLab Locker #22 Assigned</p>
                  <span className="badge badge-available">Assigned</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Complaints & Incidents */}
          {(activeTab === 'complaints' || activeTab === 'incidents') && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {activeTab === 'complaints' ? 'Direct Grievances & Maintenance Desk to Warden/Manager.' : 'Campus Incident & Emergency Logging Desk.'}
              </p>
              <input type="text" placeholder="Title of complaint/incident..." className="form-input" style={{ marginBottom: '0.5rem' }} />
              <textarea rows={3} placeholder="Provide details, block, room or corridor..." className="form-textarea" style={{ marginBottom: '0.75rem' }} />
              <button className="btn-amrita" style={{ fontSize: '0.85rem' }}>Submit Formal Ticket</button>
            </div>
          )}

          {/* 8. Downloads & Documents */}
          {(activeTab === 'downloads' || activeTab === 'documents') && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span>Bonafide Certificate (Spring 2026)</span>
                  <a href="#pdf" style={{ color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.8rem' }}>Download PDF</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span>End Semester Grade Sheet Transcript (Fall 2025)</span>
                  <a href="#pdf" style={{ color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.8rem' }}>Download PDF</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span>B.Tech CSE Curriculum & Syllabus 2023-2027</span>
                  <a href="#pdf" style={{ color: 'var(--amrita-maroon)', fontWeight: 700, fontSize: '0.8rem' }}>Download PDF</a>
                </div>
              </div>
            </div>
          )}

          {/* 9. Class Attendance */}
          {activeTab === 'attendance' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem' }}>Course Code</th>
                    <th style={{ padding: '0.6rem' }}>Course Name</th>
                    <th style={{ padding: '0.6rem' }}>Total Hours</th>
                    <th style={{ padding: '0.6rem' }}>Attended</th>
                    <th style={{ padding: '0.6rem' }}>% Attendance</th>
                    <th style={{ padding: '0.6rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: '21CSE201', name: 'Data Structures & Algorithms', total: 42, attended: 39, pct: '92.8%' },
                    { code: '21CSE205', name: 'Computer Architecture', total: 38, attended: 33, pct: '86.8%' },
                    { code: '21MAT204', name: 'Discrete Mathematics', total: 40, attended: 35, pct: '87.5%' },
                    { code: '21CSE318', name: 'Cloud Computing Lab', total: 30, attended: 28, pct: '93.3%' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{row.code}</td>
                      <td style={{ padding: '0.6rem' }}>{row.name}</td>
                      <td style={{ padding: '0.6rem' }}>{row.total}</td>
                      <td style={{ padding: '0.6rem' }}>{row.attended}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--status-available)' }}>{row.pct}</td>
                      <td style={{ padding: '0.6rem' }}><span className="badge badge-available">Satisfactory</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 10. Leave List */}
          {activeTab === 'leave' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>Diwali Vacation Leave</strong>
                  <span className="badge badge-available">Approved</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>28 Oct 2026 - 02 Nov 2026 (5 Days) • Destination: Chennai</span>
              </div>
              <button className="btn-amrita" style={{ fontSize: '0.85rem' }}>Apply New Leave</button>
            </div>
          )}

          {/* 11. Awards */}
          {activeTab === 'awards' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amrita-maroon)', fontWeight: 800 }}>
                  <Award size={18} />
                  <span>Amrita Chancellor Merit Scholarship 2025</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Awarded for maintaining CGPA &gt; 8.8 in the Academic Year 2024-2025.
                </p>
              </div>
            </div>
          )}

          {/* 12. Timetable */}
          {activeTab === 'timetable' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {[
                  { slot: '08:45 - 09:35', sub: 'Data Structures & Algorithms', room: 'AB1-101' },
                  { slot: '09:40 - 10:30', sub: 'Discrete Mathematics', room: 'AB1-101' },
                  { slot: '10:45 - 11:35', sub: 'Computer Architecture', room: 'AB1-101' },
                  { slot: '13:30 - 16:15', sub: 'Cloud Computing Lab (Lab 2)', room: 'AB1-204' }
                ].map((s, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--amrita-maroon)', fontWeight: 700 }}>{s.slot}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '2px 0' }}>{s.sub}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room: {s.room}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. Marks */}
          {activeTab === 'marks' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Course</th>
                    <th style={{ padding: '0.6rem' }}>Periodical 1</th>
                    <th style={{ padding: '0.6rem' }}>Periodical 2</th>
                    <th style={{ padding: '0.6rem' }}>Continuous Assessment</th>
                    <th style={{ padding: '0.6rem' }}>End Semester Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sub: 'Data Structures & Algorithms', p1: '48/50', p2: '46/50', ca: '96/100', grade: 'A+' },
                    { sub: 'Computer Architecture', p1: '42/50', p2: '44/50', ca: '88/100', grade: 'A' },
                    { sub: 'Discrete Mathematics', p1: '45/50', p2: '47/50', ca: '92/100', grade: 'A+' }
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{r.sub}</td>
                      <td style={{ padding: '0.6rem' }}>{r.p1}</td>
                      <td style={{ padding: '0.6rem' }}>{r.p2}</td>
                      <td style={{ padding: '0.6rem' }}>{r.ca}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>{r.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 14. Supplementary & Refund */}
          {(activeTab === 'supplimentary' || activeTab === 'refund') && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeTab === 'supplimentary' ? 'No active arrears or supplementary registrations pending.' : 'Caution Deposit Refund eligible at completion of graduation in 2027.'}
              </p>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem', backgroundColor: 'var(--status-available-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--status-available-text)', fontSize: '0.8rem', fontWeight: 600 }}>
                Status: All academic clearances up to date.
              </div>
            </div>
          )}

          {/* 15. Surveys & Feedback */}
          {['course_feedback', 'tlp_feedback', 'exit_survey'].includes(activeTab) && (
            <div style={{ maxWidth: '640px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Course & TLP Academic Quality Feedback window is open for Even Semester 2026.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
                  <span>21CSE201 Data Structures — Dr. K. Swaminathan</span>
                  <span className="badge badge-available">Submitted</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
                  <span>21CSE205 Computer Architecture — Dr. Priya M.</span>
                  <span className="badge badge-maroon">Pending Feedback</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

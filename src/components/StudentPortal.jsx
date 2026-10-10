import React, { useState } from 'react';
import { 
  Compass, 
  Cpu, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Wrench, 
  AlertCircle, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Clock, 
  BookOpen, 
  RotateCcw, 
  MessageSquare, 
  Star, 
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import FabLabPreview from './FabLabPreview';

export default function StudentPortal({ user, simulatedContext }) {
  const [activeTab, setActiveTab] = useState('rooms');

  const tabs = [
    // Core Facility & Innovation
    { id: 'rooms', label: 'Classroom Availability', icon: Compass, category: 'Facility Booking' },
    { id: 'fablab', label: 'FabLab Request', icon: Cpu, category: 'Facility Booking' },
    
    // Academic & Progress
    { id: 'profile', label: 'Profile', icon: User, category: 'Academics' },
    { id: 'attendance', label: 'Class Attendance', icon: CheckCircle2, category: 'Academics' },
    { id: 'timetable', label: 'My Timetable', icon: Clock, category: 'Academics' },
    { id: 'marks', label: 'Marks & Grades', icon: BookOpen, category: 'Academics' },
    { id: 'supplimentary', label: 'Supplementary', icon: BookOpen, category: 'Academics' },

    // Campus Pass & Services
    { id: 'gatepass', label: 'Gate Pass', icon: ShieldCheck, category: 'Campus Governance' },
    { id: 'leave', label: 'Leave List', icon: Calendar, category: 'Campus Governance' },
    { id: 'services', label: 'Services', icon: Wrench, category: 'Campus Governance' },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle, category: 'Campus Governance' },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, category: 'Campus Governance' },
    { id: 'awards', label: 'Awards', icon: Award, category: 'Campus Governance' },

    // Finance & Documents
    { id: 'payments', label: 'Payments', icon: CreditCard, category: 'Finance' },
    { id: 'refund', label: 'Refund', icon: RotateCcw, category: 'Finance' },
    { id: 'downloads', label: 'Downloads', icon: Download, category: 'Documents' },
    { id: 'documents', label: 'Documents', icon: FileText, category: 'Documents' },

    // Surveys & Feedback
    { id: 'course_feedback', label: 'Course Feedback', icon: MessageSquare, category: 'Surveys' },
    { id: 'tlp_feedback', label: 'TLP Feedback', icon: Star, category: 'Surveys' },
    { id: 'exit_survey', label: 'Exit Survey', icon: ClipboardCheck, category: 'Surveys' }
  ];

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Student Profile Card Header */}
      <div className="card-amrita" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            AK
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Adithya K.'}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Student
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Roll: <strong>{user?.roll_no || 'CB.EN.U4CSE23012'}</strong> • {user?.batch || 'B.Tech CSE-B'} • {user?.hostel || 'Hostel D, Rm 312'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Attendance:</span>{' '}
            <strong style={{ color: 'var(--status-available)' }}>{user?.attendance || '88.4%'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CGPA:</span>{' '}
            <strong style={{ color: 'var(--amrita-maroon)' }}>{user?.cgpa || '8.92'}</strong>
          </div>
        </div>
      </div>

      {/* Tab Navigation Pill Bar (Scrollable on mobile) */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.85rem',
                minHeight: '38px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                backgroundColor: isActive ? 'var(--amrita-maroon)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.775rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
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
          <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--amrita-maroon)' }}>
              Student Official Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Roll Number:</strong> {user?.roll_no}</div>
              <div><strong>Department:</strong> {user?.department}</div>
              <div><strong>Semester:</strong> {user?.semester}</div>
              <div><strong>Hostel Stay:</strong> {user?.hostel}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Advisor:</strong> Dr. K. Swaminathan</div>
              <div><strong>Admission Year:</strong> 2023</div>
            </div>
          </div>
        )}

        {/* 4. Class Attendance */}
        {activeTab === 'attendance' && (
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Course-Wise Attendance Summary (Odd Semester 2026)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem' }}>Code</th>
                    <th style={{ padding: '0.5rem' }}>Course Name</th>
                    <th style={{ padding: '0.5rem' }}>Total Hours</th>
                    <th style={{ padding: '0.5rem' }}>Attended</th>
                    <th style={{ padding: '0.5rem' }}>% Attendance</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
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
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>{row.code}</td>
                      <td style={{ padding: '0.5rem' }}>{row.name}</td>
                      <td style={{ padding: '0.5rem' }}>{row.total}</td>
                      <td style={{ padding: '0.5rem' }}>{row.attended}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--status-available)' }}>{row.pct}</td>
                      <td style={{ padding: '0.5rem' }}><span className="badge badge-available">Satisfactory</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Timetable */}
        {activeTab === 'timetable' && (
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Weekly Academic Schedule
            </h3>
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

        {/* 6. Marks & Grades */}
        {activeTab === 'marks' && (
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Semester Grade Card & Evaluation
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Course</th>
                    <th style={{ padding: '0.5rem' }}>Periodical 1</th>
                    <th style={{ padding: '0.5rem' }}>Periodical 2</th>
                    <th style={{ padding: '0.5rem' }}>Continuous Assessment</th>
                    <th style={{ padding: '0.5rem' }}>End Semester Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sub: 'Data Structures & Algorithms', p1: '48/50', p2: '46/50', ca: '96/100', grade: 'A+' },
                    { sub: 'Computer Architecture', p1: '42/50', p2: '44/50', ca: '88/100', grade: 'A' },
                    { sub: 'Discrete Mathematics', p1: '45/50', p2: '47/50', ca: '92/100', grade: 'A+' }
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.sub}</td>
                      <td style={{ padding: '0.5rem' }}>{r.p1}</td>
                      <td style={{ padding: '0.5rem' }}>{r.p2}</td>
                      <td style={{ padding: '0.5rem' }}>{r.ca}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>{r.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Gate Pass */}
        {activeTab === 'gatepass' && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--amrita-maroon)' }}>
              Student Hostel & Campus Gate Pass
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Day outing and parent visit clearance token.
            </p>
            <div style={{ backgroundColor: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--status-available-text)' }}>Active Day Outing Pass #GP-2026-881</span>
                <span className="badge badge-available">Approved</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-available-text)' }}>
                Valid: Today 14:00 - 18:30 IST • Approved by Warden Murugesh (D-Block)
              </div>
            </div>
            <button className="btn-amrita" style={{ fontSize: '0.85rem' }}>
              Request New Outing Pass
            </button>
          </div>
        )}

        {/* 8. Payments & Refund */}
        {(activeTab === 'payments' || activeTab === 'refund') && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              {activeTab === 'payments' ? 'Tuition, Lab & Hostel Payments' : 'Refund Management'}
            </h3>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>• Spring 2026 Tuition Fee: <strong>Paid (Receipt #AMR-2026-091)</strong></div>
              <div>• FabLab Materials Deposit: <strong>₹1,500 Available Balance</strong></div>
              <div>• Caution Deposit Refund Status: <strong>Eligible at program completion</strong></div>
            </div>
          </div>
        )}

        {/* 9. Complaints & Incidents */}
        {(activeTab === 'complaints' || activeTab === 'incidents') && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--amrita-maroon)' }}>
              {activeTab === 'complaints' ? 'Grievances & Complaints Redressal' : 'Campus Incident Reporting'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Submit maintenance or academic concerns directly to campus authorities.
            </p>
            <input type="text" placeholder="Title of complaint/incident..." className="form-input" style={{ marginBottom: '0.5rem' }} />
            <textarea rows={3} placeholder="Describe the issue in detail..." className="form-textarea" style={{ marginBottom: '0.75rem' }} />
            <button className="btn-amrita" style={{ fontSize: '0.85rem' }}>Submit Ticket</button>
          </div>
        )}

        {/* 10. Downloads & Documents */}
        {(activeTab === 'downloads' || activeTab === 'documents') && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Academic Certificates & Downloads
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <span>Bonafide Certificate (Spring 2026)</span>
                <a href="#download" style={{ color: 'var(--amrita-maroon)', fontWeight: 700 }}>Download PDF</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <span>Curriculum & Course Syllabus Booklet</span>
                <a href="#download" style={{ color: 'var(--amrita-maroon)', fontWeight: 700 }}>Download PDF</a>
              </div>
            </div>
          </div>
        )}

        {/* 11. Other Features: Leave, Awards, Supplementary, Surveys */}
        {['leave', 'awards', 'supplimentary', 'services', 'course_feedback', 'tlp_feedback', 'exit_survey'].includes(activeTab) && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--amrita-maroon)', textTransform: 'capitalize' }}>
              {activeTab.replace('_', ' ')}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Portal feature active for {user?.name}. Records and responses are recorded in the central database.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

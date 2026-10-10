import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  Bell, 
  Award, 
  Edit3, 
  Download, 
  DollarSign, 
  UserCheck, 
  Save, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function FacultyPortal({ user }) {
  const [activeTab, setActiveTab] = useState('attendance_entry');

  // Attendance Entry Mock State
  const [attendanceList, setAttendanceList] = useState([
    { roll: 'CB.EN.U4CSE23012', name: 'Adithya K.', present: true },
    { roll: 'CB.EN.U4CSE23013', name: 'Ananya S.', present: true },
    { roll: 'CB.EN.U4CSE23014', name: 'Bharat V.', present: false },
    { roll: 'CB.EN.U4CSE23015', name: 'Deepika R.', present: true },
    { roll: 'CB.EN.U4CSE23016', name: 'Gowtham M.', present: true }
  ]);

  const toggleAttendance = (roll) => {
    setAttendanceList(attendanceList.map(s => 
      s.roll === roll ? { ...s, present: !s.present } : s
    ));
  };

  const tabs = [
    { id: 'attendance_entry', label: 'Attendance Entry', icon: CheckCircle2 },
    { id: 'course_allocation', label: 'Course Allocation', icon: BookOpen },
    { id: 'timetable', label: 'Teaching Timetable', icon: Clock },
    { id: 'syllabus_resources', label: 'Syllabus & Uploads', icon: Upload },
    { id: 'assignments_questions', label: 'Assignments & Question Pools', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'marks_entry', label: 'Marks Entry & Grades', icon: Edit3 },
    { id: 'exams_gradebook', label: 'Exams & Gradebook', icon: Award },
    { id: 'feedback_reports', label: 'Feedback Reports', icon: FileSpreadsheet },
    { id: 'salary', label: 'Salary Status & Slips', icon: DollarSign }
  ];

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Faculty Header Card */}
      <div className="card-amrita" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            KS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Dr. K. Swaminathan'}
              </h2>
              <span className="badge badge-maroon">Faculty Portal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Emp ID: <strong>{user?.emp_id || 'AMR-FAC-209'}</strong> • {user?.department || 'Computer Science & Engineering'} • {user?.designation || 'Associate Professor'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Active Semester: <strong>Even Semester 2026</strong>
        </div>
      </div>

      {/* Amrita Ribbon Tile Grid (No horizontal scrolling) */}
      <div className="amrita-tile-grid" style={{ marginBottom: '1.25rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`amrita-ribbon-tile ${isActive ? 'active' : ''}`}
              title={`Open ${tab.label}`}
              style={{ outline: 'none' }}
            >
              <span className="amrita-ribbon-tile-label">
                {tab.label}
              </span>
              <div className="amrita-ribbon-tile-ribbon">
                <Icon size={16} color="#ffffff" strokeWidth={2.2} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        
        {/* 1. Attendance Entry */}
        {activeTab === 'attendance_entry' && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
                  Daily Attendance Entry
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Course: <strong>21CSE201 - Data Structures (CSE-A Sem 4)</strong> • Slot: 08:45 AM
                </p>
              </div>

              <button 
                onClick={() => alert('Attendance submitted to AUMS database!')}
                className="btn-amrita" 
                style={{ minHeight: '36px', fontSize: '0.8rem' }}
              >
                <Save size={14} />
                <span>Publish Attendance</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem' }}>Roll Number</th>
                    <th style={{ padding: '0.5rem' }}>Student Name</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Mark Present / Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map(s => (
                    <tr key={s.roll} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{s.roll}</td>
                      <td style={{ padding: '0.5rem' }}>{s.name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleAttendance(s.roll)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${s.present ? 'var(--status-available-border)' : 'var(--status-occupied-border)'}`,
                            backgroundColor: s.present ? 'var(--status-available-bg)' : 'var(--status-occupied-bg)',
                            color: s.present ? 'var(--status-available-text)' : 'var(--status-occupied-text)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {s.present ? '✔ Present' : '✖ Absent'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Course Allocation */}
        {activeTab === 'course_allocation' && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '680px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Allocated Courses & Teaching Load
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { code: '21CSE201', name: 'Data Structures & Algorithms', batch: 'B.Tech CSE-A (Sem 4)', credits: 4, type: 'Theory' },
                { code: '21CSE318', name: 'Cloud Computing Lab', batch: 'B.Tech CSE-B (Sem 6)', credits: 2, type: 'Practical Lab' }
              ].map((c, i) => (
                <div key={i} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{c.code} - {c.name}</span>
                    <span className="badge badge-maroon">{c.type}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Batch: {c.batch} • Credits: {c.credits}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Timetable */}
        {activeTab === 'timetable' && (
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Faculty Teaching Timetable
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amrita-maroon)' }}>Monday 08:45 - 09:35</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Data Structures (CSE-A)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room: AB1-101</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amrita-maroon)' }}>Monday 13:30 - 16:15</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Cloud Computing Lab</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room: AB1-204 (Lab 2)</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Marks Entry & Evaluation */}
        {activeTab === 'marks_entry' && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '720px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Marks Entry & Grade Assignment
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Select component: Periodical 1 (Max 50 Marks)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { roll: 'CB.EN.U4CSE23012', name: 'Adithya K.', marks: 48 },
                { roll: 'CB.EN.U4CSE23013', name: 'Ananya S.', marks: 46 }
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.825rem' }}><strong>{s.roll}</strong> - {s.name}</span>
                  <input type="number" defaultValue={s.marks} style={{ width: '70px', padding: '0.35rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Salary Status & Downloads */}
        {activeTab === 'salary' && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Faculty Salary Status & Pay Slips
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: 'var(--status-available-bg)', borderRadius: 'var(--radius-sm)' }}>
                <span>September 2026 Salary: <strong>Credited (Bank Ref #HDFC-99120)</strong></span>
                <a href="#slip" style={{ color: 'var(--amrita-maroon)', fontWeight: 700 }}>Download Slip</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <span>August 2026 Salary: <strong>Credited</strong></span>
                <a href="#slip" style={{ color: 'var(--amrita-maroon)', fontWeight: 700 }}>Download Slip</a>
              </div>
            </div>
          </div>
        )}

        {/* Other Faculty Tabs */}
        {['syllabus_resources', 'assignments_questions', 'announcements', 'exams_gradebook', 'feedback_reports'].includes(activeTab) && (
          <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)', textTransform: 'capitalize', marginBottom: '0.5rem' }}>
              {activeTab.replace('_', ' ')}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Faculty management tool connected to Amrita institutional records.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

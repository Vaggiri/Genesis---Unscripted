import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Car, 
  Users, 
  BookOpen, 
  Send,
  User,
  Phone
} from 'lucide-react';

export default function ParentPortal({ user }) {
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'academics' | 'attendance'
  
  // Pass Request Form
  const [vehicleNo, setVehicleNo] = useState('TN 38 BX 4419');
  const [visitorCount, setVisitorCount] = useState(2);
  const [visitDate, setVisitDate] = useState('2026-10-11');
  const [arrivalTime, setArrivalTime] = useState('14:00');
  const [departureTime, setDepartureTime] = useState('18:00');
  const [purpose, setPurpose] = useState('Hostel Visit & Deliver Project Hardware');
  
  const [passGenerated, setPassGenerated] = useState(true); // pre-seeded active pass

  const handleRequestPass = (e) => {
    e.preventDefault();
    setPassGenerated(true);
    alert('✅ E-Pass request submitted! Warden Murugesh has been notified for digital 1-click clearance.');
  };

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Header Banner */}
      <div className="card-amrita" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--amrita-maroon-bg)',
            color: 'var(--amrita-maroon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Lakshmi Narayanan'}
              </h2>
              <span className="badge badge-maroon">Parent Portal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Ward: <strong>{user?.ward_name || 'Adithya K.'}</strong> ({user?.ward_roll || 'CB.EN.U4CSE23012'}) • {user?.ward_hostel || 'Hostel D, Rm 312'}
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('pass')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'pass' ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
              backgroundColor: activeTab === 'pass' ? 'var(--amrita-maroon)' : '#ffffff',
              color: activeTab === 'pass' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Gate E-Pass
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'academics' ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
              backgroundColor: activeTab === 'academics' ? 'var(--amrita-maroon)' : '#ffffff',
              color: activeTab === 'academics' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Ward Academic Tracking
          </button>
        </div>
      </div>

      {/* TAB 1: PARENT GATE PASS & HOSTEL CLEARANCE */}
      {activeTab === 'pass' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          
          {/* Request Form */}
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Request Hostel Visit & Gate Clearance
            </h3>
            
            <form onSubmit={handleRequestPass} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Vehicle Registration No.</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. TN 38 BX 4419"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Visitor Headcount</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(Number(e.target.value))}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Arrival Time</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Expected Departure</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Hostel Visit / Delivery"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-amrita" style={{ marginTop: '0.5rem' }}>
                <Send size={15} />
                <span>Submit Clearance Request</span>
              </button>
            </form>
          </div>

          {/* Active Pass Preview Card */}
          {passGenerated && (
            <div className="card-amrita" style={{ padding: '1.25rem', border: '2px solid var(--status-available-border)', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-available">Warden Approved</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token #AMR-PASS-904</span>
              </div>

              {/* Dynamic QR Display */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  margin: '0 auto 0.5rem',
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <QrCode size={110} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {vehicleNo} • {visitorCount} Visitors
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--status-available-text)', fontWeight: 700 }}>
                  Valid: {visitDate} ({arrivalTime} - {departureTime})
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div>• <strong>Student:</strong> {user?.ward_name} ({user?.ward_roll})</div>
                <div>• <strong>Destination:</strong> {user?.ward_hostel}</div>
                <div>• <strong>Approved by:</strong> Warden Murugesh R. (Hostel D)</div>
                <div>• <strong>Gate Scanner:</strong> Present this QR to the Main Gate camera console for sub-second drive-through entry.</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: WARD ACADEMICS & ATTENDANCE TRACKING */}
      {activeTab === 'academics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div className="card-amrita" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OVERALL ATTENDANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-available)' }}>88.4%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Eligible for all examinations</div>
            </div>

            <div className="card-amrita" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CUMULATIVE CGPA</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>8.92 / 10.0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Class Rank: Top 5%</div>
            </div>

            <div className="card-amrita" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>HOSTEL LOCATION</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Hostel D • Rm 312</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Warden: Murugesh (+91 94432 87654)</div>
            </div>
          </div>

          {/* Detailed Course Breakdown */}
          <div className="card-amrita" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.75rem' }}>
              Ward's Course-Wise Academic Progress
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem' }}>Course Name</th>
                    <th style={{ padding: '0.5rem' }}>Attendance</th>
                    <th style={{ padding: '0.5rem' }}>Periodical 1</th>
                    <th style={{ padding: '0.5rem' }}>Periodical 2</th>
                    <th style={{ padding: '0.5rem' }}>Project Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Data Structures & Algorithms', att: '92.8%', p1: '48/50', p2: '46/50', proj: '95/100' },
                    { name: 'Computer Architecture', att: '86.8%', p1: '42/50', p2: '44/50', proj: '90/100' },
                    { name: 'Discrete Mathematics', att: '87.5%', p1: '45/50', p2: '47/50', proj: '94/100' },
                    { name: 'Cloud Computing Lab', att: '93.3%', p1: '49/50', p2: '48/50', proj: '98/100' }
                  ].map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>{c.name}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--status-available)', fontWeight: 700 }}>{c.att}</td>
                      <td style={{ padding: '0.5rem' }}>{c.p1}</td>
                      <td style={{ padding: '0.5rem' }}>{c.p2}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--amrita-maroon)' }}>{c.proj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

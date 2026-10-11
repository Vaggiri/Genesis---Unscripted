import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  Building,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function FacultyApprovalsView({ 
  bookings: externalBookings, 
  onApprove: externalOnApprove, 
  onReject: externalOnReject, 
  facultyUser,
  currentUser 
}) {
  const [internalBookings, setInternalBookings] = useState([]);

  useEffect(() => {
    if (!externalBookings) {
      api.getInnovationBookings()
        .then(res => setInternalBookings(res?.bookings || []))
        .catch(err => console.warn('Approvals fetch error:', err));
    }
  }, [externalBookings]);

  const bookingsList = externalBookings || internalBookings;

  const handleApprove = async (id) => {
    if (externalOnApprove) {
      externalOnApprove(id);
    } else {
      await api.updateBookingStatus(id, 'approved');
      setInternalBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    }
  };

  const handleReject = async (id) => {
    if (externalOnReject) {
      externalOnReject(id);
    } else {
      await api.updateBookingStatus(id, 'rejected');
      setInternalBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
    }
  };

  const pendingList = bookingsList.filter(b => b.status === 'pending');
  const pastList = bookingsList.filter(b => b.status !== 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Overview Banner */}
      <div className="card-amrita" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span className="badge badge-maroon" style={{ marginBottom: '0.25rem' }}>
            Faculty & Lab In-Charge Desk
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Student Lab & Facility Booking Approvals
          </h3>
          <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Review incoming student project requests, hardware component allotments, and software slot bookings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem' }}>
          <div style={{ padding: '0.5rem 0.85rem', backgroundColor: 'var(--status-flagged-bg)', color: 'var(--status-flagged-text)', border: '1px solid var(--status-flagged-border)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            ⏳ {pendingList.length} Pending Approval
          </div>
          <div style={{ padding: '0.5rem 0.85rem', backgroundColor: 'var(--status-available-bg)', color: 'var(--status-available-text)', border: '1px solid var(--status-available-border)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            ✔️ {pastList.filter(b => b.status === 'approved').length} Active Approved
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="var(--amrita-maroon)" />
          <span>Pending Student Requests ({pendingList.length})</span>
        </h4>

        {pendingList.length === 0 ? (
          <div className="card-amrita" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={32} color="var(--status-available)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>All student booking requests have been reviewed!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingList.map(req => (
              <div
                key={req.id}
                className="card-amrita"
                style={{
                  padding: '1.25rem',
                  borderLeft: '4px solid var(--status-flagged)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                      {req.projectType}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {req.projectTitle}
                    </strong>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem' }}>
                    Facility: <strong style={{ color: 'var(--amrita-maroon)' }}>{req.labName}</strong> • Slot: <strong>{req.slotTime}</strong>
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-alt)', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                    <strong>Student:</strong> {req.studentName} ({req.studentRoll}) • <strong>Resources:</strong> {req.requirements}
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--status-available)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={15} />
                    <span>Approve Slot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      color: 'var(--status-occupied-text)',
                      border: '1px solid var(--status-occupied-border)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={15} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Logs */}
      <div style={{ marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Recent Decisions Log
        </h4>
        <div className="card-amrita" style={{ padding: '0.75rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.785rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.5rem' }}>Student</th>
                <th style={{ padding: '0.5rem' }}>Project / Facility</th>
                <th style={{ padding: '0.5rem' }}>Slot Time</th>
                <th style={{ padding: '0.5rem' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {pastList.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.5rem' }}><strong>{item.studentName}</strong> ({item.studentRoll})</td>
                  <td style={{ padding: '0.5rem' }}>{item.labName}</td>
                  <td style={{ padding: '0.5rem' }}>{item.slotTime}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`badge ${item.status === 'approved' ? 'badge-available' : 'badge-occupied'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

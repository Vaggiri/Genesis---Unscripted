import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Camera, 
  AlertTriangle, 
  Users, 
  Car,
  Check
} from 'lucide-react';

export default function WardenPortal({ user }) {
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'validator' | 'movement'

  // Mock pending parent pass requests
  const [pendingPasses, setPendingPasses] = useState([
    {
      id: 'AMR-PASS-904',
      parent_name: 'Lakshmi Narayanan',
      phone: '+91 98401 23456',
      student_name: 'Adithya K.',
      roll_no: 'CB.EN.U4CSE23012',
      room: 'D-312',
      vehicle_no: 'TN 38 BX 4419',
      arrival: 'Today 14:00 - 18:00',
      purpose: 'Hostel Visit & Deliver Project Hardware',
      status: 'pending'
    },
    {
      id: 'AMR-PASS-905',
      parent_name: 'Venkatesh S.',
      phone: '+91 94440 12988',
      student_name: 'Rohan V.',
      roll_no: 'CB.EN.U4CSE23048',
      room: 'D-208',
      vehicle_no: 'KL 09 AT 8812',
      arrival: 'Today 15:30 - 19:00',
      purpose: 'Weekend Medical Consultation',
      status: 'pending'
    }
  ]);

  // Gatepass Validator State
  const [scanCode, setScanCode] = useState('AMR-PASS-904');
  const [scanResult, setScanResult] = useState(null);

  const handleApprove = (id) => {
    setPendingPasses(pendingPasses.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  const handleReject = (id) => {
    setPendingPasses(pendingPasses.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  };

  const handleVerifyPass = (e) => {
    e.preventDefault();
    if (scanCode.toUpperCase().includes('904') || scanCode.toUpperCase().includes('PASS')) {
      setScanResult({
        valid: true,
        token: scanCode.toUpperCase(),
        visitor: 'Lakshmi Narayanan (2 Visitors)',
        student: 'Adithya K. (CB.EN.U4CSE23012 - Room D-312)',
        vehicle: 'TN 38 BX 4419 (Car)',
        validity: 'Valid Today Until 18:00 IST',
        status_text: 'VERIFIED • ENTRY PERMITTED'
      });
    } else {
      setScanResult({
        valid: false,
        token: scanCode,
        message: 'Invalid or Expired Gatepass Token.'
      });
    }
  };

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Warden Header Card */}
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
            MR
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Murugesh R.'}
              </h2>
              <span className="badge badge-maroon">Hostel Warden Portal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Jurisdiction: <strong>{user?.hostel_block || 'D-Block (Senior Boys Hostel)'}</strong> • Emp ID: {user?.emp_id || 'AMR-WRD-044'}
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'approvals' ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
              backgroundColor: activeTab === 'approvals' ? 'var(--amrita-maroon)' : '#ffffff',
              color: activeTab === 'approvals' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Pass Approvals ({pendingPasses.filter(p => p.status === 'pending').length})
          </button>
          
          <button
            onClick={() => setActiveTab('validator')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'validator' ? '1px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
              backgroundColor: activeTab === 'validator' ? 'var(--amrita-maroon)' : '#ffffff',
              color: activeTab === 'validator' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Gatepass Scanner / Validator
          </button>
        </div>
      </div>

      {/* TAB 1: PASS APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
            Parent Visit & Gate Clearance Request Queue
          </h3>

          {pendingPasses.map(pass => (
            <div 
              key={pass.id}
              className="card-amrita"
              style={{
                padding: '1.15rem',
                borderLeft: pass.status === 'approved' ? '4px solid var(--status-available)' : pass.status === 'rejected' ? '4px solid var(--status-occupied)' : '4px solid var(--amrita-gold)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {pass.parent_name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    ({pass.phone})
                  </span>
                </div>
                <span className={`badge ${pass.status === 'approved' ? 'badge-available' : pass.status === 'rejected' ? 'badge-occupied' : 'badge-flagged'}`}>
                  {pass.status.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                <div>• <strong>Student:</strong> {pass.student_name} ({pass.roll_no}) — Room <strong>{pass.room}</strong></div>
                <div>• <strong>Vehicle:</strong> {pass.vehicle_no} • <strong>Window:</strong> {pass.arrival}</div>
                <div>• <strong>Purpose:</strong> {pass.purpose}</div>
              </div>

              {pass.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleApprove(pass.id)}
                    className="btn-amrita"
                    style={{ minHeight: '36px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', backgroundColor: 'var(--status-available)' }}
                  >
                    <Check size={14} />
                    <span>Approve & Issue E-Pass</span>
                  </button>

                  <button
                    onClick={() => handleReject(pass.id)}
                    className="btn-secondary"
                    style={{ minHeight: '36px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--status-occupied)' }}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: pass.status === 'approved' ? 'var(--status-available)' : 'var(--status-occupied)' }}>
                  Decision recorded. Pass updated across Gate Security consoles.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE GATEPASS VALIDATOR & SCANNER */}
      {activeTab === 'validator' && (
        <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Camera size={20} color="var(--amrita-maroon)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
              Gate & Hostel QR Pass Validator
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Scan or enter parent visitor QR token to verify clearance instantly.
          </p>

          <form onSubmit={handleVerifyPass} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              placeholder="Scan or enter token e.g. AMR-PASS-904"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              className="form-input"
              style={{ minHeight: '44px' }}
            />
            <button type="submit" className="btn-amrita">
              <span>Validate</span>
            </button>
          </form>

          {/* Validation Result */}
          {scanResult && (
            <div style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${scanResult.valid ? 'var(--status-available-border)' : 'var(--status-occupied-border)'}`,
              backgroundColor: scanResult.valid ? 'var(--status-available-bg)' : 'var(--status-occupied-bg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {scanResult.valid ? <CheckCircle2 size={24} color="var(--status-available)" /> : <XCircle size={24} color="var(--status-occupied)" />}
                <span style={{ fontWeight: 800, fontSize: '1rem', color: scanResult.valid ? 'var(--status-available-text)' : 'var(--status-occupied-text)' }}>
                  {scanResult.status_text || scanResult.message}
                </span>
              </div>

              {scanResult.valid && (
                <div style={{ fontSize: '0.825rem', color: 'var(--status-available-text)', lineHeight: 1.6 }}>
                  <div>• <strong>Token ID:</strong> {scanResult.token}</div>
                  <div>• <strong>Visitor:</strong> {scanResult.visitor}</div>
                  <div>• <strong>Student & Ward:</strong> {scanResult.student}</div>
                  <div>• <strong>Vehicle Reg:</strong> {scanResult.vehicle}</div>
                  <div>• <strong>Validity:</strong> {scanResult.validity}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => alert('Entry registered in digital gate audit log!')} className="btn-amrita" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                      Log Entry Recorded
                    </button>
                    <button onClick={() => alert('Exit registered!')} className="btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                      Log Exit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

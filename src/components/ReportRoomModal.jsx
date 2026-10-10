import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Building, 
  FlaskConical, 
  MessageSquare, 
  Send,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportRoomModal({ 
  isOpen, 
  onClose, 
  classroom, 
  onReportSubmitted 
}) {
  if (!isOpen || !classroom) return null;

  const [reportType, setReportType] = useState('unscheduled_occupancy');
  const [reportedBatch, setReportedBatch] = useState('');
  const [reportedDepartment, setReportedDepartment] = useState('Computer Science & Engineering');
  const [isLabClass, setIsLabClass] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [occupancyLevel, setOccupancyLevel] = useState('Full');
  const [reporterName, setReporterName] = useState('');
  const [reporterRollNo, setReporterRollNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultAlert, setResultAlert] = useState(null);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Artificial Intelligence & Data Science',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical & Electronics Engineering',
    'Mathematics & Sciences',
    'Student Clubs / CIR Placement Training'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResultAlert(null);

    const reportPayload = {
      room_id: classroom.id,
      report_type: reportType,
      reported_batch: reportedBatch.trim() || 'Unspecified Batch',
      reported_department: reportedDepartment,
      is_lab_class: isLabClass,
      purpose: purpose.trim() || (reportType === 'class_cancelled_empty' ? 'Class was cancelled / Room is free' : 'Unscheduled Session'),
      occupancy_level: occupancyLevel,
      reporter_name: reporterName.trim() || 'Anonymous Student',
      reporter_roll_no: reporterRollNo.trim() || 'N/A',
      reporter_role: 'student'
    };

    try {
      const res = await api.submitReport(reportPayload);
      setSubmitting(false);

      if (res.is_permanently_flagged) {
        setResultAlert({
          type: 'warning',
          message: `🚨 REPORT SUBMITTED: Room ${classroom.room_number} has now reached ≥2 reports this week and has been AUTO-FLAGGED PERMANENTLY across CampusSync!`
        });
      } else {
        setResultAlert({
          type: 'success',
          message: `✅ Report recorded for Room ${classroom.room_number}. Thank you for keeping the campus space matrix accurate!`
        });
      }

      if (onReportSubmitted) onReportSubmitted(classroom.id);

      setTimeout(() => {
        onClose();
        setResultAlert(null);
      }, 1800);
    } catch (err) {
      setSubmitting(false);
      setResultAlert({
        type: 'error',
        message: `Failed to record report: ${err.message}`
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245, 158, 11, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Report Room Status: {classroom.room_number}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {classroom.block} • Floor {classroom.floor} • Capacity {classroom.capacity}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Notice Box */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: '#fde68a',
            display: 'flex',
            gap: '0.6rem'
          }}>
            <ShieldAlert size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Crowdsource Auto-Flag Rule:</strong> If a room receives <strong>2 or more unscheduled reports in a week</strong>, it is permanently flagged with an amber warning badge to alert all project teams that the room is frequently occupied.
            </div>
          </div>

          {/* Status Result Message */}
          {resultAlert && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: resultAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : resultAlert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: `1px solid ${resultAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.4)' : resultAlert.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              color: resultAlert.type === 'warning' ? '#fde68a' : resultAlert.type === 'success' ? '#6ee7b7' : '#fda4af'
            }}>
              {resultAlert.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{resultAlert.message}</span>
            </div>
          )}

          {/* Report Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              What is the current ground status of this room?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setReportType('unscheduled_occupancy')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: reportType === 'unscheduled_occupancy' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                  background: reportType === 'unscheduled_occupancy' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: reportType === 'unscheduled_occupancy' ? '#fbbf24' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🔴 Occupied by Unscheduled Class / Event
              </button>

              <button
                type="button"
                onClick={() => setReportType('class_cancelled_empty')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: reportType === 'class_cancelled_empty' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  background: reportType === 'class_cancelled_empty' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: reportType === 'class_cancelled_empty' ? '#34d399' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🟢 Class Cancelled / Room is Actually Free!
              </button>
            </div>
          </div>

          {/* Occupying Batch & Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Occupying Batch / Class
              </label>
              <input
                type="text"
                placeholder="e.g. CSE-B 3rd Year, AI-DS 2024-28"
                value={reportedBatch}
                onChange={(e) => setReportedBatch(e.target.value)}
                required={reportType === 'unscheduled_occupancy'}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <Building size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Department
              </label>
              <select
                value={reportedDepartment}
                onChange={(e) => setReportedDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lab Class Toggle & Occupancy Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FlaskConical size={15} color="#38bdf8" />
                  <span>Is this a Lab Class?</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Using lab PCs / hardware</div>
              </div>
              <input
                type="checkbox"
                checked={isLabClass}
                onChange={(e) => setIsLabClass(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Occupancy Level
              </label>
              <select
                value={occupancyLevel}
                onChange={(e) => setOccupancyLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Full">Full (No empty benches)</option>
                <option value="Moderate">Moderate (50% Occupied)</option>
                <option value="Sparse">Sparse / Few students</option>
                <option value="Empty">Completely Empty</option>
              </select>
            </div>
          </div>

          {/* Purpose / Remarks */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
              Purpose / Reason for Occupancy
            </label>
            <input
              type="text"
              placeholder="e.g. Extra Remedial Practical, Hackathon Mentoring, Club Meeting"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required={reportType === 'unscheduled_occupancy'}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Reporter Optional Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Your Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Anonymous if left blank"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.825rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Roll Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CB.EN.U4CSE..."
                value={reporterRollNo}
                onChange={(e) => setReporterRollNo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.825rem'
                }}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 2, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting Report...' : 'Publish Ground Report'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

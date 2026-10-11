import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Building, 
  FlaskConical, 
  MessageSquare, 
  Send
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportRoomModal({ 
  isOpen, 
  onClose, 
  classroom, 
  onReportSubmitted 
}) {
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

  if (!isOpen || !classroom) return null;

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
          message: `🚨 Room ${classroom.room_number} reached ≥2 reports this week and is now FLAGGED across the campus portal!`
        });
      } else {
        setResultAlert({
          type: 'success',
          message: `✅ Report recorded for Room ${classroom.room_number}. Thank you!`
        });
      }

      if (onReportSubmitted) onReportSubmitted(classroom.id);

      setTimeout(() => {
        onClose();
        setResultAlert(null);
      }, 1600);
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
      <div className="modal-content">
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--amrita-maroon-bg)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
              Report Status: Room {classroom.room_number}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {classroom.block} • Floor {classroom.floor} • Capacity {classroom.capacity}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Result Alert */}
          {resultAlert && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: resultAlert.type === 'warning' ? 'var(--status-flagged-bg)' : resultAlert.type === 'success' ? 'var(--status-available-bg)' : 'var(--status-occupied-bg)',
              color: resultAlert.type === 'warning' ? 'var(--status-flagged-text)' : resultAlert.type === 'success' ? 'var(--status-available-text)' : 'var(--status-occupied-text)',
              border: `1px solid ${resultAlert.type === 'warning' ? 'var(--status-flagged-border)' : resultAlert.type === 'success' ? 'var(--status-available-border)' : 'var(--status-occupied-border)'}`
            }}>
              {resultAlert.message}
            </div>
          )}

          {/* Status Options */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Ground Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setReportType('unscheduled_occupancy')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: reportType === 'unscheduled_occupancy' ? '2px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                  backgroundColor: reportType === 'unscheduled_occupancy' ? 'var(--amrita-maroon-bg)' : '#ffffff',
                  color: reportType === 'unscheduled_occupancy' ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🔴 Taken by Extra Batch
              </button>

              <button
                type="button"
                onClick={() => setReportType('class_cancelled_empty')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: reportType === 'class_cancelled_empty' ? '2px solid var(--status-available)' : '1px solid var(--border-light)',
                  backgroundColor: reportType === 'class_cancelled_empty' ? 'var(--status-available-bg)' : '#ffffff',
                  color: reportType === 'class_cancelled_empty' ? 'var(--status-available-text)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🟢 Class Cancelled / Free
              </button>
            </div>
          </div>

          {/* Batch & Dept */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Occupying Batch
              </label>
              <input
                type="text"
                placeholder="e.g. CSE-B 3rd Yr, ECE-A"
                value={reportedBatch}
                onChange={(e) => setReportedBatch(e.target.value)}
                required={reportType === 'unscheduled_occupancy'}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Department
              </label>
              <select
                value={reportedDepartment}
                onChange={(e) => setReportedDepartment(e.target.value)}
                className="form-select"
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lab Checkbox & Level */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '42px', padding: '0 0.5rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                id="is_lab_student"
                checked={isLabClass}
                onChange={(e) => setIsLabClass(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--amrita-maroon)' }}
              />
              <label htmlFor="is_lab_student" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                Is this a Lab Class?
              </label>
            </div>

            <div>
              <select
                value={occupancyLevel}
                onChange={(e) => setOccupancyLevel(e.target.value)}
                className="form-select"
              >
                <option value="Full">Full (No empty seats)</option>
                <option value="Moderate">Moderate (Half full)</option>
                <option value="Empty">Completely Empty</option>
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Purpose / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Remedial Test, Project Prep, Extra Lecture"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required={reportType === 'unscheduled_occupancy'}
              className="form-input"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
              className="btn-amrita"
              style={{ flex: 2 }}
            >
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  Sliders, 
  Calendar, 
  Building, 
  Flag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Save, 
  ShieldCheck, 
  BarChart3, 
  FileSpreadsheet, 
  UserCog, 
  ArrowLeft, 
  Bell, 
  Laptop 
} from 'lucide-react';
import { api } from '../services/api';
import UtilizationDashboard from './UtilizationDashboard';
import NotificationsView from './NotificationsView';
import IctsRequisitionsView from './IctsRequisitionsView';
import YuktiLogo from './YuktiLogo';
import { useNotifications } from '../context/NotificationContext';

export default function AdminPortal({ 
  onRefreshNeeded, 
  settings, 
  onSaveSettings,
  activeTab: externalTab,
  onTabChange
}) {
  const [internalTab, setInternalTab] = useState('utilization');
  const activeTab = externalTab || internalTab;
  const setActiveTab = (tabId) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };
  const [previousTab, setPreviousTab] = useState(null);
  const { unreadCount } = useNotifications();
  const [ictsRequests, setIctsRequests] = useState([]);

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    if (previousTab) {
      const prev = previousTab;
      setPreviousTab(null);
      setActiveTab(prev);
    } else {
      setActiveTab('utilization');
    }
  };

  const [classrooms, setClassrooms] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [csvTimetables, setCsvTimetables] = useState([]);
  const [csvTimetableErrors, setCsvTimetableErrors] = useState([]);
  const [importingTimetables, setImportingTimetables] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Classroom Form
  const [newRoom, setNewRoom] = useState({
    block: 'AB-1',
    room_number: '',
    floor: 1,
    capacity: 60,
    room_type: 'lecture_hall',
    amenities: ['projector', 'power_sockets']
  });

  // Timetable Form
  const [newSlot, setNewSlot] = useState({
    room_id: 'AB1-101',
    day_of_week: 'Monday',
    start_time: '08:45',
    end_time: '09:35',
    slot_number: 1,
    subject_name: '',
    subject_code: '',
    department: 'Computer Science & Engineering',
    batch: 'B.Tech CSE-A (Sem 4)',
    is_lab: false,
    faculty_name: ''
  });

  // Settings Form
  const [adminSettings, setAdminSettings] = useState(settings || {
    campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active: true
  });

  const loadAll = useCallback(async () => {
    try {
      const [classRes, ttRes, repRes, setRes, usersRes, auditRes, ictsRes] = await Promise.all([
        api.getClassrooms('Monday', '10:00'),
        api.getTimetables(),
        api.getReports(),
        api.getSettings(),
        api.adminGetUsers().catch(() => []),
        api.adminGetAuditLog().catch(() => []),
        api.getIctsRequests().catch(() => [])
      ]);
      setClassrooms(classRes.classrooms || []);
      setTimetables(ttRes || []);
      setReports(repRes || []);
      if (setRes) setAdminSettings(setRes);
      setUsersList(usersRes || []);
      setAuditLogs(auditRes || []);
      setIctsRequests(ictsRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }, []);

  const pendingIctsCount = ictsRequests.filter(r => r.status === 'pending').length;

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.adminUpdateUserRole(userId, newRole);
      showToast(`Role updated to ${newRole}`);
      loadAll();
    } catch (err) {
      showToast(`Failed: ${err.message}`, true);
    }
  };

  const handleTimetableCsvParse = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const errs = [];
        const valid = [];

        rows.forEach((r, i) => {
          const room = (r.room || r.room_id || '').trim();
          const day = (r.day || r.day_of_week || 'Monday').trim();
          const start = (r.start || r.start_time || '').trim();
          const end = (r.end || r.end_time || '').trim();
          const subject = (r.subject || r.subject_name || '').trim();

          if (!room || !start || !end || !subject) {
            errs.push(`Row ${i + 2}: room, start, end, and subject are required.`);
          } else {
            valid.push({
              room_id: room,
              day_of_week: day,
              start_time: start,
              end_time: end,
              slot_number: Number(r.slot || r.slot_number || 1),
              subject_name: subject,
              subject_code: r.subject_code || '',
              department: r.department || 'CSE',
              batch: r.batch || 'General',
              is_lab: String(r.is_lab).toLowerCase() === 'true',
              faculty_name: r.faculty || r.faculty_name || 'Faculty Member'
            });
          }
        });

        setCsvTimetableErrors(errs);
        setCsvTimetables(valid);
      }
    });
  };

  const handleConfirmTimetableImport = async () => {
    if (csvTimetables.length === 0) return;
    setImportingTimetables(true);
    try {
      const res = await api.adminImportTimetables(csvTimetables);
      showToast(`Imported ${res.count || csvTimetables.length} timetable schedule entries!`);
      setCsvTimetables([]);
      loadAll();
    } catch (err) {
      showToast(`Import failed: ${err.message}`, true);
    } finally {
      setImportingTimetables(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const showToast = (message, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    if (!newRoom.room_number) return;
    try {
      const id = `${newRoom.block.replace(/[^A-Za-z0-9]/g, '')}-${newRoom.room_number.replace(/\s+/g, '')}`;
      await api.adminAddClassroom({ ...newRoom, id });
      showToast(`Room ${newRoom.room_number} added!`);
      setNewRoom({
        block: 'AB-1',
        room_number: '',
        floor: 1,
        capacity: 60,
        room_type: 'lecture_hall',
        amenities: ['projector', 'power_sockets']
      });
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm(`Delete classroom ${id}?`)) return;
    try {
      await api.adminDeleteClassroom(id);
      showToast(`Classroom ${id} deleted.`);
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleUnflagClassroom = async (id) => {
    try {
      await api.adminUnflagClassroom(id);
      showToast(`Flag cleared for room ${id}!`);
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleAddTimetable = async (e) => {
    e.preventDefault();
    if (!newSlot.subject_name) return;
    try {
      await api.adminAddTimetable(newSlot);
      showToast(`Timetable slot added!`);
      setNewSlot({ ...newSlot, subject_name: '', subject_code: '', faculty_name: '' });
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleDeleteTimetable = async (id) => {
    try {
      await api.adminDeleteTimetable(id);
      showToast('Timetable slot removed.');
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleResolveReport = async (id, action) => {
    try {
      await api.adminResolveReport(id, action);
      showToast(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}.`);
      loadAll();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(adminSettings);
      showToast('Settings saved!');
      if (onSaveSettings) onSaveSettings(adminSettings);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Error: ${err.message}`, true);
    }
  };

  return (
    <div style={{ padding: '1rem 0 3rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <YuktiLogo size={46} style={{ borderRadius: '13px', boxShadow: '0 4px 12px rgba(164, 18, 63, 0.25)', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.65rem)', color: 'var(--text-main)', fontWeight: 800 }}>
              Admin Management Desk
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Campus innovation facilities, room schedules, crowd moderation, and system governance
            </p>
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            fontWeight: 600,
            backgroundColor: feedback.isError ? 'var(--status-occupied-bg)' : 'var(--status-available-bg)',
            color: feedback.isError ? 'var(--status-occupied-text)' : 'var(--status-available-text)',
            border: `1px solid ${feedback.isError ? 'var(--status-occupied-border)' : 'var(--status-available-border)'}`
          }}>
            {feedback.message}
          </div>
        )}
      </div>

      {/* Responsive Command Grid Navigation */}
      <nav className="portal-nav-grid" aria-label="Admin Navigation">
        {[
          { id: 'utilization', label: 'Utilization Engine', icon: BarChart3 },
          { id: 'icts', label: 'ICTS Gear Requisitions', icon: Laptop, badge: pendingIctsCount },
          { id: 'notifications', label: `Notifications`, icon: Bell, badge: unreadCount },
          { id: 'users', label: `Users & Roles (${usersList.length})`, icon: UserCog },
          { id: 'timetables-import', label: 'Import Timetable CSV', icon: FileSpreadsheet },
          { id: 'classrooms', label: `Classrooms (${classrooms.length})`, icon: Building },
          { id: 'timetables', label: `Timetables (${timetables.length})`, icon: Calendar },
          { id: 'reports', label: `Crowd Reports (${reports.length})`, icon: Flag },
          { id: 'audit', label: `Security Audit (${auditLogs.length})`, icon: ShieldCheck },
          { id: 'settings', label: 'Portal Configuration', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`portal-nav-tile ${isActive ? 'active' : ''}`}
            >
              <div className="portal-nav-tile-icon">
                <Icon size={17} />
              </div>
              <span className="portal-nav-tile-text">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="portal-nav-tile-badge">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Universal Page Back Navigation Button */}
      {(activeTab !== 'utilization' || previousTab) && (
        <div style={{ 
          marginBottom: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
            title="Go back to previous page"
          >
            <ArrowLeft size={16} color="var(--amrita-maroon)" />
            <span>Back {previousTab ? 'to Previous Section' : 'to Utilization Engine'}</span>
          </button>

          <span className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Active Section: {activeTab.toUpperCase()}
          </span>
        </div>
      )}

      {/* TAB: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <NotificationsView />
      )}

      {/* TAB: ICTS HARDWARE REQUISITIONS */}
      {activeTab === 'icts' && (
        <IctsRequisitionsView currentUser={{ full_name: 'ICTS Admin Desk', role: 'admin' }} isAdmin={true} />
      )}

      {/* TAB 2: CLASSROOMS CRUD */}
      {activeTab === 'classrooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Add Classroom Card */}
          <div className="card-amrita" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Add New Classroom
            </h3>
            <form onSubmit={handleAddClassroom} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Block</label>
                <select
                  value={newRoom.block}
                  onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
                  className="form-select"
                >
                  <option value="AB-1">AB-1</option>
                  <option value="AB-2">AB-2</option>
                  <option value="AB-3">AB-3</option>
                  <option value="CIR">CIR</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Room No</label>
                <input
                  type="text"
                  placeholder="e.g. 206"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Capacity</label>
                <input
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Type</label>
                <select
                  value={newRoom.room_type}
                  onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                  className="form-select"
                >
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab_computer">Computer Lab</option>
                  <option value="lab_electronics">IoT / Hardware Lab</option>
                </select>
              </div>

              <div>
                <button type="submit" className="btn-amrita" style={{ width: '100%' }}>
                  <Plus size={16} /> Add Room
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="card-amrita" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem' }}>Room</th>
                  <th style={{ padding: '0.5rem' }}>Block</th>
                  <th style={{ padding: '0.5rem' }}>Capacity</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map(room => (
                  <tr key={room.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>{room.room_number}</td>
                    <td style={{ padding: '0.5rem' }}>{room.block}</td>
                    <td style={{ padding: '0.5rem' }}>{room.capacity}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {room.is_flagged ? (
                        <span className="badge badge-flagged" style={{ fontSize: '0.65rem' }}>Flagged ({room.flag_count}x)</span>
                      ) : (
                        <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>Normal</span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {room.is_flagged && (
                          <button
                            onClick={() => handleUnflagClassroom(room.id)}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--amrita-gold)', backgroundColor: 'var(--amrita-gold-bg)', color: 'var(--amrita-gold)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Clear Flag
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClassroom(room.id)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--status-occupied-border)', backgroundColor: 'var(--status-occupied-bg)', color: 'var(--status-occupied)', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLES CRUD */}
      {activeTab === 'timetables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card-amrita" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--amrita-maroon)' }}>
              Add Timetable Schedule Slot
            </h3>
            <form onSubmit={handleAddTimetable} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Room</label>
                <select
                  value={newSlot.room_id}
                  onChange={(e) => setNewSlot({ ...newSlot, room_id: e.target.value })}
                  className="form-select"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.block} - {c.room_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Day</label>
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
                  className="form-select"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Time</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} className="form-input" />
                  <input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} className="form-input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. AI Lab"
                  value={newSlot.subject_name}
                  onChange={(e) => setNewSlot({ ...newSlot, subject_name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Batch</label>
                <input
                  type="text"
                  placeholder="e.g. CSE-A Sem 4"
                  value={newSlot.batch}
                  onChange={(e) => setNewSlot({ ...newSlot, batch: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <button type="submit" className="btn-amrita" style={{ width: '100%' }}>
                  <Plus size={16} /> Save Slot
                </button>
              </div>
            </form>
          </div>

          <div className="card-amrita" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem' }}>Room</th>
                  <th style={{ padding: '0.5rem' }}>Day</th>
                  <th style={{ padding: '0.5rem' }}>Time</th>
                  <th style={{ padding: '0.5rem' }}>Subject</th>
                  <th style={{ padding: '0.5rem' }}>Batch</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map(slot => (
                  <tr key={slot.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>{slot.room_id}</td>
                    <td style={{ padding: '0.5rem' }}>{slot.day_of_week}</td>
                    <td style={{ padding: '0.5rem' }}>{slot.start_time} - {slot.end_time}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{slot.subject_name}</td>
                    <td style={{ padding: '0.5rem' }}>{slot.batch}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteTimetable(slot.id)} style={{ border: 'none', background: 'transparent', color: 'var(--status-occupied)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CROWD REPORTS */}
      {activeTab === 'reports' && (
        <div className="card-amrita" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Student Crowd Reports ({reports.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {reports.map(rep => (
              <div 
                key={rep.id} 
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 800 }}>Room {rep.room_id}</span>
                    <span className="badge badge-flagged" style={{ fontSize: '0.65rem' }}>{rep.report_type}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <strong>Batch:</strong> {rep.reported_batch} • <strong>Dept:</strong> {rep.reported_department} • <strong>Activity:</strong> {rep.purpose}
                  </div>
                </div>
                {rep.status === 'active' && (
                  <button
                    onClick={() => handleResolveReport(rep.id, 'resolve')}
                    className="btn-secondary"
                    style={{ minHeight: '32px', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    <CheckCircle size={13} color="var(--status-available)" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="card-amrita" style={{ padding: '1.25rem', maxWidth: '540px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Portal Configuration
          </h3>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                Auto-Flag Threshold (Reports/Week)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={adminSettings.flag_threshold || 2}
                onChange={(e) => setAdminSettings({ ...adminSettings, flag_threshold: Number(e.target.value) })}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                Campus Banner Alert
              </label>
              <textarea
                rows={2}
                value={adminSettings.banner_message}
                onChange={(e) => setAdminSettings({ ...adminSettings, banner_message: e.target.value })}
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn-amrita" style={{ alignSelf: 'flex-start' }}>
              <Save size={15} />
              <span>Save Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="card-amrita" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              User Accounts & Role-Based Access Control (RBAC)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Server & RLS Enforced Roles
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem' }}>User / Full Name</th>
                  <th style={{ padding: '0.6rem' }}>Roll No / Emp ID</th>
                  <th style={{ padding: '0.6rem' }}>Department</th>
                  <th style={{ padding: '0.6rem' }}>Active Role</th>
                  <th style={{ padding: '0.6rem' }}>Change Privileges</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.6rem' }}>
                      <strong>{u.full_name || 'Amrita User'}</strong>
                    </td>
                    <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>
                      {u.roll_no || u.emp_id || '—'}
                    </td>
                    <td style={{ padding: '0.6rem' }}>{u.department || 'General'}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <span className="badge badge-maroon" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="lab_incharge">Lab In-Charge</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TIMETABLES CSV BULK IMPORT */}
      {activeTab === 'timetables-import' && (
        <div className="card-amrita" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Bulk Timetable Schedule CSV Intake
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Upload campus timetable master sheets (CSV format: <code>room, day, start, end, slot, subject, faculty, batch, is_lab</code>).
          </p>

          <div style={{ border: '2px dashed var(--border-light)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1rem' }}>
            <input
              type="file"
              id="admin-timetable-csv"
              accept=".csv"
              onChange={handleTimetableCsvParse}
              style={{ display: 'none' }}
            />
            <label htmlFor="admin-timetable-csv" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={32} color="var(--amrita-maroon)" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Click to select timetable CSV spreadsheet</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Columns: room, day, start, end, slot, subject, faculty, batch</span>
            </label>
          </div>

          {csvTimetableErrors.length > 0 && (
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.75rem', color: '#9f1239' }}>
              <strong>Row Errors Detected:</strong>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                {csvTimetableErrors.map((e, idx) => <li key={idx}>{e}</li>)}
              </ul>
            </div>
          )}

          {csvTimetables.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Preview: {csvTimetables.length} Valid Timetable Slots Ready to Import
                </span>
                <button
                  onClick={handleConfirmTimetableImport}
                  disabled={importingTimetables}
                  className="btn-amrita"
                  style={{ fontSize: '0.8rem' }}
                >
                  {importingTimetables ? 'Importing...' : 'Commit to Database'}
                </button>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead style={{ backgroundColor: 'var(--bg-surface-alt)', position: 'sticky', top: 0 }}>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Room</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Day</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Time</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Subject</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvTimetables.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700 }}>{r.room_id}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.day_of_week}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.start_time} - {r.end_time}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.subject_name}</td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{r.faculty_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SECURITY AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="card-amrita" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--amrita-maroon)" />
              Security Audit Log
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tracks logins, role mutations, booking creation & approval
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.5rem' }}>Actor</th>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                  <th style={{ padding: '0.5rem' }}>Entity</th>
                  <th style={{ padding: '0.5rem' }}>Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <strong>{log.profiles?.full_name || 'System / Admin'}</strong>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className="badge badge-maroon" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>{log.entity}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {log.entity_id || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: UTILIZATION DASHBOARD */}
      {activeTab === 'utilization' && (
        <UtilizationDashboard />
      )}

    </div>
  );
}

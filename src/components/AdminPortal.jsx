import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Calendar, 
  Building, 
  Flag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  Layers, 
  Clock, 
  Users, 
  Edit3
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ onRefreshNeeded, settings, pagesConfig, onSaveSettings }) {
  const [activeTab, setActiveTab] = useState('cms'); // 'cms' | 'classrooms' | 'timetables' | 'reports' | 'settings'
  const [pages, setPages] = useState(pagesConfig || []);
  const [classrooms, setClassrooms] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const loadAll = async () => {
    setLoading(true);
    try {
      const [classRes, ttRes, repRes, pagesRes, setRes] = await Promise.all([
        api.getClassrooms('Monday', '10:00'),
        api.getTimetables(),
        api.getReports(),
        api.getPages(),
        api.getSettings()
      ]);
      setClassrooms(classRes.classrooms || []);
      setTimetables(ttRes || []);
      setReports(repRes || []);
      setPages(pagesRes || []);
      setAdminSettings(setRes || adminSettings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showToast = (message, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSavePage = async (page) => {
    try {
      await api.updatePage(page.slug, page);
      showToast(`Page "${page.title}" updated dynamically!`);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      showToast(`Failed: ${err.message}`, true);
    }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.65rem)', color: 'var(--text-main)', fontWeight: 800 }}>
            Admin Management Desk
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Dynamic portal page editing, timetable manager, and crowd report moderation
          </p>
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

      {/* Amrita Ribbon Tile Grid (No horizontal scrolling) */}
      <div className="amrita-tile-grid" style={{ marginBottom: '1.25rem' }}>
        {[
          { id: 'cms', label: 'Dynamic CMS Pages', icon: Layers },
          { id: 'classrooms', label: `Classrooms (${classrooms.length})`, icon: Building },
          { id: 'timetables', label: `Timetables (${timetables.length})`, icon: Calendar },
          { id: 'reports', label: `Crowd Reports (${reports.length})`, icon: Flag },
          { id: 'settings', label: 'Portal Configuration', icon: Sliders }
        ].map(tab => {
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

      {/* TAB 1: DYNAMIC CMS PAGE EDITOR */}
      {activeTab === 'cms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {pages.map((p, idx) => (
            <div key={p.slug} className="card-amrita" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-maroon">{p.slug}</span>
                <button
                  onClick={() => handleSavePage(p)}
                  className="btn-amrita"
                  style={{ minHeight: '34px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                >
                  <Save size={13} />
                  <span>Save</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const updated = [...pages];
                      updated[idx].title = e.target.value;
                      setPages(updated);
                    }}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={p.subtitle}
                    onChange={(e) => {
                      const updated = [...pages];
                      updated[idx].subtitle = e.target.value;
                      setPages(updated);
                    }}
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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

    </div>
  );
}

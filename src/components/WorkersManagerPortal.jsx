import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function WorkersManagerPortal({ user }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Clean and reset desks in AB1-204 after remedial coding test', location: 'AB1-204', status: 'pending', priority: 'High' },
    { id: 2, text: 'Replenish black PETG filament on 3D Printer #2 in FabLab', location: 'FabLab', status: 'in_progress', priority: 'High' },
    { id: 3, text: 'Inspect projector HDMI cable and audio mic in Seminar Hall 1', location: 'CIR Seminar 1', status: 'done', priority: 'Normal' },
    { id: 4, text: 'Restock soldering flux & copper clad boards in IoT Hardware Lab', location: 'AB2-210', status: 'in_progress', priority: 'Normal' }
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState('AB-1');
  const [newPriority, setNewPriority] = useState('Normal');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTaskText.trim(),
        location: newTaskLocation,
        status: 'pending',
        priority: newPriority
      }
    ]);
    setNewTaskText('');
  };

  const toggleStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'pending';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{ padding: '1rem 0 3rem', maxWidth: '780px' }}>
      
      {/* Header */}
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
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {user?.name || 'Ramesh Kumar'}
              </h2>
              <span className="badge badge-maroon">Workers Manager</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Campus Facilities, Cleaning & Lab Maintenance Roster
            </div>
          </div>
        </div>

        <span className="badge badge-available">
          {tasks.filter(t => t.status === 'done').length} / {tasks.length} Completed
        </span>
      </div>

      {/* Add Task Form */}
      <div className="card-amrita" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--amrita-maroon)', marginBottom: '0.5rem' }}>
          Assign Facility Maintenance Task
        </h3>
        
        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="e.g. Fix power outlet socket in AB3-305..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            required
            className="form-input"
            style={{ minHeight: '38px' }}
          />

          <input
            type="text"
            placeholder="Location (e.g. AB1-204)"
            value={newTaskLocation}
            onChange={(e) => setNewTaskLocation(e.target.value)}
            className="form-input"
            style={{ width: '130px', minHeight: '38px' }}
          />

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="form-select"
            style={{ width: '100px', minHeight: '38px' }}
          >
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          <button type="submit" className="btn-amrita" style={{ minHeight: '38px', padding: '0 0.85rem' }}>
            <Plus size={15} />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tasks.map(task => (
          <div
            key={task.id}
            className="card-amrita"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              backgroundColor: task.status === 'done' ? 'var(--bg-surface-alt)' : '#ffffff',
              opacity: task.status === 'done' ? 0.75 : 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => toggleStatus(task.id)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: task.status === 'done' ? '1px solid var(--status-available)' : '1px solid var(--border-light)',
                  backgroundColor: task.status === 'done' ? 'var(--status-available-bg)' : '#ffffff',
                  color: task.status === 'done' ? 'var(--status-available)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Toggle Task Status"
              >
                {task.status === 'done' ? <Check size={16} /> : <Clock size={14} />}
              </button>

              <div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  textDecoration: task.status === 'done' ? 'line-through' : 'none'
                }}>
                  {task.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Location: <strong>{task.location}</strong> • Priority: <strong>{task.priority}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${task.status === 'done' ? 'badge-available' : task.status === 'in_progress' ? 'badge-lab' : 'badge-flagged'}`} style={{ fontSize: '0.675rem' }}>
                {task.status === 'done' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Delete Task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, X, ExternalLink, Key, RefreshCw } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';

export default function SupabaseConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'schema'

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Please enter both Supabase Project URL and Anon API Key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    if (onConfigSaved) onConfigSaved({ url, key: anonKey });
    onClose();
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    if (onConfigSaved) onConfigSaved({ url: '', key: '' });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Supabase Cloud Database Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Connect directly to your live Supabase project</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 1.5rem' }}>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'config' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'config' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Connection Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'schema' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'schema' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            SQL Setup Guide
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'config' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#c7d2fe' }}>
                💡 <strong>Zero-Fail Architecture:</strong> CampusSync includes built-in mock & local store fallback. Connecting Supabase enables live cloud synchronization and real-time multiplayer updates across devices.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Supabase Anon / Public API Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {testResult && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    color: testResult.success ? '#34d399' : '#fb7185'
                  }}
                >
                  {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  {testing ? <RefreshCw size={16} className="spin" /> : <Key size={16} />}
                  Test Cloud Connection
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Save & Connect
                </button>
              </div>

              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    textDecoration: 'underline'
                  }}
                >
                  Disconnect & Reset to Local Fallback Store
                </button>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Run the contents of <code>supabase_schema.sql</code> in your Supabase SQL Editor to automatically create the tables, seed Amrita campus data, and enable Realtime sync:
              </p>
              <pre
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.775rem',
                  color: '#93c5fd',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace'
                }}
              >
{`-- Found in root directory: supabase_schema.sql
-- 1. Creates 'classrooms' table with auto-flagging columns
-- 2. Creates 'timetables' schedule table
-- 3. Creates 'occupancy_reports' crowdsource table
-- 4. Creates 'portal_settings' & 'portal_pages' dynamic CMS
-- 5. Enables Supabase Realtime publication`}
              </pre>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', gap: '0.4rem' }}
                >
                  Open Supabase Dashboard <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

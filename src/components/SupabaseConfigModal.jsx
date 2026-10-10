import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, X, Key, RefreshCw } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';

export default function SupabaseConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Database size={20} color="var(--amrita-maroon)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--amrita-maroon)' }}>
                Supabase Cloud Database
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Connect live Amrita cloud database credentials
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="form-input"
            />
          </div>

          {testResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: testResult.success ? 'var(--status-available-bg)' : 'var(--status-occupied-bg)',
                color: testResult.success ? 'var(--status-available-text)' : 'var(--status-occupied-text)',
                border: `1px solid ${testResult.success ? 'var(--status-available-border)' : 'var(--status-occupied-border)'}`
              }}
            >
              {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              {testing ? <RefreshCw size={15} className="spin" /> : <Key size={15} />}
              <span>Test Sync</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-amrita"
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
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              Disconnect & Reset to Local Store
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

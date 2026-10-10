import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  X,
  Zap,
  Globe
} from 'lucide-react';

export default function AiTunnelModal({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    baseUrl: 'http://localhost:20128/v1',
    model: 'vag',
    apiKey: 'sk-omniroute'
  });
  const [newUrl, setNewUrl] = useState('');
  const [isNgrok, setIsNgrok] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [errorDetails, setErrorDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const fetchCurrentStatus = async () => {
    setConnectionStatus('checking');
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || {});
        setIsNgrok(data.isNgrok || false);
        setConnectionStatus(data.connectionStatus || 'connected');
        setErrorDetails(data.errorDetails || null);
        setNewUrl(data.config?.baseUrl || '');
      } else {
        setConnectionStatus('offline');
      }
    } catch (e) {
      setConnectionStatus('offline');
      setErrorDetails(e.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!newUrl.trim()) return;
    setIsSaving(true);
    setSuccessToast('');

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: newUrl.trim(),
          model: 'vag',
          apiKey: 'sk-omniroute'
        })
      });

      if (res.ok) {
        setSuccessToast('✅ Tunnel endpoint updated successfully!');
        await fetchCurrentStatus();
      } else {
        setErrorDetails('Failed to update config on server');
      }
    } catch (e) {
      setErrorDetails(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const vercelSnippet = `OMNIROUTE_BASE_URL=${newUrl.trim() || 'https://<your-ngrok-subdomain>.ngrok-free.app/v1'}
OMNIROUTE_MODEL=vag
OMNIROUTE_API_KEY=sk-omniroute`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(vercelSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        animation: 'scaleUp 0.2s ease-out'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#50071e',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#fcd34d" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                OmniRoute & ngrok Cloud Bridge
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>
                Local model &lsquo;vag&rsquo; &bull; Port 20128 &bull; Instant Cloud Forwarding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              opacity: 0.8,
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Status Bar */}
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            backgroundColor: connectionStatus === 'connected' ? '#f0fdf4' : connectionStatus === 'checking' ? '#eff6ff' : '#fef2f2',
            border: `1px solid ${connectionStatus === 'connected' ? '#bbf7d0' : connectionStatus === 'checking' ? '#bfdbfe' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {connectionStatus === 'connected' && <CheckCircle2 size={18} color="#16a34a" />}
              {connectionStatus === 'checking' && <RefreshCw size={18} color="#2563eb" className="spin" />}
              {connectionStatus === 'offline' && <AlertCircle size={18} color="#dc2626" />}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  {connectionStatus === 'connected' ? 'OmniRoute Active & Connected' : connectionStatus === 'checking' ? 'Testing Connection...' : 'AI Service Unreachable'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Model: <strong>vag</strong> &bull; Mode: <strong>{isNgrok ? 'ngrok Cloud Tunnel' : 'Localhost Direct'}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={fetchCurrentStatus}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} /> Test
            </button>
          </div>

          {/* Quick Setup Instructions for ngrok */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="var(--amrita-maroon)" />
              <span>How to Forward OmniRoute to Cloud:</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.775rem', color: '#475569', lineHeight: 1.6 }}>
              <li>
                Open PowerShell on your laptop and run:
                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  margin: '4px 0',
                  userSelect: 'all'
                }}>
                  ngrok http 20128
                </div>
              </li>
              <li>Copy the <strong>Forwarding</strong> URL (e.g. <code>https://xxxx.ngrok-free.app</code>).</li>
              <li>Paste it into the field below and click <strong>Save & Test</strong>.</li>
            </ol>
          </div>

          {/* Input field for URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Active AI Base URL (Local or ngrok):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="http://localhost:20128/v1 or https://xxxx.ngrok-free.app"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.825rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={handleSaveAndTest}
                disabled={isSaving}
                style={{
                  backgroundColor: 'var(--amrita-maroon)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 1rem',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save & Test'}
              </button>
            </div>
            {successToast && (
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                {successToast}
              </div>
            )}
          </div>

          {/* Vercel Environment Variables Box */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            borderRadius: '10px',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                Copy for Vercel / Cloud Settings:
              </span>
              <button
                onClick={handleCopySnippet}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#4ade80' : '#38bdf8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Env'}
              </button>
            </div>
            <pre style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#f8fafc',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {vercelSnippet}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1.25rem',
              backgroundColor: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.825rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

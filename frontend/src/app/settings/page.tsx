'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable states
  const [cron, setCron] = useState('0 8 * * *');
  const [maxFrames, setMaxFrames] = useState(12);

  const fetchSettings = async () => {
    try {
      const data = await apiFetch<any>('/api/settings');
      setConfig(data);
      setCron(data.scheduler?.cron || '0 8 * * *');
      setMaxFrames(data.frameSampling?.maxFrames || 12);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (platform: string, key: string, value: string) => {
    setSaving(true);
    try {
      await apiFetch(`/api/settings/${platform}/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      alert('Setting saved successfully. System will apply this on next run or reboot.');
      fetchSettings();
    } catch (err) {
      alert(`Failed to save: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div><div className="loading-spinner" /> Loading settings...</div>;
  if (!config) return <div style={{ color: 'var(--accent-red)' }}>Failed to load settings</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure AI, storage, and platform behaviors</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Scheduler Settings */}
        <section className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Daily Scheduler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Execution Time (Cron)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={cron} 
                  onChange={(e) => setCron(e.target.value)}
                />
                <button 
                  className="btn-secondary" 
                  onClick={() => handleSave('scheduler', 'cron', cron)}
                  disabled={saving}
                >Save</button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Default: 0 8 * * * (8:00 AM daily)</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Concurrency (Simultaneous Profiles)</label>
              <div className="input-field" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                {config.scheduler?.concurrency || 2} (Configured via YAML)
              </div>
            </div>
          </div>
        </section>

        {/* Telegram Configuration */}
        <section className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Telegram Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              {config.telegram?.configured ? (
                <span className="badge-green">Connected</span>
              ) : (
                <span className="badge-red">Not Configured</span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Chat ID</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{config.telegram?.chatId || 'Not set'}</span>
            </div>

            {config.telegram?.botId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Open Telegram Bot</span>
                <a 
                  href={`https://t.me/${config.telegram.botId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  Open Telegram
                </a>
              </div>
            )}
          </div>
        </section>

        {/* AI Provider */}
        <section className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>AI Provider (NVIDIA)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Provider</label>
              <div className="input-field" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                {config.ai?.provider || 'nvidia'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Model</label>
              <div className="input-field" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                {config.ai?.model || 'meta/llama-4-scout-17b'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: config.ai?.apiKeySet ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
            <span className={`pulse-dot ${config.ai?.apiKeySet ? 'active' : 'inactive'}`}></span>
            {config.ai?.apiKeySet ? 'API Key is securely configured via environment.' : 'API Key is missing in environment.'}
          </div>
        </section>

        {/* Frame Sampling */}
        <section className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Video Frame Sampling</h2>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Maximum Frames per Video</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                className="input-field" 
                value={maxFrames} 
                onChange={(e) => setMaxFrames(parseInt(e.target.value, 10))}
                style={{ width: '150px' }}
              />
              <button 
                className="btn-secondary" 
                onClick={() => handleSave('frameSampling', 'maxFrames', maxFrames.toString())}
                disabled={saving}
              >Save</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Limits how many frames are sent to the AI to control context size and cost.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

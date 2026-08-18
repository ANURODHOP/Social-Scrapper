'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchReports = async () => {
    try {
      const data = await apiFetch<any[]>('/api/reports');
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSendToTelegram = async (id: string) => {
    setSending(prev => ({ ...prev, [id]: true }));
    try {
      await apiFetch(`/api/reports/${id}/send`, { method: 'POST' });
      alert('Report successfully sent to Telegram!');
    } catch (err) {
      alert(`Failed to send: ${(err as Error).message}`);
    } finally {
      setSending(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div><div className="loading-spinner" /> Loading reports...</div>;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Generated Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI analysis and intelligence reports</p>
      </header>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {reports.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No reports generated yet.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Profile</th>
                <th>Type / Format</th>
                <th>Generated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td colSpan={5} style={{ padding: 0, border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {report.profile ? `@${report.profile.username}` : 'System'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="badge-blue">{report.type}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{report.format}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        {new Date(report.generatedAt).toLocaleString()}
                      </div>
                      <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleSendToTelegram(report.id)}
                          disabled={sending[report.id]}
                        >
                          {sending[report.id] ? 'Sending...' : 'Send to Telegram'}
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => toggleExpand(report.id)}
                        >
                          {expanded[report.id] ? 'Hide' : 'View'}
                        </button>
                      </div>
                    </div>
                    {expanded[report.id] && (
                      <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)', maxHeight: '400px', overflowY: 'auto' }}>
                          {report.content}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

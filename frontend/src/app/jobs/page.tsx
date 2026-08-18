'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function JobsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'scheduler' | 'history'>('scheduler');
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    try {
      const [runsData, historyData] = await Promise.all([
        apiFetch<any[]>('/api/scheduler/runs'),
        apiFetch<any[]>('/api/jobs/history'),
      ]);
      setRuns(runsData);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRun = async () => {
    setTriggering(true);
    try {
      await apiFetch('/api/scheduler/run', { method: 'POST' });
      alert('Manual scan triggered successfully!');
      setTimeout(fetchData, 2000); // refresh after a delay
    } catch (err) {
      alert(`Trigger failed: ${(err as Error).message}`);
    } finally {
      setTriggering(false);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms == null) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  if (loading) return <div><div className="loading-spinner" /> Loading jobs...</div>;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>System Jobs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Scheduler executions and task history</p>
        </div>
        <button className="btn-primary" onClick={handleManualRun} disabled={triggering}>
          {triggering ? 'Triggering...' : '▶ Run Scheduler Now'}
        </button>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            color: activeTab === 'scheduler' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'scheduler' ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
          onClick={() => setActiveTab('scheduler')}
        >
          Scheduler Runs
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            color: activeTab === 'history' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
          onClick={() => setActiveTab('history')}
        >
          Job Queue History
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {activeTab === 'scheduler' ? (
          runs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No scheduler runs recorded yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Status</th>
                  <th>Started At</th>
                  <th>Finished At</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: 500 }}>{run.name}</td>
                    <td>
                      <span className={`badge-${run.status === 'completed' ? 'green' : run.status === 'failed' ? 'red' : 'blue'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td>{new Date(run.startedAt).toLocaleString()}</td>
                    <td>{run.finishedAt ? new Date(run.finishedAt).toLocaleString() : '-'}</td>
                    <td>
                      {run.finishedAt ? formatDuration(new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          history.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No job history recorded yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Status</th>
                  <th>Started At</th>
                  <th>Duration</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 500 }}>{job.jobName}</td>
                    <td>
                      <span className={`badge-${job.status === 'completed' ? 'green' : 'red'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.startedAt).toLocaleString()}</td>
                    <td>{formatDuration(job.duration)}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {job.failedReason || job.result || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

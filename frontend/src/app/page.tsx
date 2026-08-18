'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><div className="loading-spinner" /> Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--accent-red)' }}>Error loading dashboard: {error}</div>;
  if (!data) return null;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Social Intelligence Platform</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Automated monitoring, analysis & reporting</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Profiles Monitored</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{data.stats.profileCount}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>New Posts Today</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-blue)' }}>{data.stats.postsToday}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>New Reels Today</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-purple)' }}>{data.stats.reelsToday}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Reports Generated</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{data.stats.totalReports}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Scheduler Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span className={data.scheduler.isRunning ? 'badge-green' : 'badge-red'}>
                {data.scheduler.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Run</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {data.scheduler.lastRun ? new Date(data.scheduler.lastRun).toLocaleString() : 'Never'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Next Run</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {data.scheduler.nextRun ? new Date(data.scheduler.nextRun).toLocaleString() : 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Jobs</span>
              <span style={{ color: 'var(--text-primary)' }}>{data.scheduler.activeCronJobs.length}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Telegram Delivery</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              {data.telegramSent >= 0 ? (
                <span className="badge-blue">Connected</span>
              ) : (
                <span className="badge-amber">Not Configured</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Reports Sent</span>
              <span style={{ color: 'var(--text-primary)' }}>{data.stats.telegramSent}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Posts</h2>
          {data.recentPosts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No posts found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPosts.map((post: any) => (
                  <tr key={post.id}>
                    <td>@{post.profile.username}</td>
                    <td><span className={`badge-${post.mediaType === 'VIDEO' ? 'purple' : 'blue'}`}>{post.mediaType}</span></td>
                    <td>{new Date(post.publishedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Reports</h2>
          {data.recentReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reports generated yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReports.map((report: any) => (
                  <tr key={report.id}>
                    <td>{report.title}</td>
                    <td>{new Date(report.generatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

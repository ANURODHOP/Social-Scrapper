'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanStatus, setScanStatus] = useState<Record<string, 'scanning' | 'success' | 'error' | null>>({});

  const fetchProfiles = async () => {
    try {
      const data = await apiFetch<any[]>('/api/profiles');
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch('/api/profiles', {
        method: 'POST',
        body: JSON.stringify({
          platform: 'instagram',
          platformId: username,
          username,
          displayName,
        }),
      });
      setShowAddModal(false);
      setUsername('');
      setDisplayName('');
      fetchProfiles();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/api/profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchProfiles();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await apiFetch(`/api/profiles/${id}`, { method: 'DELETE' });
      fetchProfiles();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleScan = async (id: string) => {
    setScanStatus(prev => ({ ...prev, [id]: 'scanning' }));
    try {
      await apiFetch(`/api/profiles/${id}/scan`, { method: 'POST' });
      setScanStatus(prev => ({ ...prev, [id]: 'success' }));
      setTimeout(() => setScanStatus(prev => ({ ...prev, [id]: null })), 3000);
    } catch (err) {
      setScanStatus(prev => ({ ...prev, [id]: 'error' }));
      setTimeout(() => setScanStatus(prev => ({ ...prev, [id]: null })), 5000);
      alert(`Scan failed: ${(err as Error).message}`);
    }
  };

  if (loading) return <div><div className="loading-spinner" /> Loading profiles...</div>;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Monitored Profiles</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage Instagram accounts to monitor</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Profile
        </button>
      </header>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '400px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Add Instagram Profile</h2>
            <form onSubmit={handleAddProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Username</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. fabriziorom" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Display Name (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Fabrizio Romano" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {profiles.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No profiles added yet. Click 'Add Profile' to start monitoring.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Added</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(profile => (
                <tr key={profile.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>@{profile.username}</div>
                    {profile.displayName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.displayName}</div>}
                  </td>
                  <td><span className="badge-purple">{profile.platform}</span></td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(profile.id, profile.isActive)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span className={profile.isActive ? 'badge-green' : 'badge-gray'}>
                        {profile.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </button>
                  </td>
                  <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleScan(profile.id)}
                        disabled={scanStatus[profile.id] === 'scanning' || !profile.isActive}
                      >
                        {scanStatus[profile.id] === 'scanning' ? 'Scanning...' : 
                         scanStatus[profile.id] === 'success' ? '✓ Scanned' : 
                         scanStatus[profile.id] === 'error' ? 'Failed' : 'Scan Now'}
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                        onClick={() => handleDelete(profile.id)}
                      >
                        Delete
                      </button>
                    </div>
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

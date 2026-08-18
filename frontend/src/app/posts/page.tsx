'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [profileId, setProfileId] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [isProcessed, setIsProcessed] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (profileId) query.set('profileId', profileId);
      if (mediaType) query.set('mediaType', mediaType);
      if (isProcessed) query.set('isProcessed', isProcessed);
      
      const data = await apiFetch<any[]>(`/api/posts?${query.toString()}`);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiFetch<any[]>('/api/profiles').then(setProfiles).catch(console.error);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [profileId, mediaType, isProcessed]);

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Collected Posts</h1>
        <p style={{ color: 'var(--text-secondary)' }}>All media acquired from monitored profiles</p>
      </header>

      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <select 
          className="input-field" 
          value={profileId} 
          onChange={(e) => setProfileId(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Profiles</option>
          {profiles.map(p => <option key={p.id} value={p.id}>@{p.username}</option>)}
        </select>

        <select 
          className="input-field" 
          value={mediaType} 
          onChange={(e) => setMediaType(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="">All Types</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Video/Reel</option>
          <option value="CAROUSEL_ALBUM">Carousel</option>
        </select>

        <select 
          className="input-field" 
          value={isProcessed} 
          onChange={(e) => setIsProcessed(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="true">Processed</option>
          <option value="false">Pending</option>
        </select>
      </div>

      {loading ? (
        <div><div className="loading-spinner" /> Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No posts found matching the filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {posts.map(post => (
            <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                <div style={{ height: '200px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      No Image Available
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                    <span className={`badge-${post.mediaType === 'VIDEO' ? 'purple' : 'blue'}`}>{post.mediaType}</span>
                    <span className={post.isProcessed ? 'badge-green' : 'badge-amber'}>{post.isProcessed ? 'Analyzed' : 'Pending'}</span>
                  </div>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>@{post.profile?.username}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.caption || <i>No caption</i>}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

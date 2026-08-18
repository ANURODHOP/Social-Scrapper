'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/posts/${resolvedParams.id}`)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) return <div><div className="loading-spinner" /> Loading post details...</div>;
  if (!post) return <div style={{ color: 'var(--accent-red)' }}>Post not found</div>;

  const analysis = post.analysis;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Post Analysis</h1>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <span className="badge-purple">{post.platform}</span>
          <span className={`badge-${post.mediaType === 'VIDEO' ? 'purple' : 'blue'}`}>{post.mediaType}</span>
          <span className={post.isProcessed ? 'badge-green' : 'badge-amber'}>{post.isProcessed ? 'Analyzed' : 'Pending'}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column: Original Post */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {post.thumbnailUrl ? (
              <img src={post.thumbnailUrl} alt="Original" style={{ width: '100%', height: 'auto', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '300px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No Media Available
              </div>
            )}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {post.profile?.profilePicUrl ? (
                  <img src={post.profile.profilePicUrl} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>@{post.profile?.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(post.publishedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                {post.caption}
              </p>
              {post.permalink && (
                <a href={post.permalink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
                  View Original Post ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!analysis ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}>AI Analysis is pending or failed for this post.</div>
            </div>
          ) : (
            <>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  Marketing Intelligence
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Brand / Product</h3>
                    <div style={{ fontWeight: 500 }}>{analysis.brand || 'Unidentified'}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{analysis.category}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Target Audience</h3>
                    <div style={{ fontSize: '14px' }}>{analysis.targetAudience || 'General'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Primary Message</h3>
                  <div style={{ fontSize: '14px', background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                    {analysis.primaryMessage || 'Not identified'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Hook</h3>
                    <div style={{ fontSize: '14px' }}>{analysis.hook || 'None'}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Call To Action</h3>
                    <div style={{ fontSize: '14px' }}>{analysis.callToAction || 'None'}</div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  Visual & Strategic Analysis
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Visual Style</h3>
                    <div style={{ fontSize: '14px' }}>{analysis.visualStyle || 'Standard'}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Emotion</h3>
                    <div style={{ fontSize: '14px' }}>{analysis.emotion || 'Neutral'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Marketing Strategy</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {analysis.marketingStrategy || 'Not identified'}
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Confidence Score</span>
                  <span className={`badge-${(analysis.overallConfidence || 0) > 0.8 ? 'green' : 'amber'}`}>
                    {Math.round((analysis.overallConfidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

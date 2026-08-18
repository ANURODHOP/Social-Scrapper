'use client';

export default function HowItWorksPage() {
  return (
    <div className="fade-in" style={{ maxWidth: '900px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }} className="gradient-text">How It Works</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          Social Intelligence Platform — Automated Instagram monitoring and AI analysis
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Step 1 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>📸</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '8px' }}>Step 1: Add Profiles</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Add Instagram usernames to monitor. The system will securely connect and verify the accounts without requiring any login credentials from you.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 2 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>⏰</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '8px' }}>Step 2: Daily Scheduler</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The system checks automatically every day at your configured time. It respects platform rate limits by using intelligent concurrency and delays.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 3 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>🔍</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '8px' }}>Step 3: Content Detection</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              New posts and reels are collected and deduplicated against the local SQLite database. High-quality media and captions are downloaded securely.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 4 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>🎬</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '8px' }}>Step 4: Frame Extraction</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              For video content (Reels), representative frames are automatically extracted at smart intervals. This provides the AI with rich visual context without massive data transfer.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 5 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>🤖</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>Step 5: NVIDIA AI Analysis</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The powerful NVIDIA Llama Vision model analyzes both the original caption text and the visual frames simultaneously to extract deep marketing intelligence.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 6 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>📊</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0ea5e9', marginBottom: '8px' }}>Step 6: Report Generation</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Detailed structured reports are generated from the AI's inferences. These cover brand identification, target audience, hooks, visual styles, and overall strategy.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: 'center', color: 'var(--border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>

        {/* Step 7 */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', width: '80px', textAlign: 'center' }}>📱</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#8b5cf6', marginBottom: '8px' }}>Step 7: Telegram Delivery</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The final executive summary is automatically formatted in Markdown and instantly pushed to your configured Telegram chat for immediate review.
            </p>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '64px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Do I need to provide Instagram login credentials?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              No. Our system uses a headless browser architecture that intercepts public GraphQL APIs to safely acquire data without requiring personal login credentials, reducing the risk of bans.
            </p>
          </div>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>How does the AI understand videos?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              We extract equidistant frames (images) from the video file. These frames, along with the post's text caption, are passed to a multi-modal Vision AI which correlates the visual changes with the text to infer the overall message.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Where is my data stored?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              All data is stored locally in a high-performance SQLite database. Media files are stored locally on your server's disk (or optionally in an S3 bucket if configured).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

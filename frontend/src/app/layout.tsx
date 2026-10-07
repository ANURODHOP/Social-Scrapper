'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './globals.css';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const NAV_ICONS: Record<string, string> = {
  '/':            '◈',
  '/profiles':    '◉',
  '/posts':       '▦',
  '/reports':     '◧',
  '/jobs':        '⊞',
  '/settings':    '◎',
  '/how-it-works':'◌',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const links = [
    { name: 'Dashboard',    path: '/' },
    { name: 'Profiles',     path: '/profiles' },
    { name: 'Posts',        path: '/posts' },
    { name: 'Reports',      path: '/reports' },
    { name: 'Jobs',         path: '/jobs' },
    { name: 'Settings',     path: '/settings' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <html lang="en">
      <head>
        <title>SIP — Social Intelligence Platform</title>
        <meta name="description" content="Automated social media monitoring, AI analysis and reporting." />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* ── Sidebar ── */}
          <aside style={{
            width: '224px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 12px',
            flexShrink: 0,
          }}>
            {/* Logo */}
            <div style={{ padding: '0 12px 28px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '32px', height: '32px',
                  background: 'var(--accent)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, color: '#0d0d0d',
                }}>S</span>
                <div>
                  <div className="gradient-text" style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>SIP</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.04em' }}>INTELLIGENCE</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`sidebar-link ${pathname === link.path ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '13px', opacity: 0.7, minWidth: '14px', textAlign: 'center' }}>
                    {NAV_ICONS[link.path]}
                  </span>
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', fontSize: '12px',
                color: apiOk === true ? 'var(--green)' : apiOk === false ? 'var(--red)' : 'var(--text-muted)',
              }}>
                <span className={`pulse-dot ${apiOk === true ? 'active' : apiOk === false ? 'error' : 'inactive'}`} />
                {apiOk === true ? 'API Connected' : apiOk === false ? 'API Offline' : 'Connecting…'}
              </div>
              <div style={{ padding: '4px 12px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                v1.0.0 · © 2026
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main style={{
            flex: 1,
            padding: '36px 48px',
            overflowY: 'auto',
            height: '100vh',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

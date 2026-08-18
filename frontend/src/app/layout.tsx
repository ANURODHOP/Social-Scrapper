'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './globals.css';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Profiles', path: '/profiles' },
    { name: 'Posts', path: '/posts' },
    { name: 'Reports', path: '/reports' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Settings', path: '/settings' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <html lang="en">
      <title>SIP - Social Intelligence Platform</title>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <aside style={{ width: '250px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
            <div style={{ padding: '0 16px 32px 16px' }}>
              <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 800 }}>🧠 SIP</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Social Intelligence</p>
            </div>
            
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`sidebar-link ${pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span className={`pulse-dot ${apiOk === true ? 'active' : apiOk === false ? 'error' : 'inactive'}`}></span>
                {apiOk === true ? 'API Connected' : apiOk === false ? 'API Offline' : 'Connecting...'}
              </div>
              <div style={{ padding: '8px 16px', fontSize: '10px', color: 'var(--text-muted)' }}>
                v1.0.0 • © 2026
              </div>
            </div>
          </aside>
          <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto', height: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

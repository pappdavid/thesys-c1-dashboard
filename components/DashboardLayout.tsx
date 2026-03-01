'use client';

import React, { ReactNode } from 'react';
import { Bell, Search, Zap } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Header ── */}
      <header
        className="flex h-13 flex-shrink-0 items-center gap-4 px-6"
        style={{
          background: 'rgba(20, 20, 40, 0.85)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              boxShadow: '0 0 12px var(--accent-purple-glow)',
            }}
          >
            <Zap size={11} color="#fff" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Thesys
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent-purple-light)' }}>
            C1
          </span>
          <span
            className="mx-1 text-xs"
            style={{ color: 'var(--border-strong)' }}
          >/</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </span>
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search pill */}
          <div
            className="hidden items-center gap-2 rounded-lg px-3 py-1.5 sm:flex"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              cursor: 'text',
            }}
          >
            <Search size={12} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Search…</span>
            <span
              className="ml-3 rounded px-1 text-[10px]"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Notifications */}
          <button
            className="relative rounded-lg p-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <Bell size={13} style={{ color: 'var(--text-muted)' }} />
            <span
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent-pink)' }}
            />
          </button>

          {/* Avatar */}
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            }}
          >
            D
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-5 md:p-6">
        {children}
      </main>
    </div>
  );
}

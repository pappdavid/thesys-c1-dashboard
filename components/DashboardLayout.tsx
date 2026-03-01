'use client';

import React, { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  GitPullRequest,
  Workflow,
  AlertCircle,
  ScrollText,
  Users,
  Settings,
  Key,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',      icon: <LayoutDashboard size={15} /> },
  { label: 'Pull Requests', icon: <GitPullRequest  size={15} />, badge: 4 },
  { label: 'CI/CD',         icon: <Workflow        size={15} /> },
  { label: 'Issues',        icon: <AlertCircle     size={15} />, badge: 12 },
  { label: 'Logs',          icon: <ScrollText      size={15} /> },
  { label: 'Team',          icon: <Users           size={15} /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const [activeNav, setActiveNav] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(7, 9, 18, 0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col transition-transform duration-300 ease-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand */}
        <div
          className="flex h-14 flex-shrink-0 items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              boxShadow: '0 0 14px var(--accent-purple-glow)',
            }}
          >
            <Zap size={13} color="#fff" />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Thesys
            </span>
            <span
              className="ml-1 text-xs font-semibold"
              style={{ color: 'var(--accent-purple-light)' }}
            >
              C1
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex-shrink-0 rounded-md p-1 md:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 pb-1.5 pt-5">
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-subtle)' }}
          >
            Platform
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
          {NAV_ITEMS.map((item, idx) => {
            const active = activeNav === idx;
            return (
              <button
                key={item.label}
                onClick={() => { setActiveNav(idx); setSidebarOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  background:   active ? 'rgba(124,58,237,0.1)'  : 'transparent',
                  color:        active ? 'var(--accent-purple-light)' : 'var(--text-muted)',
                  borderLeft:   active ? '2px solid var(--accent-purple)' : '2px solid transparent',
                }}
              >
                <span style={{ color: active ? 'var(--accent-purple-light)' : 'var(--text-subtle)', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                    style={{
                      background: active ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)',
                      color:      active ? 'var(--accent-purple-light)' : 'var(--text-muted)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0 space-y-0.5 p-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {[
            { icon: <Key size={14} />, label: 'API Keys' },
            { icon: <Settings size={14} />, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main wrapper ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex h-14 flex-shrink-0 items-center gap-3 px-5"
          style={{
            background: 'rgba(20, 20, 40, 0.85)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 md:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu size={17} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span style={{ color: 'var(--text-subtle)' }}>Platform</span>
            <ChevronRight size={13} style={{ color: 'var(--text-subtle)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
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
              <Bell size={14} style={{ color: 'var(--text-muted)' }} />
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

        {/* Content */}
        <main className="flex-1 overflow-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

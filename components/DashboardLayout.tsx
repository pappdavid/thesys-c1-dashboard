'use client';

import React, { ReactNode } from 'react';
import { Menu, X, Settings, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title = 'Dashboard',
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navItems = [
    { label: 'Overview', icon: BarChart3, active: true },
    { label: 'Pull Requests', icon: 'GitPullRequest' },
    { label: 'CI/CD Pipeline', icon: 'Zap' },
    { label: 'Issues', icon: 'AlertCircle' },
    { label: 'Logs', icon: 'FileText' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-r border-slate-700/50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-700/50 px-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-sm">Thesys C1</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                item.active
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-white shadow-lg shadow-blue-500/20 border border-blue-400/50'
                  : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 border border-transparent'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 my-4 h-px bg-gradient-to-r from-slate-700/0 via-slate-700/50 to-slate-700/0" />

        {/* Settings Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur p-4">
          <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-50 hover:bg-slate-800/50 transition-all duration-200">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-900/30 px-6 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-slate-800/50 transition-colors md:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}

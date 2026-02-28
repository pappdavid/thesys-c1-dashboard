'use client';

import React, { ReactNode } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title = 'Dashboard',
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden sm:inline-flex p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Thesys C1
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dev Dashboard</p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          } hidden sm:block`}
        >
          <nav className="flex flex-col gap-1 p-4">
            <NavItem label="Overview" active />
            <NavItem label="Pull Requests" />
            <NavItem label="CI/CD Pipeline" />
            <NavItem label="Issues" />
            <NavItem label="Logs" />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Powered by Thesys C1 Generative UI API</p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      {label}
    </button>
  );
}

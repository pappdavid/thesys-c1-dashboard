'use client';

import React, { ReactNode } from 'react';
import { Zap, BarChart3, Settings, Menu, X } from 'lucide-react';

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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${ sidebarOpen ? 'w-72' : 'w-20' } hidden lg:flex flex-col border-r border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-900/30 backdrop-blur-xl`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Zap size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-white">THESYS</h1>
                <p className="text-xs text-cyan-400 font-medium">C1 Dev</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {[
            { name: 'Overview', icon: '📊' },
            { name: 'Pull Requests', icon: '🔀' },
            { name: 'CI/CD Pipeline', icon: '⚡' },
            { name: 'Issues', icon: '⚠️' },
            { name: 'Logs', icon: '📝' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                i === 0
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/5 p-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-200">
            {!sidebarOpen && <Settings size={20} />}
            {sidebarOpen && (
              <>
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-gradient-to-r from-slate-900/50 to-purple-900/50 backdrop-blur-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <BarChart3 size={20} className="text-slate-400" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Content Wrapper */}
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Title Section */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
                <p className="text-slate-400">Powered by Thesys C1 Generative UI API</p>
              </div>

              {/* Main Content Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl p-8 shadow-2xl">
                <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

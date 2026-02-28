import React, { ReactNode } from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-700 bg-slate-900 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Thesys C1</h1>
          <p className="text-sm text-slate-400">Dev Dashboard</p>
        </div>
        
        <nav className="space-y-2">
          <a href="#" className="block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Overview
          </a>
          <a href="#" className="block rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Pull Requests
          </a>
          <a href="#" className="block rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            CI/CD Pipeline
          </a>
          <a href="#" className="block rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Issues
          </a>
          <a href="#" className="block rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Logs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="border-b border-slate-700 bg-slate-900 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-200">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
              <Settings size={20} />
            </button>
            <button className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-slate-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

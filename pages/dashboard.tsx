import React, { useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import C1Component from '@/components/C1Component';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [dashboardHtml, setDashboardHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');

  const generateDashboard = useCallback(async (prompt: string = '') => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setDashboardHtml(data.html || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate dashboard';
      setError(errorMessage);
      console.error('Dashboard generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial dashboard on mount
  React.useEffect(() => {
    generateDashboard();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateDashboard(userPrompt);
  };

  return (
    <DashboardLayout title="Developer Dashboard">
      {/* Header with Prompt Input */}
      <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Customize Dashboard</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., Show PRs from team, Add deployment metrics..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowRight size={18} />
            Generate
          </button>
        </form>
      </div>

      {/* Dashboard Content */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <C1Component
          html={dashboardHtml}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import C1Component from '@/components/C1Component';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  Rocket,
  GitPullRequest,
  CheckCircle2,
  Activity,
} from 'lucide-react';

/* ── Static KPI data ── */
const KPI_DATA = [
  {
    label: 'Deployments',
    value: '247',
    change: '+12%',
    trend: 'up' as const,
    sub: 'Last 30 days',
    icon: Rocket,
    color: 'var(--accent-cyan)',
    glow: 'var(--accent-cyan-glow)',
  },
  {
    label: 'Open PRs',
    value: '4',
    change: '-2',
    trend: 'down' as const,
    sub: 'Awaiting review',
    icon: GitPullRequest,
    color: 'var(--accent-purple-light)',
    glow: 'var(--accent-purple-glow)',
  },
  {
    label: 'Test Coverage',
    value: '94.2%',
    change: '+1.8%',
    trend: 'up' as const,
    sub: 'vs last week',
    icon: CheckCircle2,
    color: 'var(--accent-green)',
    glow: 'var(--accent-green-glow)',
  },
  {
    label: 'Uptime',
    value: '99.97%',
    change: '—',
    trend: 'flat' as const,
    sub: 'Last 90 days',
    icon: Activity,
    color: 'var(--accent-pink)',
    glow: 'var(--accent-pink-glow)',
  },
];

const QUICK_PROMPTS = [
  "Team PRs & review queue",
  "Production deployment history",
  "Open issues by priority",
  "CI/CD pipeline status",
];

export default function DashboardPage() {
  const [dashboardHtml, setDashboardHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  const generateDashboard = useCallback(async (prompt = '') => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt }),
      });
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();
      setDashboardHtml(data.html || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    generateDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateDashboard(userPrompt);
  };

  const handleQuickPrompt = (p: string) => {
    setUserPrompt(p);
    generateDashboard(p);
  };

  return (
    <DashboardLayout title="Developer Dashboard">

      {/* ── KPI row ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon =
            kpi.trend === 'up'   ? TrendingUp   :
            kpi.trend === 'down' ? TrendingDown : Minus;

          return (
            <div
              key={kpi.label}
              className="kpi-card"
              style={{ '--card-color': kpi.color, '--card-glow': kpi.glow } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-icon-wrap" style={{ color: kpi.color }}>
                  <Icon size={13} />
                </span>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <span className={`kpi-change ${kpi.trend}`}>
                  <TrendIcon size={9} />
                  {kpi.change}
                </span>
                <span className="kpi-sub">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Content + Sidebar ── */}
      <div className="flex flex-col gap-4 lg:flex-row">

        {/* C1 generated content */}
        <div className="min-w-0 flex-1">
          <C1Component html={dashboardHtml} isLoading={isLoading} error={error} />
        </div>

        {/* Customisation panel */}
        <div className="w-full flex-shrink-0 lg:w-72">
          <div className="prompt-panel sticky top-0">
            <div className="prompt-panel-header">
              <Sparkles size={13} className="prompt-panel-icon" />
              Customize
            </div>
            <p className="prompt-panel-description">
              Describe the view you need and C1 will generate it instantly.
            </p>

            <form onSubmit={handleSubmit}>
              <textarea
                className="prompt-textarea"
                placeholder="e.g., Show my team's open PRs sorted by staleness, deployment status for prod, and recent incidents…"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
              />
              <div className="mt-2.5 flex gap-2">
                <button type="submit" disabled={isLoading} className="btn-generate flex-1">
                  {isLoading
                    ? <RefreshCw size={12} className="animate-spin" />
                    : <Sparkles size={12} />
                  }
                  {isLoading ? 'Generating…' : 'Generate'}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="btn-refresh"
                  title="Reset to default"
                  onClick={() => { setUserPrompt(''); generateDashboard(''); }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </form>

            {/* Quick prompts */}
            <div className="mt-5">
              <p className="quick-prompts-label">Quick prompts</p>
              <div className="mt-2 flex flex-col gap-1">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    className="quick-prompt-btn"
                    onClick={() => handleQuickPrompt(p)}
                  >
                    <ArrowRight size={10} className="quick-prompt-icon" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

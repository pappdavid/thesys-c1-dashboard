import React, { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import C1Component from '@/components/C1Component';
import { PANELS } from '@/lib/panel-config';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
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

/* ── Per-panel state shape ── */
interface PanelState {
  content: string;
  loading: boolean;
  error: string;
}

const emptyPanelState = (): PanelState => ({ content: '', loading: false, error: '' });

export default function DashboardPage() {
  const [panels, setPanels] = useState<Record<string, PanelState>>(
    () => Object.fromEntries(PANELS.map((p) => [p.id, emptyPanelState()]))
  );

  /* ── Fetch a single panel ── */
  const fetchPanel = useCallback(async (panelId: string) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: { ...prev[panelId], loading: true, error: '' },
    }));

    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId }),
      });
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);
      const data = await res.json();

      setPanels((prev) => ({
        ...prev,
        [panelId]: { content: data.html ?? '', loading: false, error: '' },
      }));
    } catch (err) {
      setPanels((prev) => ({
        ...prev,
        [panelId]: {
          content: '',
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to generate panel',
        },
      }));
    }
  }, []);

  /* ── Load all panels in parallel on mount ── */
  useEffect(() => {
    PANELS.forEach((p) => fetchPanel(p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyLoading = PANELS.some((p) => panels[p.id]?.loading);

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

      {/* ── Refresh-all icon ── */}
      <div className="mb-3 flex justify-end">
        <button
          className="btn-refresh-all"
          onClick={() => PANELS.forEach((p) => fetchPanel(p.id))}
          disabled={anyLoading}
          title="Refresh all panels"
        >
          <RotateCcw size={12} className={anyLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── 2-column panel grid ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PANELS.map((panel) => {
          const state = panels[panel.id];
          return (
            <C1Component
              key={panel.id}
              html={state.content}
              isLoading={state.loading}
              error={state.error}
              onRefresh={() => fetchPanel(panel.id)}
            />
          );
        })}
      </div>

    </DashboardLayout>
  );
}

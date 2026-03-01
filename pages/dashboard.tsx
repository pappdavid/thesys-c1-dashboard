import React, { useState, useCallback, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardPanel, { Panel } from '@/components/DashboardPanel';
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
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';
import { DashboardCommand } from '@/lib/thesys-client';

/* ── Static KPI data ── */
const KPI_DATA = [
  { label: 'Deployments', value: '247', change: '+12%', trend: 'up'   as const, sub: 'Last 30 days',   icon: Rocket,        color: 'var(--accent-cyan)',         glow: 'var(--accent-cyan-glow)'    },
  { label: 'Open PRs',    value: '4',   change: '-2',   trend: 'down' as const, sub: 'Awaiting review', icon: GitPullRequest, color: 'var(--accent-purple-light)', glow: 'var(--accent-purple-glow)'  },
  { label: 'Coverage',    value: '94.2%', change: '+1.8%', trend: 'up' as const, sub: 'vs last week',   icon: CheckCircle2,  color: 'var(--accent-green)',        glow: 'var(--accent-green-glow)'   },
  { label: 'Uptime',      value: '99.97%', change: '—', trend: 'flat' as const, sub: 'Last 90 days',   icon: Activity,      color: 'var(--accent-pink)',         glow: 'var(--accent-pink-glow)'    },
];

// ── Panel helpers ────────────────────────────────────────────────────────────

let _idCounter = 0;
function newId() { return `panel-${Date.now()}-${++_idCounter}`; }

function makePanel(overrides: Partial<Panel> = {}): Panel {
  return {
    id: newId(),
    panelKey: undefined,
    type: 'c1',
    title: 'New Panel',
    content: '',
    isLoading: false,
    error: '',
    userPrompt: '',
    hasInput: true,
    ...overrides,
  };
}

// ── Initial panels from PANELS config + an agent chat panel ─────────────────

const INITIAL_PANELS: Panel[] = [
  ...PANELS.map(p => makePanel({ id: p.id, panelKey: p.id, type: 'c1', title: p.title, hasInput: true })),
  makePanel({ type: 'chat', title: 'Agent Assistant', hasInput: true }),
];

// ── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [panels, setPanels] = useState<Panel[]>(INITIAL_PANELS);
  const dragSrcId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ── Panel state helpers ────────────────────────────────────────────────

  const applyCommands = useCallback((commands: DashboardCommand[]) => {
    for (const cmd of commands) {
      switch (cmd.type) {
        case 'reorder':
          setPanels(prev => {
            const map = new Map(prev.map(p => [p.id, p]));
            const ordered = cmd.order.map(id => map.get(id)).filter(Boolean) as Panel[];
            const remaining = prev.filter(p => !cmd.order.includes(p.id));
            return [...ordered, ...remaining];
          });
          break;
        case 'update':
          setPanels(prev => prev.map(p =>
            p.id === cmd.id
              ? { ...p, content: cmd.content, ...(cmd.title ? { title: cmd.title } : {}), isLoading: false }
              : p
          ));
          break;
        case 'add_panel':
          setPanels(prev => [...prev, makePanel({
            type: cmd.panel.type,
            title: cmd.panel.title,
            hasInput: cmd.panel.hasInput ?? true,
          })]);
          break;
        case 'remove_panel':
          setPanels(prev => prev.filter(p => p.id !== cmd.id));
          break;
        case 'set_input':
          setPanels(prev => prev.map(p => p.id === cmd.id ? { ...p, hasInput: cmd.hasInput } : p));
          break;
        case 'set_type':
          setPanels(prev => prev.map(p => p.id === cmd.id ? { ...p, type: cmd.panelType, content: '' } : p));
          break;
        case 'set_title':
          setPanels(prev => prev.map(p => p.id === cmd.id ? { ...p, title: cmd.title } : p));
          break;
      }
    }
  }, []);

  const fetchPanel = useCallback(async (id: string, prompt?: string) => {
    // Snapshot current panels for API context
    setPanels(prev => {
      const snapshot = prev;

      (async () => {
        const panel = snapshot.find(p => p.id === id);
        if (!panel) return;

        const effectivePrompt = prompt ?? panel.userPrompt;

        setPanels(ps => ps.map(p => p.id === id ? { ...p, isLoading: true, error: '' } : p));

        try {
          const res = await fetch('/api/panel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              panelId: panel.panelKey,
              prompt: effectivePrompt || undefined,
              panelType: panel.type,
              panels: snapshot.map(p => ({ id: p.id, type: p.type, title: p.title })),
            }),
          });

          if (!res.ok) throw new Error(`API error: ${res.statusText}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);

          setPanels(ps => ps.map(p =>
            p.id === id ? { ...p, content: data.content ?? '', isLoading: false, error: '' } : p
          ));

          if (data.commands?.length) {
            applyCommands(data.commands);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setPanels(ps => ps.map(p => p.id === id ? { ...p, isLoading: false, error: msg } : p));
        }
      })();

      return prev; // return unchanged for this setState call
    });
  }, [applyCommands]);

  // ── Auto-load all panels on mount ────────────────────────────────────────

  useEffect(() => {
    INITIAL_PANELS.forEach(p => fetchPanel(p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drag-and-drop handlers ───────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragSrcId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragSrcId.current;
    setDragOverId(null);
    dragSrcId.current = null;
    if (!sourceId || sourceId === targetId) return;

    setPanels(prev => {
      const next = [...prev];
      const srcIdx = next.findIndex(p => p.id === sourceId);
      const tgtIdx = next.findIndex(p => p.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const [removed] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, removed);
      return next;
    });
  }, []);

  // ── Panel action handlers ────────────────────────────────────────────────

  const handlePromptChange = useCallback((id: string, value: string) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, userPrompt: value } : p));
  }, []);

  const handleSubmit    = useCallback((id: string) => fetchPanel(id), [fetchPanel]);
  const handleRefresh   = useCallback((id: string) => fetchPanel(id), [fetchPanel]);
  const handleRemove    = useCallback((id: string) => setPanels(prev => prev.filter(p => p.id !== id)), []);
  const handleToggleInput = useCallback((id: string) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, hasInput: !p.hasInput } : p));
  }, []);
  const handleToggleType  = useCallback((id: string) => {
    setPanels(prev => prev.map(p =>
      p.id === id ? { ...p, type: p.type === 'c1' ? 'chat' : 'c1', content: '' } : p
    ));
  }, []);

  const addPanel = (type: 'c1' | 'chat') => {
    setPanels(prev => [...prev, makePanel({
      type,
      title: type === 'c1' ? 'C1 Panel' : 'Chat Panel',
      hasInput: true,
    })]);
  };

  const anyLoading = panels.some(p => p.isLoading);

  return (
    <DashboardLayout title="Developer Dashboard">

      {/* ── KPI row ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
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
                <span className={`kpi-change ${kpi.trend}`}><TrendIcon size={9} />{kpi.change}</span>
                <span className="kpi-sub">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Refresh-all + Add panel row ── */}
      <div className="mb-3 flex items-center justify-between">
        <div className="add-panel-row" style={{ margin: 0 }}>
          <button className="add-panel-btn" onClick={() => addPanel('c1')}>
            <LayoutDashboard size={12} />
            Add C1 Panel
          </button>
          <button className="add-panel-btn add-panel-btn-chat" onClick={() => addPanel('chat')}>
            <MessageSquare size={12} />
            Add Chat Panel
          </button>
        </div>

        <button
          className="btn-refresh-all"
          onClick={() => panels.forEach(p => fetchPanel(p.id))}
          disabled={anyLoading}
          title="Refresh all panels"
        >
          <RotateCcw size={12} className={anyLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Draggable panel grid ── */}
      <div className="panel-grid">
        {panels.map(panel => (
          <DashboardPanel
            key={panel.id}
            panel={panel}
            isDragOver={dragOverId === panel.id}
            onPromptChange={handlePromptChange}
            onSubmit={handleSubmit}
            onRemove={handleRemove}
            onToggleInput={handleToggleInput}
            onToggleType={handleToggleType}
            onRefresh={handleRefresh}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        ))}
      </div>

    </DashboardLayout>
  );
}

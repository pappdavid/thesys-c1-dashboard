'use client';

import React, { useRef } from 'react';
import {
  GripVertical,
  RefreshCw,
  X,
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  SendHorizonal,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatContent from './ChatContent';

const ThesysRenderer = dynamic(() => import('./ThesysRenderer'), { ssr: false });

// ── Panel data type (shared with dashboard.tsx) ────────────────────────────

export interface Panel {
  id: string;
  type: 'c1' | 'chat';
  title: string;
  content: string;
  isLoading: boolean;
  error: string;
  userPrompt: string;
  hasInput: boolean;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface DashboardPanelProps {
  panel: Panel;
  isDragOver: boolean;
  onPromptChange: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleInput: (id: string) => void;
  onToggleType: (id: string) => void;
  onRefresh: (id: string) => void;
  // HTML5 DnD
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardPanel({
  panel,
  isDragOver,
  onPromptChange,
  onSubmit,
  onRemove,
  onToggleInput,
  onToggleType,
  onRefresh,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: DashboardPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit(panel.id);
    }
  };

  return (
    <div
      className={`dashboard-panel${isDragOver ? ' panel-drag-over' : ''}`}
      onDragOver={(e) => onDragOver(e, panel.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, panel.id)}
    >
      {/* ── Header ── */}
      <div
        className="panel-header"
        draggable
        onDragStart={(e) => onDragStart(e, panel.id)}
      >
        {/* Drag handle */}
        <span className="panel-drag-handle" title="Drag to reorder">
          <GripVertical size={13} />
        </span>

        {/* Type badge */}
        <span className={`panel-type-badge panel-type-${panel.type}`}>
          {panel.type === 'c1'
            ? <LayoutDashboard size={10} />
            : <MessageSquare size={10} />
          }
          {panel.type === 'c1' ? 'C1' : 'Chat'}
        </span>

        {/* Title */}
        <span className="panel-title">{panel.title}</span>

        {/* Controls */}
        <div className="panel-controls">
          {/* Toggle type */}
          <button
            className="panel-ctrl-btn"
            title={`Switch to ${panel.type === 'c1' ? 'Chat' : 'C1'} panel`}
            onClick={() => onToggleType(panel.id)}
          >
            {panel.type === 'c1'
              ? <MessageSquare size={12} />
              : <LayoutDashboard size={12} />
            }
          </button>

          {/* Toggle input */}
          <button
            className={`panel-ctrl-btn${panel.hasInput ? ' active' : ''}`}
            title={panel.hasInput ? 'Hide input' : 'Show input'}
            onClick={() => onToggleInput(panel.id)}
          >
            {panel.hasInput
              ? <ToggleRight size={12} />
              : <ToggleLeft size={12} />
            }
          </button>

          {/* Refresh */}
          <button
            className="panel-ctrl-btn"
            title="Refresh content"
            disabled={panel.isLoading}
            onClick={() => onRefresh(panel.id)}
          >
            <RefreshCw size={12} className={panel.isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Remove */}
          <button
            className="panel-ctrl-btn panel-ctrl-btn-danger"
            title="Remove panel"
            onClick={() => onRemove(panel.id)}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="panel-content">
        {panel.isLoading ? (
          <div className="panel-skeleton">
            <div className="skeleton-bar h-6 w-40 mb-3" />
            <div className="skeleton-bar h-4 w-full mb-2" />
            <div className="skeleton-bar h-4 w-10/12 mb-2" />
            <div className="skeleton-bar h-4 w-4/5 mb-4" />
            <div className="skeleton-bar h-5 w-32 mb-2" />
            <div className="skeleton-bar h-4 w-full mb-2" />
            <div className="skeleton-bar h-4 w-3/4" />
          </div>
        ) : panel.error ? (
          <div className="panel-error">
            <AlertCircle size={16} />
            <div>
              <p className="panel-error-title">Generation failed</p>
              <p className="panel-error-msg">{panel.error}</p>
            </div>
          </div>
        ) : panel.content ? (
          panel.type === 'c1' ? (
            <ThesysRenderer c1Response={panel.content} />
          ) : (
            <div className="panel-chat-wrap">
              <ChatContent text={panel.content} />
            </div>
          )
        ) : (
          <div className="panel-idle">
            <Loader2 size={22} className="animate-spin opacity-40" />
            <p>Awaiting content…</p>
          </div>
        )}
      </div>

      {/* ── Input footer (optional) ── */}
      {panel.hasInput && (
        <div className="panel-footer">
          <textarea
            ref={textareaRef}
            className="panel-textarea"
            placeholder={
              panel.type === 'c1'
                ? 'Describe the UI you want… (⌘+Enter to submit)'
                : 'Ask the agent anything… (⌘+Enter to submit)'
            }
            value={panel.userPrompt}
            rows={2}
            onChange={(e) => onPromptChange(panel.id, e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="panel-submit-btn"
            disabled={panel.isLoading}
            onClick={() => onSubmit(panel.id)}
            title="Submit (⌘+Enter)"
          >
            {panel.isLoading
              ? <RefreshCw size={13} className="animate-spin" />
              : <SendHorizonal size={13} />
            }
            <span>{panel.isLoading ? 'Generating…' : 'Submit'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  GripVertical,
  RefreshCw,
  X,
  MessageSquare,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  SendHorizonal,
  Save,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatContent from './ChatContent';

const ThesysRenderer = dynamic(() => import('./ThesysRenderer'), { ssr: false });

// ── Panel data type (shared with dashboard.tsx) ────────────────────────────

export interface Panel {
  id: string;
  /** Named panel key used to select a dedicated system prompt (e.g. 'pull-requests') */
  panelKey?: string;
  type: 'c1' | 'chat';
  title: string;
  content: string;
  isLoading: boolean;
  error: string;
  userPrompt: string;
  /** Controls text-input footer visibility (only relevant for chat panels) */
  hasInput: boolean;
}

// ── Props ───────────────────────────────────────────────────────────────────

interface DashboardPanelProps {
  panel: Panel;
  isDragOver: boolean;
  onPromptChange: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleType: (id: string) => void;
  onRefresh: (id: string) => void;
  /** Called when user clicks Save on a C1 panel with interactive elements */
  onSaveInteractive: (id: string, formData: Record<string, string>) => void;
  // HTML5 DnD
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
}

// ── Selectors for form elements ─────────────────────────────────────────────

const INTERACTIVE_SELECTOR = [
  'input',
  'select',
  'textarea',
  '[role="slider"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="switch"]',
  '[role="spinbutton"]',
].join(', ');

// ── Component ───────────────────────────────────────────────────────────────

export default function DashboardPanel({
  panel,
  isDragOver,
  onPromptChange,
  onSubmit,
  onRemove,
  onToggleType,
  onRefresh,
  onSaveInteractive,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: DashboardPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasInteractive, setHasInteractive] = useState(false);

  // ── Detect interactive form elements inside C1 panel content ────────────

  useEffect(() => {
    if (panel.type !== 'c1' || !panel.content || panel.isLoading) {
      setHasInteractive(false);
      return;
    }

    const checkForInteractive = () => {
      const el = contentRef.current;
      if (!el) return;
      const found = el.querySelectorAll(INTERACTIVE_SELECTOR);
      setHasInteractive(found.length > 0);
    };

    // Delayed initial check (C1 SDK renders asynchronously)
    const timer = setTimeout(checkForInteractive, 600);

    // Watch for dynamic DOM changes from the SDK
    const el = contentRef.current;
    let observer: MutationObserver | undefined;
    if (el) {
      observer = new MutationObserver(checkForInteractive);
      observer.observe(el, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [panel.type, panel.content, panel.isLoading]);

  // ── Collect form values from the rendered C1 content ────────────────────

  const handleSave = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const formData: Record<string, string> = {};
    let fieldIndex = 0;

    el.querySelectorAll('input, select, textarea').forEach((element: Element) => {
      const input = element as HTMLInputElement;
      const name =
        input.name ||
        input.id ||
        input.getAttribute('aria-label') ||
        `field-${++fieldIndex}`;

      if (input.type === 'checkbox' || input.type === 'radio') {
        formData[name] = String(input.checked);
      } else {
        formData[name] = input.value;
      }
    });

    onSaveInteractive(panel.id, formData);
  }, [panel.id, onSaveInteractive]);

  // ── Chat text-input keyboard shortcut ────────────────────────────────────

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

        {/* Controls (hover-reveal) */}
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
      <div className="panel-content" ref={contentRef}>
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

      {/* ── Interactive save footer (C1 panels with detected form elements) ── */}
      {panel.type === 'c1' && hasInteractive && !panel.isLoading && (
        <div className="panel-interactive-footer">
          <button
            className="panel-save-btn"
            onClick={handleSave}
            title="Save and submit form values to the agent"
          >
            <Save size={13} />
            <span>Save &amp; Submit</span>
          </button>
        </div>
      )}

      {/* ── Text-input footer (chat panels only) ── */}
      {panel.type === 'chat' && panel.hasInput && (
        <div className="panel-footer">
          <textarea
            ref={textareaRef}
            className="panel-textarea"
            placeholder="Ask the agent anything… (⌘+Enter to submit)"
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

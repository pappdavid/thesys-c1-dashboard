'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Load the Thesys renderer client-side only — it uses browser APIs
const ThesysRenderer = dynamic(() => import('./ThesysRenderer'), { ssr: false });

// Background used for states where the SDK isn't rendering (skeleton / error / idle)
const FALLBACK_BG: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '12px',
  minHeight: '240px',
};

interface C1ComponentProps {
  html: string;
  isLoading?: boolean;
  error?: string;
  /** Called when the user clicks the hover-reveal refresh button */
  onRefresh?: () => void;
}

export default function C1Component({
  html,
  isLoading = false,
  error,
  onRefresh,
}: C1ComponentProps) {
  const [c1Response, setC1Response] = useState(html);

  useEffect(() => {
    setC1Response(html);
  }, [html]);

  /* ── States that need the fallback dark card background ── */
  const needsFallback = isLoading || !!error || !c1Response;

  return (
    <div
      className="c1-content-card"
      style={needsFallback ? FALLBACK_BG : undefined}
    >
      {/* Refresh button — icon-only, reveals on card hover */}
      {onRefresh && (
        <button
          className="c1-refresh-overlay"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh panel"
        >
          <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
        </button>
      )}

      {isLoading ? (
        /* Skeleton loader */
        <div className="space-y-2.5 p-4 pt-5">
          <div className="skeleton-bar h-3 w-full" />
          <div className="skeleton-bar h-3 w-11/12" />
          <div className="skeleton-bar h-3 w-10/12" />
          <div className="mt-3 skeleton-bar h-3 w-full" />
          <div className="skeleton-bar h-3 w-9/12" />
          <div className="skeleton-bar h-3 w-11/12" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="skeleton-bar h-8" />
            <div className="skeleton-bar h-8" />
          </div>
        </div>
      ) : error ? (
        /* Error state */
        <div className="p-4">
          <div
            className="flex gap-2.5 rounded-lg border p-3"
            style={{
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.07)',
            }}
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
            <div>
              <p className="mb-0.5 text-xs font-semibold" style={{ color: '#fca5a5' }}>
                Generation failed
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#fca5a5', opacity: 0.8 }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : c1Response ? (
        /* Dark-themed C1 component spec — SDK surface is the visual card */
        <ThesysRenderer c1Response={c1Response} />
      ) : (
        /* Idle / pre-load */
        <div
          className="flex items-center justify-center py-16"
          style={{ color: 'var(--text-muted)' }}
        >
          <RefreshCw size={14} className="animate-spin opacity-30" />
        </div>
      )}
    </div>
  );
}

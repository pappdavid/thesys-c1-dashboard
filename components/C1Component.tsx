'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Load the Thesys renderer client-side only — it uses browser APIs
const ThesysRenderer = dynamic(() => import('./ThesysRenderer'), { ssr: false });

interface C1ComponentProps {
  html: string;
  isLoading?: boolean;
  error?: string;
}

export default function C1Component({ html, isLoading = false, error }: C1ComponentProps) {
  const [c1Response, setC1Response] = useState(html);

  useEffect(() => {
    setC1Response(html);
  }, [html]);

  return (
    <div className="c1-content-card">
      {isLoading ? (
        /* Skeleton loader */
        <div className="space-y-3 p-6">
          <div className="skeleton-bar h-7 w-44" />
          <div className="skeleton-bar h-4 w-full" />
          <div className="skeleton-bar h-4 w-11/12" />
          <div className="skeleton-bar h-4 w-4/5" />
          <div className="mt-6 skeleton-bar h-5 w-36" />
          <div className="skeleton-bar h-4 w-full" />
          <div className="skeleton-bar h-4 w-3/4" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="skeleton-bar h-16" />
            <div className="skeleton-bar h-16" />
            <div className="skeleton-bar h-16" />
          </div>
        </div>
      ) : error ? (
        /* Error state */
        <div className="p-6">
          <div
            className="flex gap-3 rounded-lg border p-4"
            style={{
              borderColor: 'rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.07)',
            }}
          >
            <AlertCircle size={17} className="mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
            <div>
              <p className="mb-1 text-sm font-semibold" style={{ color: '#fca5a5' }}>
                Generation failed
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#fca5a5', opacity: 0.8 }}>
                {error}
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                Verify your API key at{' '}
                <a
                  href="https://console.thesys.dev/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)' }}
                >
                  console.thesys.dev/keys
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : c1Response ? (
        /* Rendered C1 component spec via Thesys SDK */
        <div className="p-4">
          <ThesysRenderer c1Response={c1Response} />
        </div>
      ) : (
        /* Idle state */
        <div
          className="flex flex-col items-center justify-center gap-3 py-20"
          style={{ color: 'var(--text-muted)' }}
        >
          <Loader2 size={26} className="animate-spin opacity-40" />
          <p className="text-sm">Initializing…</p>
        </div>
      )}
    </div>
  );
}

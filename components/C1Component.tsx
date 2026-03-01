'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader, Zap } from 'lucide-react';
import clsx from 'clsx';

interface C1ComponentProps {
  html: string;
  isLoading?: boolean;
  error?: string;
}

export default function C1Component({
  html,
  isLoading = false,
  error,
}: C1ComponentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState(html);

  useEffect(() => {
    setSanitizedHtml(html);
  }, [html]);

  // Card Component
  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={clsx(
        'rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );

  // CardHeader Component
  const CardHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="border-b border-slate-700/50 px-6 py-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
      {children}
    </div>
  );

  // CardTitle Component
  const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      {children}
    </h2>
  );

  // CardContent Component
  const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={clsx('px-6 py-4', className)}>{children}</div>
  );

  // Alert Component (Error State)
  const Alert = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'destructive' }) => (
    <div
      className={clsx(
        'rounded-lg border px-4 py-3 flex gap-3 items-start',
        variant === 'destructive'
          ? 'border-red-500/50 bg-red-500/10 text-red-200'
          : 'border-blue-500/50 bg-blue-500/10 text-blue-200'
      )}
    >
      {children}
    </div>
  );

  // Skeleton Component (Loading State)
  const Skeleton = () => (
    <div className="space-y-3">
      <div className="h-8 w-24 rounded-lg bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-pulse" />
      <div className="h-6 w-full rounded-lg bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-pulse" />
      <div className="h-6 w-5/6 rounded-lg bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-pulse" />
    </div>
  );

  // Button Component
  const Button = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
    >
      <Zap size={16} />
      {children}
    </button>
  );

  return (
    <div className="space-y-4 w-full">
      {/* Customize Dashboard Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customize Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              e.g., Show PRs from team, Add deployment metrics...
            </p>
            <Button>Generate</Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Card with Error/Loading States */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">API Error</h3>
                <p className="text-sm opacity-90">{error}</p>
                <p className="text-xs opacity-75 mt-2">
                  Please verify your API key and try again. Visit{' '}
                  <a
                    href="https://console.thesys.dev/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-100"
                  >
                    console.thesys.dev/keys
                  </a>
                  {' '}to manage your keys.
                </p>
              </div>
            </Alert>
          ) : sanitizedHtml ? (
            <div
              className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-blue-300 prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Loader size={32} className="mx-auto mb-2 animate-spin opacity-50" />
              <p>Waiting for content...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

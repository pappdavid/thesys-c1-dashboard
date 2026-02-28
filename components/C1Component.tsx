'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Generating dashboard...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Powered by Thesys C1</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">API Error</h3>
            <p className="text-sm text-red-700 dark:text-red-400 font-mono">{error}</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-3">Please verify your API key and try again. Visit console.thesys.dev/keys to manage your keys.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="c1-component space-y-6">
      <div
        className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:dark:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:dark:text-slate-100 [&_p]:text-slate-600 [&_p]:dark:text-slate-400 [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:font-medium [&_button]:transition-colors [&_button]:bg-blue-500 [&_button]:hover:bg-blue-600 [&_button]:text-white [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:dark:border-slate-600 [&_input]:px-3 [&_input]:py-2 [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:bg-slate-50 [&_th]:dark:bg-slate-800 [&_th]:p-2 [&_td]:p-2 [&_td]:border-b [&_td]:border-slate-200 [&_td]:dark:border-slate-700"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}

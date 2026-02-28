import React, { useEffect, useState } from 'react';

interface C1ComponentProps {
  html: string;
  isLoading?: boolean;
  error?: string;
}

export default function C1Component({ html, isLoading = false, error }: C1ComponentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState(html);

  useEffect(() => {
    setSanitizedHtml(html);
  }, [html]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-400"></div>
          <p className="mt-4 text-slate-400">Generating dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-300">
        <h3 className="font-semibold">Error</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="c1-component space-y-6">
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}

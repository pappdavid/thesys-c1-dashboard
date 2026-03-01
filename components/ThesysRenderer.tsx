import React from 'react';
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk';

interface Props {
  c1Response: string;
}

export default function ThesysRenderer({ c1Response }: Props) {
  return (
    <ThemeProvider>
      <C1Component c1Response={c1Response} isStreaming={false} />
    </ThemeProvider>
  );
}

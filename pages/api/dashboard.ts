import type { NextApiRequest, NextApiResponse } from 'next';
import { callThesysC1Panel } from '@/lib/thesys-client';

type ResponseData = {
  html?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { panelId = 'pull-requests', userContext = '' } = req.body;

    const html = await callThesysC1Panel(panelId, userContext);

    res.status(200).json({ html });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate panel';
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: message });
  }
}

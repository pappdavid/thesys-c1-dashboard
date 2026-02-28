import type { NextApiRequest, NextApiResponse } from 'next';
import { callThesysC1 } from '@/lib/thesys-client';

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
    const { userPrompt = '' } = req.body;

    const html = await callThesysC1(userPrompt);

    res.status(200).json({ html });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate dashboard' });
  }
}

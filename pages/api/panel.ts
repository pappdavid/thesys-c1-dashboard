import type { NextApiRequest, NextApiResponse } from 'next';
import { callThesysPanel, DashboardCommand } from '@/lib/thesys-client';

type PanelInfo = { id: string; type: string; title: string };

type ResponseData = {
  content?: string;
  commands?: DashboardCommand[];
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
    const {
      prompt = '',
      panelType = 'c1',
      panels = [] as PanelInfo[],
    } = req.body;

    const result = await callThesysPanel({ userPrompt: prompt, panelType, panels });

    res.status(200).json({ content: result.content, commands: result.commands });
  } catch (error: any) {
    console.error('Panel API error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
}

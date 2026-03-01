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
      panelId,
      prompt = '',
      panelType = 'c1',
      panels = [] as PanelInfo[],
    } = req.body;

    const result = await callThesysPanel({
      panelId,
      userPrompt: prompt || undefined,
      panelType,
      panels,
    });

    res.status(200).json({ content: result.content, commands: result.commands });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate content';
    console.error('Panel API error:', error);
    res.status(500).json({ error: message });
  }
}

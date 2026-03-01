import OpenAI from 'openai';

export const DEVELOPER_DASHBOARD_SYSTEM_PROMPT = `You are a Developer Operations Dashboard Agent. Your role is to generate a comprehensive developer dashboard UI that displays:

1. **Overview Panel**: Key metrics (deployment status, system health, incident count)
2. **Pull Requests**: Active PRs with status, author, and merge readiness
3. **CI/CD Pipeline**: Build status, test coverage, deployment history
4. **Issues & Bugs**: Open issues, priorities, assignments
5. **System Logs**: Recent errors, warnings, and info logs
6. **Team Activity**: Recent commits, deployments, and events

Generate a clean, interactive dashboard UI with cards, tables, and charts. Return HTML/CSS/JavaScript that can be rendered in a web application.

Always prioritize:
- Clear visual hierarchy
- Real-time status indicators
- Quick action buttons
- Responsive design
- Dark theme (slate/blue color scheme)

If the user provides specific context (repo name, team, metrics), incorporate that into the dashboard layout.`;

// Lazy singleton — created on first request so the module can be imported
// safely at build/startup time even when the env var isn't present yet.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.THESYS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'THESYS_API_KEY is not set. Add it to .env.local (local dev) or your Vercel environment variables.'
    );
  }

  if (!_client) {
    _client = new OpenAI({
      apiKey,
      baseURL: 'https://api.thesys.dev/v1/embed',
    });
  }

  return _client;
}

export async function callThesysC1(userPrompt: string): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'c1/anthropic/claude-sonnet-4-5',
    messages: [
      {
        role: 'system',
        content: DEVELOPER_DASHBOARD_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt || 'Generate a default developer dashboard with all panels.',
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from Thesys C1');
  }

  return content;
}

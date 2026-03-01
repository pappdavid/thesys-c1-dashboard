import OpenAI from 'openai';

// ── System prompts ──────────────────────────────────────────────────────────

export const C1_SYSTEM_PROMPT = `You are a Developer Operations Dashboard Agent. Your role is to generate a comprehensive developer dashboard UI that displays:

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

const CHAT_SYSTEM_PROMPT = `You are an expert developer operations assistant embedded in a live dashboard.
Respond with clear, concise, and well-structured markdown text.
Do NOT generate HTML, JSON component specs, or UI markup — only plain markdown.
Be direct, technical, and helpful. Use bullet points, code blocks, and headers where appropriate.`;

const COMMAND_DELIMITER_START = '__DASHBOARD_COMMANDS_START__';
const COMMAND_DELIMITER_END = '__DASHBOARD_COMMANDS_END__';

// ── Dashboard command types ─────────────────────────────────────────────────

export type DashboardCommand =
  | { type: 'reorder'; order: string[] }
  | { type: 'update'; id: string; content: string; title?: string }
  | { type: 'add_panel'; panel: { type: 'c1' | 'chat'; title: string; hasInput?: boolean } }
  | { type: 'remove_panel'; id: string }
  | { type: 'set_input'; id: string; hasInput: boolean }
  | { type: 'set_type'; id: string; panelType: 'c1' | 'chat' }
  | { type: 'set_title'; id: string; title: string };

function parseCommands(raw: string): { content: string; commands: DashboardCommand[] } {
  const startIdx = raw.indexOf(COMMAND_DELIMITER_START);
  const endIdx = raw.indexOf(COMMAND_DELIMITER_END);

  if (startIdx === -1 || endIdx === -1) {
    return { content: raw, commands: [] };
  }

  const content = raw.substring(0, startIdx).trim();
  const jsonStr = raw.substring(startIdx + COMMAND_DELIMITER_START.length, endIdx).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const commands: DashboardCommand[] = Array.isArray(parsed) ? parsed : [parsed];
    return { content, commands };
  } catch {
    return { content: raw, commands: [] };
  }
}

// ── OpenAI client singleton ─────────────────────────────────────────────────

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

// ── Public API ──────────────────────────────────────────────────────────────

/** Original call — C1 rich UI component spec */
export async function callThesysC1(userPrompt: string): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'c1/anthropic/claude-sonnet-4/v-20251230',
    messages: [
      { role: 'system', content: C1_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt || 'Generate a default developer dashboard with all panels.' },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content returned from Thesys C1');
  return content;
}

/** Panel call — supports both C1 rich UI and plain-text chat panels, plus dashboard commands */
export async function callThesysPanel(opts: {
  userPrompt: string;
  panelType: 'c1' | 'chat';
  panels: Array<{ id: string; type: string; title: string }>;
}): Promise<{ content: string; commands: DashboardCommand[] }> {
  const { userPrompt, panelType, panels } = opts;
  const client = getClient();

  const panelContext = panels.map(p => `  - id="${p.id}" type="${p.type}" title="${p.title}"`).join('\n');

  const commandInstructions = `

---
DASHBOARD CONTROL PROTOCOL
You can modify this dashboard by appending commands at the very end of your response.
Current panels:
${panelContext}

To issue commands append EXACTLY this block AFTER your main response:
${COMMAND_DELIMITER_START}
[
  { "type": "reorder", "order": ["id1", "id2", "id3"] },
  { "type": "update", "id": "panelId", "content": "..." },
  { "type": "add_panel", "panel": { "type": "chat", "title": "...", "hasInput": true } },
  { "type": "remove_panel", "id": "panelId" },
  { "type": "set_input", "id": "panelId", "hasInput": true },
  { "type": "set_title", "id": "panelId", "title": "New Title" }
]
${COMMAND_DELIMITER_END}

Include only the commands you actually want to execute (the array can contain one or many).
`;

  const systemPrompt =
    (panelType === 'c1' ? C1_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT) + commandInstructions;

  const response = await client.chat.completions.create({
    model: 'c1/anthropic/claude-sonnet-4/v-20251230',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt || (panelType === 'c1' ? 'Generate a developer dashboard.' : 'Hello! What can you help me with?') },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No content returned from Thesys C1');

  return parseCommands(raw);
}

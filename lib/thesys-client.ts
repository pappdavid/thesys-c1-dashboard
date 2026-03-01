import OpenAI from 'openai';

// ── Per-panel system prompts (named panels) ─────────────────────────────────

// ── Interactive elements note (appended to every named panel prompt) ─────────

const INTERACTIVE_ELEMENTS_NOTE = `
You may include interactive HTML form elements to let users configure or filter data:
- Checkboxes (<input type="checkbox" name="...">) for toggling options
- Range sliders (<input type="range" name="..." min="0" max="100">) for numeric values
- Select dropdowns (<select name="..."><option>...</option></select>) for picking from a list
- Text inputs (<input type="text" name="..." placeholder="...">) for search/filter
- Buttons (<button name="action" value="...">) for triggering actions
Always use descriptive "name" attributes on form elements so their values can be collected.
When present, a "Save & Submit" button will automatically appear below the panel.
Only add interactive elements when they add clear value — do not force them into every panel.`;

export const PANEL_SYSTEM_PROMPTS: Record<string, string> = {
  'pull-requests': `You are a Pull Requests dashboard panel. Generate a compact, scannable UI showing:
- 4–6 open pull requests, each with: title, author name, target branch, age (e.g. "2d"), status badge (Draft / Review Needed / Approved / Conflicts), and comment count
- Color-coded status badges: gray=Draft, amber=Review Needed, green=Approved, red=Conflicts
- A small summary line at the top: total open, how many need review, how many are approved
Dark theme (background #16213E, borders rgba(255,255,255,0.07)). Keep it tight and information-dense.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: checkboxes to select PRs for bulk review, a dropdown to filter by status.`,

  'cicd-pipeline': `You are a CI/CD Pipeline dashboard panel. Generate a compact UI showing:
- Last 6 pipeline runs in a table/list: commit message (truncated), branch, status icon (✓ pass / ✗ fail / ⟳ running), duration, triggered-by
- A mini test coverage bar at the top (e.g. "Test coverage: 94.2% ████████░░")
- Build success rate for the last 7 days (e.g. "Build health: 11/12 passing")
Status colors: green=passing, red=failing, amber=running. Dark theme. Compact.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: a dropdown to filter by branch, a checkbox to show only failed runs.`,

  'issues': `You are an Issues & Bugs dashboard panel. Generate a compact UI showing:
- 5–7 open issues, each with: title, priority badge (Critical/High/Medium/Low), assignee, one label chip, and age
- Priority color coding: red=Critical, orange=High, yellow=Medium, blue=Low
- Summary counts by priority at the very top (e.g. "2 critical · 4 high · 8 medium · 3 low")
Dark theme. Keep rows tight and scannable.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: a priority filter dropdown, checkboxes to select issues for bulk assignment.`,

  'system-logs': `You are a System Logs dashboard panel. Generate a terminal-style compact UI showing:
- 8–10 log lines with: timestamp (HH:MM:SS), level badge (ERROR/WARN/INFO), service name (e.g. "api", "worker"), and log message (truncated to one line)
- Color per level: red=ERROR, amber=WARN, gray/dim=INFO
- Log summary at the top: e.g. "Last hour: 2 errors · 5 warnings · 24 info"
Monospace font aesthetic, dark terminal theme. Keep it dense.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: checkboxes or a multi-select for log level filtering, a text input for searching.`,

  'team-activity': `You are a Team Activity dashboard panel. Generate a compact activity feed showing:
- 6–8 recent events, each with: actor name (with avatar placeholder circle), action verb, target name, and relative timestamp
- Event types to include: pushed commit, opened PR, merged PR, deployed to [env], closed issue, commented on issue
- Subtle color-coded action verbs (e.g. green=merged/deployed, blue=opened, purple=commented)
Dark theme. Feed-style layout, newest first.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: a dropdown to filter by event type, a date-range selector.`,

  'deployments': `You are a Deployments dashboard panel. Generate a compact UI with two sections:
1. Environment Status (top): 3 environment cards — Production, Staging, Preview — each showing: status indicator (Live/Deploying/Failed), last deployed relative time, deployed-by name, short commit hash
2. Recent Deploys (bottom): last 4 deploy entries in a compact list: environment, version, who, when, duration
Dark theme, green/red/amber status colors.
${INTERACTIVE_ELEMENTS_NOTE}
Consider: an environment filter dropdown, a rollback button per deployment.`,
};

// ── Generic system prompts ──────────────────────────────────────────────────

const C1_GENERIC_PROMPT = `You are a Developer Operations Dashboard Agent. Generate a compact, interactive developer dashboard panel.
Include realistic sample data, clear visual hierarchy, status indicators, and dark theme styling (background #16213E, borders rgba(255,255,255,0.07)).
${INTERACTIVE_ELEMENTS_NOTE}`;

const CHAT_SYSTEM_PROMPT = `You are an expert developer operations assistant embedded in a live dashboard.
Respond with clear, concise, and well-structured markdown text.
Do NOT generate HTML, JSON component specs, or UI markup — only plain markdown.
Be direct, technical, and helpful. Use bullet points, code blocks, and headers where appropriate.`;

// ── Dashboard command types ─────────────────────────────────────────────────

export type DashboardCommand =
  | { type: 'reorder'; order: string[] }
  | { type: 'update'; id: string; content: string; title?: string }
  | { type: 'add_panel'; panel: { type: 'c1' | 'chat'; title: string; hasInput?: boolean } }
  | { type: 'remove_panel'; id: string }
  | { type: 'set_input'; id: string; hasInput: boolean }
  | { type: 'set_type'; id: string; panelType: 'c1' | 'chat' }
  | { type: 'set_title'; id: string; title: string };

const COMMAND_DELIMITER_START = '__DASHBOARD_COMMANDS_START__';
const COMMAND_DELIMITER_END = '__DASHBOARD_COMMANDS_END__';

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

/**
 * Unified panel call supporting named panel prompts, custom prompts, both panel
 * types (C1 rich UI and plain-text chat), and dashboard layout commands.
 *
 * - If panelId matches a named panel, uses its dedicated system prompt.
 * - Otherwise uses a generic C1 or chat prompt based on panelType.
 * - Always appends the dashboard control protocol so the agent can issue commands.
 */
export async function callThesysPanel(opts: {
  panelId?: string;
  userPrompt?: string;
  panelType: 'c1' | 'chat';
  panels: Array<{ id: string; type: string; title: string }>;
}): Promise<{ content: string; commands: DashboardCommand[] }> {
  const { panelId, userPrompt, panelType, panels } = opts;
  const client = getClient();

  // Choose base system prompt
  let basePrompt: string;
  if (panelId && PANEL_SYSTEM_PROMPTS[panelId]) {
    basePrompt = PANEL_SYSTEM_PROMPTS[panelId];
  } else {
    basePrompt = panelType === 'chat' ? CHAT_SYSTEM_PROMPT : C1_GENERIC_PROMPT;
  }

  // Append dashboard control protocol
  const panelContext = panels.length
    ? panels.map(p => `  - id="${p.id}" type="${p.type}" title="${p.title}"`).join('\n')
    : '  (no panels currently)';

  const systemPrompt = `${basePrompt}

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

Include only the commands you actually want to execute.`;

  const effectiveUserPrompt =
    userPrompt ||
    (panelId
      ? 'Generate this panel with realistic sample data.'
      : panelType === 'chat'
        ? 'Introduce yourself and explain how you can help manage this dashboard.'
        : 'Generate a developer dashboard panel.');

  const response = await client.chat.completions.create({
    model: 'c1/anthropic/claude-sonnet-4/v-20251230',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: effectiveUserPrompt },
    ],
    temperature: 0.7,
    max_tokens: panelId ? 2000 : 4000,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('No content returned from Thesys C1');

  return parseCommands(raw);
}

/**
 * Legacy single-panel call (kept for /api/dashboard backward compat).
 */
export async function callThesysC1Panel(
  panelId: string,
  userContext = ''
): Promise<string> {
  const result = await callThesysPanel({
    panelId,
    userPrompt: userContext || undefined,
    panelType: 'c1',
    panels: [],
  });
  return result.content;
}

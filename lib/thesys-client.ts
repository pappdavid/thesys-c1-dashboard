import OpenAI from 'openai';

// ── Per-panel system prompts ────────────────────────────────────────────────

const PANEL_SYSTEM_PROMPTS: Record<string, string> = {
  'pull-requests': `You are a Pull Requests dashboard panel. Generate a compact, scannable UI showing:
- 4–6 open pull requests, each with: title, author name, target branch, age (e.g. "2d"), status badge (Draft / Review Needed / Approved / Conflicts), and comment count
- Color-coded status badges: gray=Draft, amber=Review Needed, green=Approved, red=Conflicts
- A small summary line at the top: total open, how many need review, how many are approved
Dark theme (background #16213E, borders rgba(255,255,255,0.07)). Keep it tight and information-dense.`,

  'cicd-pipeline': `You are a CI/CD Pipeline dashboard panel. Generate a compact UI showing:
- Last 6 pipeline runs in a table/list: commit message (truncated), branch, status icon (✓ pass / ✗ fail / ⟳ running), duration, triggered-by
- A mini test coverage bar at the top (e.g. "Test coverage: 94.2% ████████░░")
- Build success rate for the last 7 days (e.g. "Build health: 11/12 passing")
Status colors: green=passing, red=failing, amber=running. Dark theme. Compact.`,

  'issues': `You are an Issues & Bugs dashboard panel. Generate a compact UI showing:
- 5–7 open issues, each with: title, priority badge (Critical/High/Medium/Low), assignee, one label chip, and age
- Priority color coding: red=Critical, orange=High, yellow=Medium, blue=Low
- Summary counts by priority at the very top (e.g. "2 critical · 4 high · 8 medium · 3 low")
Dark theme. Keep rows tight and scannable.`,

  'system-logs': `You are a System Logs dashboard panel. Generate a terminal-style compact UI showing:
- 8–10 log lines with: timestamp (HH:MM:SS), level badge (ERROR/WARN/INFO), service name (e.g. "api", "worker"), and log message (truncated to one line)
- Color per level: red=ERROR, amber=WARN, gray/dim=INFO
- Log summary at the top: e.g. "Last hour: 2 errors · 5 warnings · 24 info"
Monospace font aesthetic, dark terminal theme. Keep it dense.`,

  'team-activity': `You are a Team Activity dashboard panel. Generate a compact activity feed showing:
- 6–8 recent events, each with: actor name (with avatar placeholder circle), action verb, target name, and relative timestamp
- Event types to include: pushed commit, opened PR, merged PR, deployed to [env], closed issue, commented on issue
- Subtle color-coded action verbs (e.g. green=merged/deployed, blue=opened, purple=commented)
Dark theme. Feed-style layout, newest first.`,

  'deployments': `You are a Deployments dashboard panel. Generate a compact UI with two sections:
1. Environment Status (top): 3 environment cards — Production, Staging, Preview — each showing: status indicator (Live/Deploying/Failed), last deployed relative time, deployed-by name, short commit hash
2. Recent Deploys (bottom): last 4 deploy entries in a compact list: environment, version, who, when, duration
Dark theme, green/red/amber status colors.`,
};

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
 * Generate a single panel's content via Thesys C1.
 * @param panelId      One of the panel IDs defined in PANEL_SYSTEM_PROMPTS
 * @param userContext  Optional extra context supplied by the user
 */
export async function callThesysC1Panel(
  panelId: string,
  userContext = ''
): Promise<string> {
  const systemPrompt =
    PANEL_SYSTEM_PROMPTS[panelId] ??
    'Generate a compact developer dashboard panel with realistic sample data. Dark theme.';

  const userPrompt = userContext
    ? `Generate this panel. Additional context: ${userContext}`
    : 'Generate this panel with realistic sample data.';

  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'c1/anthropic/claude-sonnet-4/v-20251230',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content returned from Thesys C1');

  return content;
}

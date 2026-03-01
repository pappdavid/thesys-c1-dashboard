/**
 * Client-safe panel metadata — no server-only imports.
 * System prompts live in lib/thesys-client.ts (server-only).
 */

export interface PanelMeta {
  id: string;
  title: string;
}

export const PANELS: PanelMeta[] = [
  { id: 'pull-requests',  title: 'Pull Requests'  },
  { id: 'cicd-pipeline',  title: 'CI/CD Pipeline' },
  { id: 'issues',         title: 'Issues & Bugs'  },
  { id: 'system-logs',    title: 'System Logs'    },
  { id: 'team-activity',  title: 'Team Activity'  },
  { id: 'deployments',    title: 'Deployments'    },
];

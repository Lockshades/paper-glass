import { useState, useEffect } from 'react';
import { getToken } from '../lib/api';

const BASE = import.meta.env.BASE_URL;

interface Issue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: { name: string; color: string }[];
  pull_request?: object;
  user: { login: string };
}

interface RepoInfo {
  exists: boolean;
  owner?: string;
  repo?: string;
  fullName?: string;
  htmlUrl?: string;
  openIssues?: number;
  private?: boolean;
  error?: string;
}

function authHeaders(): Record<string, string> {
  const tok = getToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}api/admin${path}`, { ...init, headers: { ...authHeaders(), ...(init?.headers as Record<string, string> || {}) } });
}

export function GitHubIssues() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [issues,   setIssues]   = useState<Issue[]>([]);
  const [filter,   setFilter]   = useState<'open' | 'closed' | 'all'>('open');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // New issue form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody,  setNewBody]  = useState('');
  const [creating, setCreating] = useState(false);

  async function loadRepo() {
    try {
      const r = await apiFetch('/github/info');
      const data = await r.json() as RepoInfo;
      setRepoInfo(data);
      return data;
    } catch {
      setRepoInfo({ exists: false, error: 'Could not reach GitHub API' });
      return null;
    }
  }

  async function loadIssues(state: 'open' | 'closed' | 'all') {
    setLoading(true);
    setError('');
    try {
      const r = await apiFetch(`/github/issues?state=${state}`);
      if (!r.ok) {
        const d = await r.json() as { error?: string };
        setError(d.error || 'Failed to load issues');
        setIssues([]);
        return;
      }
      const d = await r.json() as { issues: Issue[] };
      // Filter out pull requests
      setIssues((d.issues || []).filter(i => !i.pull_request));
    } catch {
      setError('Network error loading issues');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRepo().then(() => loadIssues('open'));
  }, []);

  async function handleFilterChange(f: 'open' | 'closed' | 'all') {
    setFilter(f);
    await loadIssues(f);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const r = await apiFetch('/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() }),
      });
      if (!r.ok) {
        const d = await r.json() as { error?: string };
        setError(d.error || 'Failed to create issue');
        return;
      }
      setNewTitle('');
      setNewBody('');
      setShowForm(false);
      await loadIssues(filter);
    } catch {
      setError('Network error creating issue');
    } finally {
      setCreating(false);
    }
  }

  const openCount   = issues.filter(i => i.state === 'open').length;
  const closedCount = issues.filter(i => i.state === 'closed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">GitHub Issues</h2>
            <span className="badge-live">Live</span>
          </div>
          {repoInfo?.fullName && (
            <a
              href={repoInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:underline mt-0.5 inline-block mono"
            >
              {repoInfo.fullName}
            </a>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          + New Issue
        </button>
      </div>

      {/* Repo not found */}
      {repoInfo && !repoInfo.exists && (
        <div className="card border-amber-500/30 bg-amber-500/8">
          <p className="text-sm text-amber-400 font-medium">Repository not found</p>
          <p className="text-xs text-muted-foreground mt-1">
            The repo <span className="mono">{repoInfo.owner}/{repoInfo.repo}</span> doesn't exist yet or isn't accessible.
            Push your code to GitHub first.
          </p>
        </div>
      )}

      {/* New issue form */}
      {showForm && (
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-foreground">Create Issue</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Issue title"
              className="w-full px-3 py-2 rounded-md text-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            <textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              placeholder="Description (optional, supports Markdown)"
              rows={4}
              className="w-full px-3 py-2 rounded-md text-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Issue'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">{error}</div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-3">
        {(['open', 'closed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              filter === f
                ? 'bg-indigo-500/15 text-indigo-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filter === 'open' ? openCount : filter === 'closed' ? closedCount : issues.length} issues
          </span>
        )}
      </div>

      {/* Issues list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-medium text-foreground">No {filter !== 'all' ? filter : ''} issues</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === 'open' ? 'Everything is resolved.' : 'No closed issues yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map(issue => (
            <IssueRow key={issue.number} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const date = new Date(issue.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const isOpen = issue.state === 'open';

  return (
    <div className="card hover:border-indigo-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full border-2 ${isOpen ? 'border-green-500 bg-green-500/20' : 'border-muted bg-muted/20'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:text-indigo-400 transition-colors"
            >
              {issue.title}
            </a>
            <span className="text-xs mono text-muted-foreground shrink-0">#{issue.number}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {issue.labels.map(label => (
              <span
                key={label.name}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: `#${label.color}22`, color: `#${label.color}`, border: `1px solid #${label.color}44` }}
              >
                {label.name}
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground">
              Opened {date} by {issue.user.login}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

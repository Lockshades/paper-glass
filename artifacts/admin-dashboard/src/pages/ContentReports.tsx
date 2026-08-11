import { useState, useEffect } from 'react';
import { fetchFlags, resolveFlag, FlagRecord } from '../lib/api';

export function ContentReports() {
  const [flags, setFlags] = useState<FlagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchFlags();
      setFlags(data);
    } catch {
      setError('Failed to load flagged questions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleResolve(id: string) {
    setResolving(id);
    try {
      await resolveFlag(id);
      await load();
    } catch {
      setError('Failed to resolve flag');
    } finally {
      setResolving(null);
    }
  }

  const pending  = flags.filter(f => !f.resolved);
  const resolved = flags.filter(f => f.resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Content Reports</h2>
            <span className="badge-live">Live</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Questions flagged by students for review</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity">
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-sm text-muted-foreground">Loading flags...</p>
        </div>
      ) : flags.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-2">&#10003;</p>
          <p className="text-sm font-medium text-green-400">Question bank is clean</p>
          <p className="text-xs text-muted-foreground mt-1">No flagged content to review</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="card space-y-0 divide-y divide-border/50">
              <div className="flex items-center justify-between pb-3">
                <p className="text-sm font-semibold text-foreground">Pending Review</p>
                <span className="text-xs mono text-amber-400">{pending.length} flag{pending.length !== 1 ? 's' : ''}</span>
              </div>
              {pending.map(f => (
                <FlagRow key={f.id} flag={f} onResolve={handleResolve} resolving={resolving} />
              ))}
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div className="card space-y-0 divide-y divide-border/50">
              <div className="flex items-center justify-between pb-3">
                <p className="text-sm font-semibold text-muted-foreground">Resolved</p>
                <span className="text-xs mono text-green-400">{resolved.length}</span>
              </div>
              {resolved.map(f => (
                <FlagRow key={f.id} flag={f} onResolve={handleResolve} resolving={resolving} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FlagRow({ flag, onResolve, resolving }: { flag: FlagRecord; onResolve: (id: string) => void; resolving: string | null }) {
  const date = new Date(flag.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  const resolvedDate = flag.resolvedAt ? new Date(flag.resolvedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : null;

  return (
    <div className="py-3 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs mono text-muted-foreground">Q#{flag.questionId}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{flag.subject}</span>
            {flag.resolved ? (
              <span className="text-xs text-green-400">Resolved {resolvedDate}</span>
            ) : (
              <span className="text-xs text-amber-400">Pending</span>
            )}
          </div>
          {flag.questionText && (
            <p className="text-xs text-foreground truncate max-w-md" title={flag.questionText}>
              {flag.questionText}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-foreground font-medium">Reason:</span> {flag.reason}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Reported: {date}</p>
        </div>
        {!flag.resolved && (
          <button
            onClick={() => onResolve(flag.id)}
            disabled={resolving === flag.id}
            className="shrink-0 px-3 py-1 text-xs font-medium rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
          >
            {resolving === flag.id ? 'Resolving...' : 'Resolve'}
          </button>
        )}
      </div>
    </div>
  );
}

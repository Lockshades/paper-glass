import { useState, useEffect, useCallback } from 'react';
import {
  adminAuth, fetchMetrics, getToken, setToken, clearToken,
  AdminMetrics,
} from './lib/api';
import { Overview }        from './pages/Overview';
import { AiCosts }         from './pages/AiCosts';
import { SystemHealth }    from './pages/SystemHealth';
import { StudentActivity } from './pages/StudentActivity';
import { Growth }          from './pages/Growth';
import { ContentReports }  from './pages/ContentReports';
import { GitHubIssues }    from './pages/GitHubIssues';

// ── Nav config ───────────────────────────────────────────────────────────────

type Section = 'overview' | 'ai-costs' | 'health' | 'students' | 'growth' | 'reports' | 'github';

const NAV: { id: Section; label: string; demo?: boolean; icon: string }[] = [
  { id: 'overview',  label: 'Overview',           icon: '◈' },
  { id: 'ai-costs',  label: 'AI Costs',           icon: '◎' },
  { id: 'health',    label: 'System Health',      icon: '◉' },
  { id: 'students',  label: 'Student Activity',   icon: '◇', demo: true },
  { id: 'growth',    label: 'Growth & Revenue',   icon: '◈', demo: true },
  { id: 'reports',   label: 'Content Reports',    icon: '⚐' },
  { id: 'github',    label: 'GitHub Issues',      icon: '⑂' },
];

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const { token } = await adminAuth(password);
      onAuth(token);
    } catch {
      setError('Incorrect password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">EP</div>
            <div className="text-left">
              <p className="font-semibold text-foreground leading-none">ExamPilot</p>
              <p className="text-xs text-muted-foreground mt-0.5">Operator Dashboard</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card space-y-4">
          <p className="text-sm font-semibold text-foreground">Unlock Dashboard</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Operator password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter operator password"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ExamPilot · Internal use only
        </p>
      </div>
    </div>
  );
}

// ── Dashboard Shell ───────────────────────────────────────────────────────────

function Dashboard({ onLock }: { onLock: () => void }) {
  const [section,  setSection]  = useState<Section>('overview');
  const [metrics,  setMetrics]  = useState<AdminMetrics | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [sideOpen, setSideOpen] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setError('');
      const m = await fetchMetrics();
      setMetrics(m);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        onLock();
      } else {
        setError('Failed to fetch metrics');
      }
    } finally {
      setLoading(false);
    }
  }, [onLock]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const needsMetrics: Section[] = ['overview', 'ai-costs', 'health'];

  function renderContent() {
    if (needsMetrics.includes(section) && loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      );
    }
    if (needsMetrics.includes(section) && error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={refresh} className="text-xs text-indigo-400 hover:underline">Try again</button>
          </div>
        </div>
      );
    }
    if (needsMetrics.includes(section) && !metrics) return null;

    switch (section) {
      case 'overview':  return <Overview        metrics={metrics!} onRefresh={refresh} />;
      case 'ai-costs':  return <AiCosts         metrics={metrics!} />;
      case 'health':    return <SystemHealth     metrics={metrics!} onRefresh={refresh} />;
      case 'students':  return <StudentActivity />;
      case 'growth':    return <Growth />;
      case 'reports':   return <ContentReports />;
      case 'github':    return <GitHubIssues />;
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 border-r border-border transition-all duration-200 ${
          sideOpen ? 'w-52' : 'w-14'
        }`}
        style={{ background: 'hsl(var(--sidebar))' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">EP</div>
          {sideOpen && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">ExamPilot</p>
              <p className="text-[10px] text-muted-foreground truncate">Operator</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors ${
                section === item.id
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span className="text-sm shrink-0">{item.icon}</span>
              {sideOpen && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-medium truncate">{item.label}</span>
                  {item.demo && (
                    <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">DEMO</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 space-y-1 border-t border-[hsl(var(--sidebar-border))] pt-3">
          <button
            onClick={() => setSideOpen(v => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <span className="text-sm shrink-0">{sideOpen ? '«' : '»'}</span>
            {sideOpen && <span className="text-xs">Collapse</span>}
          </button>
          <button
            onClick={onLock}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="text-sm shrink-0">⎋</span>
            {sideOpen && <span className="text-xs">Lock</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  function handleAuth(t: string) {
    setToken(t);
    setTokenState(t);
  }

  function handleLock() {
    clearToken();
    setTokenState(null);
  }

  if (!token) return <PasswordGate onAuth={handleAuth} />;
  return <Dashboard onLock={handleLock} />;
}

import { AdminMetrics, formatCost, formatUptime } from '../lib/api';

interface Props { metrics: AdminMetrics; onRefresh: () => void; }

function KpiCard({ label, value, sub, color = 'indigo' }: { label: string; value: string; sub?: string; color?: 'indigo' | 'green' | 'amber' | 'red' }) {
  const colors = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    green:  'from-green-500/10 to-transparent border-green-500/20 text-green-400',
    amber:  'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    red:    'from-red-500/10 to-transparent border-red-500/20 text-red-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground mono">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function Overview({ metrics, onRefresh }: Props) {
  const { ai, server, flags } = metrics;
  const errorPct = (ai.errorRate * 100).toFixed(1);
  const uptimeStr = formatUptime(server.uptimeSeconds);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live snapshot — real data from the API server</p>
        </div>
        <button onClick={onRefresh} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total AI Calls" value={ai.totalCalls.toLocaleString()} sub={`${ai.todayCalls} today`} color="indigo" />
        <KpiCard label="Today's AI Cost" value={formatCost(ai.todayCostUsd)} sub={`Total: ${formatCost(ai.totalCostUsd)}`} color="green" />
        <KpiCard label="Avg Latency" value={`${ai.avgLatencyMs}ms`} sub="gpt-4o-mini" color={ai.avgLatencyMs > 3000 ? 'amber' : 'indigo'} />
        <KpiCard label="Pending Flags" value={flags.pending.toString()} sub={`${flags.resolved} resolved`} color={flags.pending > 0 ? 'amber' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Server status strip */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Server Status</h3>
          {[
            { label: 'Uptime', value: uptimeStr },
            { label: 'Node', value: server.nodeVersion, mono: true },
            { label: 'PID', value: server.pid.toString(), mono: true },
            { label: 'Error Rate', value: `${errorPct}%`, warn: ai.errorRate > 0.05 },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className={`text-xs font-medium ${row.mono ? 'mono' : ''} ${row.warn ? 'text-amber-400' : 'text-foreground'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Flags summary */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Content Reports</h3>
          <div className="space-y-2">
            {[
              { label: 'Total Flags', value: flags.total, color: 'text-foreground' },
              { label: 'Pending Review', value: flags.pending, color: flags.pending > 0 ? 'text-amber-400' : 'text-green-400' },
              { label: 'Resolved', value: flags.resolved, color: 'text-green-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className={`text-sm font-semibold mono ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
          {flags.pending === 0 && (
            <p className="text-xs text-green-400 mt-2">&#10003; Question bank is clean</p>
          )}
        </div>
      </div>

      {/* Subject breakdown */}
      {Object.keys(ai.callsBySubject).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-foreground mb-3">AI Calls by Subject</h3>
          <div className="space-y-2">
            {Object.entries(ai.callsBySubject).map(([subj, count]) => {
              const pct = ai.totalCalls > 0 ? Math.round((count / ai.totalCalls) * 100) : 0;
              return (
                <div key={subj} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{subj}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs mono text-foreground w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

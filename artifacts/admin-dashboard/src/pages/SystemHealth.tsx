import { AdminMetrics, formatUptime } from '../lib/api';

interface Props { metrics: AdminMetrics; onRefresh: () => void; }

export function SystemHealth({ metrics, onRefresh }: Props) {
  const { ai, server } = metrics;
  const errorRate = ai.errorRate;

  const status = errorRate < 0.05 ? 'Healthy' : errorRate < 0.15 ? 'Degraded' : 'Critical';
  const statusColor = {
    Healthy:  { dot: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
    Degraded: { dot: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
    Critical: { dot: 'bg-red-500',   text: 'text-red-400',   border: 'border-red-500/30',   bg: 'bg-red-500/10'   },
  }[status];

  const rows = [
    { label: 'Server Uptime',    value: formatUptime(server.uptimeSeconds),          note: '' },
    { label: 'Node.js Version',  value: server.nodeVersion,                           note: '', mono: true },
    { label: 'Process ID',       value: server.pid.toString(),                        note: '', mono: true },
    { label: 'Avg AI Latency',   value: `${ai.avgLatencyMs} ms`,                     note: ai.avgLatencyMs > 3000 ? 'High — consider investigating' : 'Normal', warn: ai.avgLatencyMs > 3000 },
    { label: 'Error Rate',       value: `${(errorRate * 100).toFixed(2)}%`,           note: status, warn: errorRate >= 0.05 },
    { label: 'Total AI Calls',   value: ai.totalCalls.toLocaleString(),               note: '' },
    { label: 'Failed Calls',     value: Math.round(errorRate * ai.totalCalls).toString(), note: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">System Health</h2>
          <p className="text-sm text-muted-foreground mt-0.5">API server status and performance metrics</p>
        </div>
        <button onClick={onRefresh} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity">
          Refresh
        </button>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${statusColor.border} ${statusColor.bg}`}>
        <div className={`w-3 h-3 rounded-full ${statusColor.dot} animate-pulse`} />
        <div>
          <p className={`font-semibold ${statusColor.text}`}>{status}</p>
          <p className="text-xs text-muted-foreground">
            Error rate {(errorRate * 100).toFixed(2)}% &middot; Uptime {formatUptime(server.uptimeSeconds)}
          </p>
        </div>
      </div>

      {/* Metrics table */}
      <div className="card divide-y divide-border/50">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm text-foreground">{row.label}</p>
              {row.note && (
                <p className={`text-xs mt-0.5 ${row.warn ? 'text-amber-400' : 'text-muted-foreground'}`}>{row.note}</p>
              )}
            </div>
            <span className={`text-sm font-semibold ${row.mono ? 'mono' : ''} ${row.warn ? 'text-amber-400' : 'text-foreground'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Thresholds reference */}
      <div className="card">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Status Thresholds</p>
        <div className="space-y-2">
          {[
            { label: 'Healthy',  cond: 'Error rate < 5%',  color: 'text-green-400' },
            { label: 'Degraded', cond: 'Error rate 5–15%', color: 'text-amber-400' },
            { label: 'Critical', cond: 'Error rate > 15%', color: 'text-red-400' },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between text-xs">
              <span className={`font-medium ${t.color}`}>{t.label}</span>
              <span className="text-muted-foreground">{t.cond}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

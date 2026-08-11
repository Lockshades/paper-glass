import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { AdminMetrics, formatCost } from '../lib/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa'];

interface Props { metrics: AdminMetrics }

export function AiCosts({ metrics }: Props) {
  const { ai } = metrics;
  const costPerCall = ai.totalCalls > 0 ? ai.totalCostUsd / ai.totalCalls : 0;

  const subjectData = Object.entries(ai.callsBySubject).map(([name, value]) => ({ name, value }));

  const tooltipStyle = {
    backgroundColor: 'hsl(222 20% 11%)',
    border: '1px solid hsl(222 20% 18%)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'hsl(210 20% 93%)',
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">AI Costs</h2>
          <span className="badge-live">Live</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">gpt-4o-mini — $0.150/1M input · $0.600/1M output</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: formatCost(ai.totalCostUsd) },
          { label: "Today's Spend", value: formatCost(ai.todayCostUsd) },
          { label: 'Cost / Call', value: formatCost(costPerCall) },
          { label: 'Error Rate', value: `${(ai.errorRate * 100).toFixed(1)}%` },
        ].map(c => (
          <div key={c.label} className="card">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{c.label}</p>
            <p className="text-2xl font-bold mono text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Token usage */}
      <div className="card">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Token Usage (Lifetime)</p>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground">Input tokens</p>
            <p className="text-xl font-bold mono text-indigo-400">{ai.totalTokensIn.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Output tokens</p>
            <p className="text-xl font-bold mono text-violet-400">{ai.totalTokensOut.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total calls</p>
            <p className="text-xl font-bold mono text-foreground">{ai.totalCalls.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily calls line chart */}
        <div className="card lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">Daily AI Calls (30 days)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ai.callsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} interval={6} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject breakdown */}
        <div className="card">
          <p className="text-sm font-semibold text-foreground mb-4">Calls by Subject</p>
          {subjectData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={2}>
                    {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {subjectData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs mono text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No AI calls yet</p>
          )}
        </div>
      </div>

      {/* Daily cost bar chart */}
      <div className="card">
        <p className="text-sm font-semibold text-foreground mb-4">Daily Cost in USD (30 days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={ai.callsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} interval={6} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} tickFormatter={v => `$${v.toFixed(3)}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(4)}`, 'Cost']} />
            <Bar dataKey="costUsd" fill="#6366f1" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  getMonthlyRevenueMock, getRevenueByExamType, getRevenueByState,
  getRegisteredVsPaying, getConcurrencyHistory, kpiMock,
} from '../lib/mockData';
import { formatNgn } from '../lib/api';

const tooltipStyle = {
  backgroundColor: 'hsl(222 20% 11%)',
  border: '1px solid hsl(222 20% 18%)',
  borderRadius: '6px',
  fontSize: '11px',
  color: 'hsl(210 20% 93%)',
};

function DemoBanner() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/8">
      <span className="text-amber-400 text-sm mt-0.5">&#9888;</span>
      <p className="text-xs text-amber-300">
        <strong>Demo Data</strong> — Investor-grade projections based on realistic Nigerian EdTech market benchmarks. Connect your payment processor to show live figures.
      </p>
    </div>
  );
}

export function Growth() {
  const monthly = getMonthlyRevenueMock();
  const examTypes = getRevenueByExamType();
  const byState = getRevenueByState();
  const cohort = getRegisteredVsPaying();
  const concurrency = getConcurrencyHistory();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Growth &amp; Revenue</h2>
          <span className="badge-demo">Demo Data</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Investor-grade growth metrics — connect your payment processor to make these live</p>
      </div>

      <DemoBanner />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current MRR', value: formatNgn(kpiMock.totalRevenueMrr) },
          { label: 'Registered', value: kpiMock.totalRegistered.toLocaleString() },
          { label: 'Paying', value: kpiMock.paying.toString() },
          { label: 'Cross-Reg Rate', value: `${kpiMock.crossRegistrationRate}%` },
        ].map(c => (
          <div key={c.label} className="card">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{c.label}</p>
            <p className="text-xl font-bold mono text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue */}
      <div className="card">
        <p className="text-sm font-semibold text-foreground mb-1">Monthly Revenue (NGN)</p>
        <p className="text-xs text-muted-foreground mb-4">Feb – Jul 2026</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatNgn(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by exam type */}
        <div className="card">
          <p className="text-sm font-semibold text-foreground mb-4">Revenue by Exam Type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={examTypes} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                  {examTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {examTypes.map(e => (
                <div key={e.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                    <span className="text-xs text-muted-foreground">{e.name}</span>
                  </div>
                  <span className="text-xs mono font-semibold text-foreground">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by state */}
        <div className="card">
          <p className="text-sm font-semibold text-foreground mb-4">Revenue by State (Top 5)</p>
          <div className="space-y-3">
            {byState.map((s, i) => {
              const max = byState[0].revenue;
              const pct = Math.round((s.revenue / max) * 100);
              return (
                <div key={s.state} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground">{s.state}</span>
                    <span className="mono text-muted-foreground">{formatNgn(s.revenue)}</span>
                  </div>
                  <div className="bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registered vs Paying cohort */}
      <div className="card">
        <p className="text-sm font-semibold text-foreground mb-1">Registered vs Paying Cohorts</p>
        <p className="text-xs text-muted-foreground mb-4">6-month user growth</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={cohort} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="registered" name="Registered" stroke="#6366f1" fill="url(#regGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="paying"     name="Paying"     stroke="#22c55e" fill="url(#payGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Concurrency sparkline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Concurrent Users (Last 24h)</p>
          <div className="flex gap-4 text-xs">
            <span className="text-muted-foreground">Peak: <span className="text-foreground mono font-semibold">{kpiMock.peakConcurrent}</span></span>
            <span className="text-muted-foreground">Avg: <span className="text-foreground mono font-semibold">{kpiMock.avgConcurrent}</span></span>
            <span className="text-muted-foreground">Concurrency/Sparsity: <span className="text-foreground mono font-semibold">{(kpiMock.peakConcurrent / kpiMock.avgConcurrent).toFixed(1)}x</span></span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={getConcurrencyHistory()} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} interval={5} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Users']} />
            <Line type="monotone" dataKey="users" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

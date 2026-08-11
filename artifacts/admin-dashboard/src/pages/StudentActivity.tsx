import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  getDailySessionsMock, kpiMock,
} from '../lib/mockData';

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
        <strong>Demo Data</strong> — Not yet connected to a database. These figures are realistic projections for investor presentations.
      </p>
    </div>
  );
}

export function StudentActivity() {
  const sessions = getDailySessionsMock();
  const { avgScoreBySubject, totalRegistered, paying, conversionRate } = kpiMock;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Student Activity</h2>
          <span className="badge-demo">Demo Data</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">User engagement metrics — connect your database to make these live</p>
      </div>

      <DemoBanner />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Users', value: totalRegistered.toLocaleString(), color: 'text-foreground' },
          { label: 'Paying Users', value: paying.toString(), color: 'text-indigo-400' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-green-400' },
          { label: 'Cross-Registration', value: `${kpiMock.crossRegistrationRate}%`, color: 'text-violet-400' },
        ].map(c => (
          <div key={c.label} className="card">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{c.label}</p>
            <p className={`text-2xl font-bold mono ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions chart */}
      <div className="card">
        <p className="text-sm font-semibold text-foreground mb-1">Daily Sessions (30 days)</p>
        <p className="text-xs text-muted-foreground mb-4">Started vs completed exam sessions</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sessions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} interval={6} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: 'hsl(215 16% 52%)' }} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="started"   name="Started"   fill="#6366f1" radius={[2,2,0,0]} />
            <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score breakdown */}
      <div className="card">
        <p className="text-sm font-semibold text-foreground mb-4">Average Score by Subject</p>
        <div className="space-y-4">
          {Object.entries(avgScoreBySubject).map(([subject, score]) => (
            <div key={subject} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-foreground">{subject}</span>
                <span className="mono text-muted-foreground">{score}%</span>
              </div>
              <div className="bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${score}%`,
                    background: score >= 70 ? '#22c55e' : score >= 55 ? '#6366f1' : '#f59e0b',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concurrency */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Concurrency Metrics</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Current Active', value: kpiMock.avgConcurrent.toString() },
            { label: 'Peak Concurrent', value: kpiMock.peakConcurrent.toString() },
            { label: 'Median Session', value: `${kpiMock.medianSessionMinutes}m` },
          ].map(c => (
            <div key={c.label} className="text-center">
              <p className="text-2xl font-bold mono text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

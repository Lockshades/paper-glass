/** Realistic-looking demo data for investor metrics (not backed by a real DB) */

export function getDailySessionsMock() {
  // 30 days of sessions ramping from ~5 to ~45
  const data: { date: string; started: number; completed: number }[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const date = d.toISOString().slice(0, 10);
    const base = Math.round(5 + ((29 - i) / 29) * 38);
    const noise = Math.round((Math.sin(i * 2.3) + Math.cos(i * 1.7)) * 4);
    const started = Math.max(2, base + noise);
    const completed = Math.round(started * (0.72 + Math.sin(i) * 0.08));
    data.push({ date, started, completed });
  }
  return data;
}

export function getMonthlyRevenueMock() {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const revenue = [320000, 490000, 620000, 870000, 1140000, 1450000];
  return months.map((month, i) => ({ month, revenue: revenue[i] }));
}

export function getRevenueByExamType() {
  return [
    { name: 'JAMB', value: 68, color: '#6366f1' },
    { name: 'WAEC', value: 22, color: '#22c55e' },
    { name: 'NECO', value: 10, color: '#f59e0b' },
  ];
}

export function getRevenueByState() {
  return [
    { state: 'Lagos', revenue: 423000 },
    { state: 'FCT Abuja', revenue: 291000 },
    { state: 'Kano', revenue: 178000 },
    { state: 'Rivers', revenue: 156000 },
    { state: 'Oyo', revenue: 134000 },
  ];
}

export function getRegisteredVsPaying() {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const registered = [180, 290, 420, 570, 710, 847];
  const paying = [22, 38, 60, 89, 112, 134];
  return months.map((month, i) => ({ month, registered: registered[i], paying: paying[i] }));
}

export function getConcurrencyHistory() {
  // 24-hour concurrency sparkline
  const data: { hour: string; users: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hour = `${h.toString().padStart(2, '0')}:00`;
    // Morning/evening peaks, night low
    const base = h >= 8 && h <= 22 ? 8 + Math.round(Math.sin((h - 8) / 14 * Math.PI) * 35) : 3;
    data.push({ hour, users: Math.max(1, base + Math.round((Math.random() - 0.5) * 5)) });
  }
  return data;
}

export const kpiMock = {
  totalRegistered: 847,
  paying: 134,
  conversionRate: 15.8,
  crossRegistrationRate: 18,
  peakConcurrent: 47,
  avgConcurrent: 12,
  medianSessionMinutes: 18,
  avgScoreBySubject: { Physics: 61, Mathematics: 54, English: 73 },
  totalRevenueMrr: 1450000,
};

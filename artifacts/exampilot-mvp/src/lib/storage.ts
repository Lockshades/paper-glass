export interface StudentProfile {
  name: string;
  exam: 'JAMB' | 'WAEC' | 'NECO';
  targetDate: string; // YYYY-MM-DD
}

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
}

export interface SessionRecord {
  id: string;
  subjectId: string;
  score: number;
  correct: number;
  total: number;
  timeUsed: number;
  topicStats: TopicStat[];
  completedAt: string; // ISO datetime
}

export interface ActiveSession {
  subjectId: string;
  answers: Record<number, string>;
  flagged: number[];
  timeLeft: number;
  current: number;
  savedAt: number; // ms timestamp
}

const PROFILE_KEY = 'ep_profile';
const SESSIONS_KEY = 'ep_sessions';
const activeKey = (id: string) => `ep_active_${id}`;

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked
  }
}

export function getProfile(): StudentProfile | null {
  return safeGet<StudentProfile>(PROFILE_KEY);
}

export function saveProfile(profile: StudentProfile) {
  safeSet(PROFILE_KEY, profile);
}

export function getSessions(): SessionRecord[] {
  return safeGet<SessionRecord[]>(SESSIONS_KEY) ?? [];
}

export function addSession(record: SessionRecord) {
  const prev = getSessions();
  safeSet(SESSIONS_KEY, [record, ...prev].slice(0, 200));
}

export function getActiveSession(subjectId: string): ActiveSession | null {
  const s = safeGet<ActiveSession>(activeKey(subjectId));
  if (!s) return null;
  // Expire after 2 hours
  if (Date.now() - s.savedAt > 2 * 60 * 60 * 1000) {
    clearActiveSession(subjectId);
    return null;
  }
  return s;
}

export function saveActiveSession(s: ActiveSession) {
  safeSet(activeKey(s.subjectId), { ...s, savedAt: Date.now() });
}

export function clearActiveSession(subjectId: string) {
  try {
    localStorage.removeItem(activeKey(subjectId));
  } catch {
    // ignore
  }
}

// ── computed helpers ─────────────────────────────────────────────────────────

export function computeStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const dateSet = new Set(sessions.map(s => s.completedAt.slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  const d = new Date();
  // if no session today, start counting from yesterday
  if (!dateSet.has(today)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().slice(0, 10);
    if (dateSet.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export interface WeakTopic {
  topic: string;
  subjectId: string;
  score: number;
  urgency: 'high' | 'medium';
}

export function computeWeakTopics(sessions: SessionRecord[]): WeakTopic[] {
  const agg: Record<string, { correct: number; total: number; subjectId: string }> = {};
  sessions.forEach(s => {
    s.topicStats.forEach(ts => {
      if (!agg[ts.topic]) agg[ts.topic] = { correct: 0, total: 0, subjectId: s.subjectId };
      agg[ts.topic].correct += ts.correct;
      agg[ts.topic].total += ts.total;
    });
  });
  return Object.entries(agg)
    .filter(([, v]) => v.total >= 2 && v.correct / v.total < 0.6)
    .map(([topic, v]) => ({
      topic,
      subjectId: v.subjectId,
      score: Math.round((v.correct / v.total) * 100),
      urgency: v.correct / v.total < 0.4 ? 'high' as const : 'medium' as const,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

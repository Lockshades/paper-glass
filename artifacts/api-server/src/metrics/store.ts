// In-memory metrics store for ExamPilot Operator Dashboard
// Uses capped circular buffers to prevent unbounded memory growth

export interface AiCallRecord {
  timestamp: number;    // unix ms
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  error: boolean;
  subject: string;
  questionId?: number;
}

export interface FlaggedQuestion {
  id: string;
  questionId: number;
  subject: string;
  questionText: string;
  reason: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

const MAX_AI_RECORDS = 2000;

class MetricsStore {
  private aiCalls: AiCallRecord[] = [];
  private flaggedQuestions: Map<string, FlaggedQuestion> = new Map();
  private startTime: number = Date.now();

  // ── AI calls ──────────────────────────────────────────────────────────────

  recordAiCall(record: AiCallRecord) {
    this.aiCalls.push(record);
    if (this.aiCalls.length > MAX_AI_RECORDS) {
      this.aiCalls.shift();
    }
  }

  // GPT-4o-mini pricing: $0.150/1M input, $0.600/1M output
  private calcCostUsd(tokensIn: number, tokensOut: number): number {
    return tokensIn * 0.00000015 + tokensOut * 0.0000006;
  }

  getAiSummary() {
    const calls = this.aiCalls;
    const successCalls = calls.filter(c => !c.error);
    const totalCostUsd = calls.reduce(
      (sum, c) => sum + this.calcCostUsd(c.tokensIn, c.tokensOut),
      0,
    );

    // Calls by day (last 30 days)
    const now = Date.now();
    const dayMs = 86_400_000;
    const callsByDay: { date: string; calls: number; costUsd: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = now - i * dayMs - ((now % dayMs));
      const dayEnd = dayStart + dayMs;
      const dayCalls = calls.filter(c => c.timestamp >= dayStart && c.timestamp < dayEnd);
      const day = new Date(dayStart).toISOString().slice(0, 10);
      callsByDay.push({
        date: day,
        calls: dayCalls.length,
        costUsd: dayCalls.reduce((s, c) => s + this.calcCostUsd(c.tokensIn, c.tokensOut), 0),
      });
    }

    // Today metrics
    const todayStart = now - (now % dayMs);
    const todayCalls = calls.filter(c => c.timestamp >= todayStart);
    const todayCostUsd = todayCalls.reduce(
      (s, c) => s + this.calcCostUsd(c.tokensIn, c.tokensOut), 0,
    );

    // By subject
    const callsBySubject: Record<string, number> = {};
    for (const c of calls) {
      callsBySubject[c.subject] = (callsBySubject[c.subject] || 0) + 1;
    }

    const avgLatencyMs =
      successCalls.length > 0
        ? Math.round(successCalls.reduce((s, c) => s + c.latencyMs, 0) / successCalls.length)
        : 0;

    return {
      totalCalls: calls.length,
      todayCalls: todayCalls.length,
      todayCostUsd,
      totalCostUsd,
      totalTokensIn: calls.reduce((s, c) => s + c.tokensIn, 0),
      totalTokensOut: calls.reduce((s, c) => s + c.tokensOut, 0),
      errorRate: calls.length > 0 ? calls.filter(c => c.error).length / calls.length : 0,
      avgLatencyMs,
      callsByDay,
      callsBySubject,
    };
  }

  // ── Flagged questions ─────────────────────────────────────────────────────

  addFlag(flag: Omit<FlaggedQuestion, 'id' | 'resolved' | 'timestamp'>): FlaggedQuestion {
    const id = `flag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record: FlaggedQuestion = { ...flag, id, resolved: false, timestamp: Date.now() };
    this.flaggedQuestions.set(id, record);
    return record;
  }

  resolveFlag(id: string): boolean {
    const flag = this.flaggedQuestions.get(id);
    if (!flag) return false;
    flag.resolved = true;
    flag.resolvedAt = Date.now();
    return true;
  }

  getFlags(): FlaggedQuestion[] {
    return [...this.flaggedQuestions.values()].sort((a, b) => b.timestamp - a.timestamp);
  }

  // ── Server info ───────────────────────────────────────────────────────────

  getServerInfo() {
    return {
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
      nodeVersion: process.version,
      pid: process.pid,
    };
  }
}

export const metricsStore = new MetricsStore();

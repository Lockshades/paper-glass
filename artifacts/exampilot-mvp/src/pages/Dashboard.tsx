import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Atom, Calculator, BookOpen, TrendingUp, Target, Clock,
  ChevronRight, Award, Flame, BarChart3, Play, Star, Settings
} from 'lucide-react';
import { subjects } from '../data/questions';
import {
  StudentProfile, SessionRecord,
  computeStreak, daysUntil, computeWeakTopics,
} from '../lib/storage';

interface DashboardProps {
  profile: StudentProfile;
  sessions: SessionRecord[];
  onStartExam: (subjectId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Atom: <Atom className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
};

const colorMap: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-700' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-200',   badge: 'bg-blue-100 text-blue-700'   },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({ profile, sessions, onStartExam }: DashboardProps) {
  const firstName = profile.name.split(' ')[0];
  const days = daysUntil(profile.targetDate);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const weakTopics = useMemo(() => computeWeakTopics(sessions), [sessions]);

  // Aggregate stats
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / totalSessions)
    : 0;
  const totalSecs = sessions.reduce((a, s) => a + s.timeUsed, 0);
  const hoursStudied = (totalSecs / 3600).toFixed(1);

  // Per-subject stats
  const subjectStats = useMemo(() => {
    const map: Record<string, { lastScore: number | null; count: number }> = {};
    subjects.forEach(s => { map[s.id] = { lastScore: null, count: 0 }; });
    sessions.forEach(s => {
      if (!map[s.subjectId]) return;
      map[s.subjectId].count++;
      // First encounter = most recent (sessions stored newest-first)
      if (map[s.subjectId].lastScore === null) map[s.subjectId].lastScore = s.score;
    });
    return map;
  }, [sessions]);

  // Stats row — use real data, fall back gracefully when empty
  const statCards = [
    {
      label: 'Practice Sessions',
      value: totalSessions > 0 ? String(totalSessions) : '0',
      icon: <Flame className="w-4 h-4" />,
      delta: totalSessions > 0 ? `${sessions.filter(s => {
        const d = new Date(s.completedAt);
        const week = Date.now() - 7 * 86_400_000;
        return d.getTime() > week;
      }).length} this week` : 'Start your first session',
    },
    {
      label: 'Avg. Score',
      value: totalSessions > 0 ? `${avgScore}%` : '—',
      icon: <BarChart3 className="w-4 h-4" />,
      delta: totalSessions > 0 ? (avgScore >= 60 ? 'Above pass mark' : 'Keep practising') : 'No sessions yet',
    },
    {
      label: 'Study Streak',
      value: streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'}` : '0 days',
      icon: <Target className="w-4 h-4" />,
      delta: streak > 0 ? 'Keep it going!' : 'Start your streak today',
    },
    {
      label: 'Time Studied',
      value: totalSecs > 0 ? `${hoursStudied} hrs` : '0 hrs',
      icon: <Clock className="w-4 h-4" />,
      delta: 'Total all time',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-700 text-lg text-foreground tracking-tight">ExamPilot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold select-none">
              {firstName[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-muted-foreground text-sm font-medium">{greeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-0.5">
              Ready to practice, {firstName}?
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {profile.exam} — {days > 0 ? `${days} days remaining` : 'Exam day is here!'}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{streak}-day streak</span>
            </div>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.delta}</p>
            </div>
          ))}
        </motion.div>

        {/* Subject cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Your Subjects</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, i) => {
              const colors = colorMap[subject.color];
              const ss = subjectStats[subject.id];
              const lastScore = ss?.lastScore ?? null;
              const practiceCount = ss?.count ?? 0;

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
                  className="bg-white border border-border rounded-2xl p-5 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} ring-1 ${colors.ring} flex items-center justify-center`}>
                      {iconMap[subject.icon]}
                    </div>
                    {lastScore !== null ? (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
                        Last: {lastScore}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Not started
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-foreground mb-1">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{subject.description}</p>

                  {lastScore !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Score progress</span>
                        <span className="font-medium">{lastScore}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full gradient-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${lastScore}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {practiceCount} {practiceCount === 1 ? 'session' : 'sessions'}
                    </span>
                    <button
                      onClick={() => onStartExam(subject.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white gradient-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Practice
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Weak topics */}
        {weakTopics.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-base font-display font-bold text-foreground">Weak Topics to Focus On</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {weakTopics.map((item) => (
                <div key={item.topic} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgency === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.topic}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.subjectId} · {item.score}% avg</p>
                  </div>
                  <Award className={`w-4 h-4 flex-shrink-0 ${item.urgency === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : totalSessions === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-accent border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-foreground mb-1">Your weak topics will appear here</h3>
            <p className="text-sm text-muted-foreground">Complete at least one practice session to see personalised insights.</p>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, ChevronLeft, ChevronRight, Clock, AlertCircle, Star, RotateCcw } from 'lucide-react';
import { Question, subjects } from '../data/questions';
import {
  getActiveSession, saveActiveSession, clearActiveSession,
} from '../lib/storage';

interface ExamSessionProps {
  subjectId: string;
  duration: number;
  onSubmit: (answers: Record<number, string>, questions: Question[], timeUsed: number) => void;
}

export default function ExamSession({ subjectId, duration, onSubmit }: ExamSessionProps) {
  const subject = subjects.find(s => s.id === subjectId)!;
  const questions = subject.questions.slice(0, 10);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [startTime] = useState(Date.now());
  const [started, setStarted] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    const saved = getActiveSession(subjectId);
    if (saved && saved.timeLeft > 0 && Object.keys(saved.answers).length > 0) {
      setShowResume(true);
    } else {
      setStarted(true);
    }
  }, [subjectId]);

  // Persist state whenever it changes (debounced via natural render cycle)
  useEffect(() => {
    if (!started) return;
    saveActiveSession({
      subjectId,
      answers,
      flagged: Array.from(flagged),
      timeLeft,
      current,
      savedAt: Date.now(),
    });
  }, [answers, flagged, timeLeft, current, subjectId, started]);

  // Timer
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, started]);

  const handleSubmit = useCallback(() => {
    clearActiveSession(subjectId);
    const timeUsed = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, questions, timeUsed);
  }, [answers, questions, startTime, onSubmit, subjectId]);

  function resumeSession() {
    const saved = getActiveSession(subjectId)!;
    setAnswers(saved.answers);
    setFlagged(new Set(saved.flagged));
    setTimeLeft(saved.timeLeft);
    setCurrent(saved.current);
    setShowResume(false);
    setStarted(true);
  }

  function startFresh() {
    clearActiveSession(subjectId);
    setShowResume(false);
    setStarted(true);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerWarning = timeLeft < 120;
  const timerCritical = timeLeft < 60;
  const q = questions[current];
  const answered = Object.keys(answers).length;

  function toggleFlag(idx: number) {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  // ── Resume dialog ─────────────────────────────────────────────────────────
  if (showResume) {
    const saved = getActiveSession(subjectId);
    const savedAnswered = saved ? Object.keys(saved.answers).length : 0;
    const savedMins = saved ? Math.floor(saved.timeLeft / 60) : 0;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl border border-border"
        >
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-1">Resume session?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            You have a saved {subject.name} session with {savedAnswered} answers and {savedMins}m remaining.
          </p>
          <div className="flex gap-3">
            <button
              onClick={startFresh}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Start fresh
            </button>
            <button
              onClick={resumeSession}
              className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Resume
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!started) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{subject.name} Practice</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-semibold text-sm transition-colors ${
            timerCritical ? 'bg-red-50 text-red-600 border border-red-200' :
            timerWarning  ? 'bg-amber-50 text-amber-600 border border-amber-200' :
            'bg-muted text-foreground border border-border'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm font-semibold text-white gradient-primary px-4 py-1.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex gap-6 w-full">
        {/* Question palette — desktop */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
          <div className="bg-white border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all relative ${
                    i === current
                      ? 'gradient-primary text-white shadow-sm'
                      : answers[questions[i].id]
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {i + 1}
                  {flagged.has(i) && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded gradient-primary" /> Viewing</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/10 border border-primary/20" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-muted" /> Not answered</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted relative">
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                </div> Flagged
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{answered}</p>
            <p className="text-xs text-muted-foreground">of {questions.length} answered</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 flex flex-col gap-4">
          <div className="lg:hidden flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Q {current + 1} / {questions.length}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              answered === questions.length ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
            }`}>{answered}/{questions.length} answered</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-border rounded-2xl p-6 flex-1"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Question {current + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{q.topic}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                    q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>{q.difficulty}</span>
                </div>
                <button
                  onClick={() => toggleFlag(current)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                    flagged.has(current)
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'text-muted-foreground border-border hover:border-amber-200 hover:text-amber-500'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged.has(current) ? 'Flagged' : 'Flag'}
                </button>
              </div>

              <p className="text-base font-medium text-foreground leading-relaxed mb-6">{q.text}</p>

              <div className="space-y-3">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        selected ? 'exam-option-selected' : 'border-border hover:border-primary/30 hover:bg-accent/50'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>{opt.label}</span>
                      <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrent(p => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Submit Exam
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Submit confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">Submit Exam?</h3>
                  <p className="text-xs text-muted-foreground">This cannot be undone</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-3 mb-5 text-sm space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Answered</span>
                  <span className="font-semibold text-foreground">{answered} / {questions.length}</span>
                </div>
                {answered < questions.length && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Unanswered</span>
                    <span className="font-semibold text-amber-600">{questions.length - answered}</span>
                  </div>
                )}
                {flagged.size > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Flagged</span>
                    <span className="font-semibold text-amber-600">{flagged.size}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  Review
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

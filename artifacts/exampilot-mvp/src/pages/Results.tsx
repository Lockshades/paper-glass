import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp, RotateCcw,
  LayoutDashboard, TrendingUp, Clock, Star, Award, Lightbulb,
  MessageCircle, Send, X, Bot
} from 'lucide-react';
import { Question } from '../data/questions';

interface ResultsProps {
  answers: Record<number, string>;
  questions: Question[];
  timeUsed: number;
  subjectId: string;
  onRetry: () => void;
  onDashboard: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TopicStat {
  topic: string;
  correct: number;
  total: number;
}

const BASE_URL = import.meta.env.BASE_URL as string;

// ── AI Tutor Chat (per-question) ─────────────────────────────────────────────
function TutorChat({ question, onClose }: { question: Question; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch(`${BASE_URL}api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.text,
          topic: question.topic,
          subject: question.subject,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          messages: newMessages,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Network error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + data.content,
                };
                return updated;
              });
            }
            if (data.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: 'Sorry, I couldn\'t respond right now. Please try again.',
                };
                return updated;
              });
            }
          } catch {
            // malformed SSE line, skip
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Connection error. Please check your internet and try again.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="border-t border-primary/10 bg-gradient-to-b from-accent/40 to-white rounded-b-2xl">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-primary">AI Tutor</span>
            <span className="text-xs text-muted-foreground">· Ask a follow-up about this question</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="px-4 py-3 max-h-56 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Ask anything about this question or the concept behind it.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white border border-border text-foreground rounded-bl-sm'
              }`}>
                {m.content || (loading && i === messages.length - 1 ? (
                  <span className="flex gap-1 items-center">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : '…')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask the tutor…"
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-60 bg-white"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl gradient-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Results component ────────────────────────────────────────────────────
export default function Results({ answers, questions, timeUsed, onRetry, onDashboard }: ResultsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [tutorOpenId, setTutorOpenId] = useState<number | null>(null);

  const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const score = Math.round((correct / questions.length) * 100);

  const mins = Math.floor(timeUsed / 60);
  const secs = timeUsed % 60;

  // Topic breakdown
  const topicMap: Record<string, TopicStat> = {};
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { topic: q.topic, correct: 0, total: 0 };
    topicMap[q.topic].total++;
    if (answers[q.id] === q.correctAnswer) topicMap[q.topic].correct++;
  });
  const topicStats = Object.values(topicMap).sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
  const weakTopics = topicStats.filter(t => t.correct / t.total < 0.6);

  const scoreGrade =
    score >= 80 ? { label: 'Excellent', color: 'text-green-600', ring: 'from-green-400 to-emerald-500' }
    : score >= 60 ? { label: 'Good',      color: 'text-blue-600',  ring: 'from-blue-400 to-indigo-500'  }
    : score >= 40 ? { label: 'Fair',      color: 'text-amber-600', ring: 'from-amber-400 to-orange-500' }
    :               { label: 'Needs Work', color: 'text-red-600',  ring: 'from-red-400 to-rose-500'     };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">ExamPilot</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDashboard}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border hover:bg-muted/50 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-sm font-semibold text-white gradient-primary px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Score hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular score */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="url(#sg)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / 100) }}
                  transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={score >= 80 ? '#22c55e' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#8b5cf6' : score >= 40 ? '#f97316' : '#f43f5e'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-display font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {score}%
                </motion.span>
                <span className={`text-xs font-semibold ${scoreGrade.color}`}>{scoreGrade.label}</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                {score >= 70 ? 'Well done!' : score >= 50 ? 'Good effort.' : 'Keep practising.'}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">
                You answered {correct} of {questions.length} questions correctly.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-foreground">{correct}</span>
                  <span className="text-muted-foreground">correct</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-foreground">{questions.length - correct}</span>
                  <span className="text-muted-foreground">wrong</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{mins}m {secs}s</span>
                  <span className="text-muted-foreground">used</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          {(['overview', 'review'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' ? 'Overview' : 'Question Review'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Topic breakdown */}
              <div className="bg-white border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-bold text-foreground">Topic Breakdown</h2>
                </div>
                <div className="space-y-3">
                  {topicStats.map((t, i) => {
                    const pct = Math.round((t.correct / t.total) * 100);
                    return (
                      <motion.div key={t.topic} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium text-foreground">{t.topic}</span>
                          <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            pct >= 70 ? 'bg-green-100 text-green-700' : pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>{t.correct}/{t.total}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              pct >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              pct >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                              'bg-gradient-to-r from-red-400 to-rose-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Study recommendations */}
              {weakTopics.length > 0 && (
                <div className="bg-accent border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                      <Lightbulb className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="font-display font-bold text-foreground">Study Recommendations</h2>
                  </div>
                  <div className="space-y-3">
                    {weakTopics.slice(0, 3).map((t) => {
                      const pct = Math.round((t.correct / t.total) * 100);
                      return (
                        <div key={t.topic} className="bg-white border border-border rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{t.topic}</p>
                              <p className="text-xs text-muted-foreground">{pct}% accuracy — needs attention</p>
                            </div>
                            <Award className={`w-4 h-4 flex-shrink-0 mt-0.5 ${pct < 40 ? 'text-red-400' : 'text-amber-400'}`} />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {pct < 40
                              ? `Focus on foundational concepts in ${t.topic} before attempting harder questions. Review your textbook definitions and work through basic examples.`
                              : `You have a partial understanding of ${t.topic}. Practice more application-style questions and pay attention to common traps.`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {questions.map((q, i) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                const isExpanded = expandedId === q.id;
                const isTutorOpen = tutorOpenId === q.id;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white border border-border rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setExpandedId(isExpanded ? null : q.id);
                        if (isExpanded) setTutorOpenId(null);
                      }}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCorrect
                          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                          : <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{q.topic}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{q.text}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                            {/* Options */}
                            <div className="space-y-2">
                              {q.options.map((opt) => {
                                const isSelected = userAnswer === opt.label;
                                const isCorrectOpt = q.correctAnswer === opt.label;
                                return (
                                  <div
                                    key={opt.label}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                                      isCorrectOpt ? 'exam-option-correct' :
                                      isSelected && !isCorrectOpt ? 'exam-option-wrong' :
                                      'border-border bg-muted/30'
                                    }`}
                                  >
                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                      isCorrectOpt ? 'bg-green-500 text-white' :
                                      isSelected ? 'bg-red-400 text-white' :
                                      'bg-muted text-muted-foreground'
                                    }`}>{opt.label}</span>
                                    <span className={`font-medium ${isCorrectOpt ? 'text-green-700' : isSelected ? 'text-red-600' : 'text-muted-foreground'}`}>
                                      {opt.text}
                                    </span>
                                    {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />}
                                    {isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div className="bg-accent/60 border border-primary/10 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center">
                                    <Lightbulb className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-xs font-semibold text-primary">Explanation</span>
                                </div>
                                <button
                                  onClick={() => setTutorOpenId(isTutorOpen ? null : q.id)}
                                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                                    isTutorOpen
                                      ? 'bg-primary/10 text-primary border-primary/20'
                                      : 'text-muted-foreground border-border hover:border-primary/30 hover:text-primary'
                                  }`}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  Ask AI Tutor
                                </button>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{q.explanation}</p>
                            </div>

                            {/* AI Tutor chat panel */}
                            <AnimatePresence>
                              {isTutorOpen && (
                                <TutorChat
                                  key={q.id}
                                  question={q}
                                  onClose={() => setTutorOpenId(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
          <button
            onClick={onDashboard}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border bg-white text-foreground font-semibold hover:bg-muted/50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Atom, Calculator, BookOpen, Clock, Hash, ChevronRight, Star, ArrowLeft } from 'lucide-react';
import { subjects } from '../data/questions';

interface ExamSetupProps {
  subjectId: string;
  onStart: (subjectId: string, questionCount: number, duration: number) => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Atom: <Atom className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
};

export default function ExamSetup({ subjectId, onStart, onBack }: ExamSetupProps) {
  const subject = subjects.find(s => s.id === subjectId)!;
  const colors = colorMap[subject.color];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">ExamPilot</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Subject header */}
          <div className="bg-white border border-border rounded-2xl p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center`}>
              {iconMap[subject.icon]}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{subject.name} Practice</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{subject.description}</p>
            </div>
          </div>

          {/* Exam details */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-bold text-foreground">Exam Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                <Hash className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-sm font-semibold text-foreground">10 questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Limit</p>
                  <p className="text-sm font-semibold text-foreground">15 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Topics covered */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-foreground mb-3">Topics Covered</h2>
            <div className="flex flex-wrap gap-2">
              {subject.id === 'physics' && ['Mechanics', 'Electricity', 'Waves', 'Heat', 'Optics', 'Modern Physics'].map(t => (
                <span key={t} className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>{t}</span>
              ))}
              {subject.id === 'mathematics' && ['Algebra', 'Geometry', 'Statistics', 'Trigonometry', 'Calculus', 'Probability'].map(t => (
                <span key={t} className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>{t}</span>
              ))}
              {subject.id === 'english' && ['Comprehension', 'Grammar', 'Vocabulary', 'Idioms', 'Essay'].map(t => (
                <span key={t} className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>{t}</span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-accent border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-foreground mb-3">Instructions</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Read each question carefully before selecting your answer.',
                'You can flag questions to revisit before submitting.',
                'The timer begins as soon as you click Start.',
                'Your answers are automatically saved as you go.',
                'You can navigate freely between questions.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onStart(subjectId, 10, 15 * 60)}
            className="w-full flex items-center justify-center gap-2 gradient-primary text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity text-base"
          >
            Start Practice Exam <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

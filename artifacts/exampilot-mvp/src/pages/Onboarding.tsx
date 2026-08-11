import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, GraduationCap, Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { saveProfile, StudentProfile } from '../lib/storage';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

const EXAMS = [
  { id: 'JAMB' as const, label: 'JAMB UTME', desc: 'Joint Admissions and Matriculation Board' },
  { id: 'WAEC' as const, label: 'WAEC SSCE', desc: 'West African Examinations Council' },
  { id: 'NECO' as const, label: 'NECO SSCE', desc: 'National Examinations Council' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [exam, setExam] = useState<'JAMB' | 'WAEC' | 'NECO' | null>(null);
  const [targetDate, setTargetDate] = useState('');
  const [nameError, setNameError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  // default target: 60 days from now
  const defaultDate = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);

  function handleStep1() {
    if (!name.trim()) { setNameError('Please enter your name'); return; }
    if (!exam) return;
    setNameError('');
    setStep(2);
  }

  function handleFinish() {
    const date = targetDate || defaultDate;
    const profile: StudentProfile = { name: name.trim(), exam: exam!, targetDate: date };
    saveProfile(profile);
    onComplete(profile);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-10"
      >
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-200">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-display font-bold text-xl text-foreground tracking-tight">ExamPilot</span>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= step ? 'w-8 gradient-primary' : 'w-4 bg-muted'
            }`}
          />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="bg-white border border-border rounded-3xl p-8 w-full max-w-md shadow-sm"
      >
        {step === 1 ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground">Welcome to ExamPilot</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Let's set up your study profile. Takes 30 seconds.
              </p>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-foreground mb-2">
                <User className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                What's your name?
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleStep1()}
                placeholder="e.g. Amara"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
                  nameError ? 'border-red-300 bg-red-50' : 'border-border focus:border-primary'
                }`}
                autoFocus
              />
              {nameError && <p className="text-xs text-red-500 mt-1.5">{nameError}</p>}
            </div>

            {/* Exam */}
            <div className="mb-7">
              <label className="block text-sm font-semibold text-foreground mb-2">
                <GraduationCap className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                Which exam are you preparing for?
              </label>
              <div className="space-y-2">
                {EXAMS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setExam(e.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      exam === e.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      exam === e.id ? 'border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {exam === e.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.label}</p>
                      <p className="text-xs text-muted-foreground">{e.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStep1}
              disabled={!name.trim() || !exam}
              className="w-full flex items-center justify-center gap-2 gradient-primary text-white font-semibold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground">
                When is your exam, {name.split(' ')[0]}?
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                We'll count down the days and keep you on track.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                Target exam date
              </label>
              <input
                type="date"
                value={targetDate || defaultDate}
                min={today}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-colors"
              />
            </div>

            {/* Encouragement card */}
            <div className="flex items-start gap-3 p-4 bg-accent rounded-xl border border-border mb-7">
              <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                ExamPilot will track your progress, identify weak areas, and guide your study plan
                right up to exam day.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] flex items-center justify-center gap-2 gradient-primary text-white font-semibold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
              >
                Start Practising <Star className="w-4 h-4 fill-white" />
              </button>
            </div>
          </>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground mt-6">
        Your data stays on your device. No account required.
      </p>
    </div>
  );
}

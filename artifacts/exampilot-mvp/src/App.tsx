import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Question } from './data/questions';
import {
  getProfile, saveProfile, getSessions, addSession,
  StudentProfile, SessionRecord,
} from './lib/storage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import ExamSession from './pages/ExamSession';
import Results from './pages/Results';

const queryClient = new QueryClient();

type Screen =
  | { name: 'loading' }
  | { name: 'onboarding' }
  | { name: 'dashboard' }
  | { name: 'setup'; subjectId: string }
  | { name: 'exam'; subjectId: string; duration: number }
  | { name: 'results'; subjectId: string; answers: Record<number, string>; questions: Question[]; timeUsed: number };

function AppContent() {
  const [screen, setScreen] = useState<Screen>({ name: 'loading' });
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const p = getProfile();
    const s = getSessions();
    setProfile(p);
    setSessions(s);
    setScreen(p ? { name: 'dashboard' } : { name: 'onboarding' });
  }, []);

  function handleOnboardingComplete(p: StudentProfile) {
    saveProfile(p);
    setProfile(p);
    setScreen({ name: 'dashboard' });
  }

  function handleExamSubmit(
    answers: Record<number, string>,
    questions: Question[],
    timeUsed: number,
    subjectId: string,
  ) {
    // Compute and persist session record
    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const topicMap: Record<string, { correct: number; total: number }> = {};
    questions.forEach(q => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (answers[q.id] === q.correctAnswer) topicMap[q.topic].correct++;
    });
    const record: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      subjectId,
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length,
      timeUsed,
      topicStats: Object.entries(topicMap).map(([topic, v]) => ({ topic, ...v })),
      completedAt: new Date().toISOString(),
    };
    addSession(record);
    setSessions(getSessions());
    setScreen({ name: 'results', subjectId, answers, questions, timeUsed });
  }

  if (screen.name === 'loading') return null;

  if (screen.name === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (screen.name === 'dashboard') {
    return (
      <Dashboard
        profile={profile!}
        sessions={sessions}
        onStartExam={(subjectId) => setScreen({ name: 'setup', subjectId })}
      />
    );
  }

  if (screen.name === 'setup') {
    return (
      <ExamSetup
        subjectId={screen.subjectId}
        onStart={(subjectId, _count, duration) =>
          setScreen({ name: 'exam', subjectId, duration })
        }
        onBack={() => setScreen({ name: 'dashboard' })}
      />
    );
  }

  if (screen.name === 'exam') {
    return (
      <ExamSession
        subjectId={screen.subjectId}
        duration={screen.duration}
        onSubmit={(answers, questions, timeUsed) =>
          handleExamSubmit(answers, questions, timeUsed, screen.subjectId)
        }
      />
    );
  }

  if (screen.name === 'results') {
    return (
      <Results
        subjectId={screen.subjectId}
        answers={screen.answers}
        questions={screen.questions}
        timeUsed={screen.timeUsed}
        onRetry={() =>
          setScreen({ name: 'exam', subjectId: screen.subjectId, duration: 15 * 60 })
        }
        onDashboard={() => setScreen({ name: 'dashboard' })}
      />
    );
  }

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

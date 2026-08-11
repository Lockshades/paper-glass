/**
 * Question interpolation / permutation system for ExamPilot.
 *
 * Templates define numeric parameter ranges. `sampleQuestion` draws a
 * deterministic variant from a template given a seed, so the same seed always
 * produces the same question.
 *
 * Graph support: templates can declare a `graphSvg(params)` function that
 * returns an inline SVG string. The rendered Question gains an optional
 * `graphSvg` field. The exam/result UI checks for this field and renders it
 * above the question text.
 */

import type { Question } from '../data/questions';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParamRange {
  min: number;
  max: number;
  step?: number;       // default 1
  unit?: string;       // display unit (e.g. 'm/s', 'kg')
}

export interface QuestionTemplate {
  id: string;
  subject: 'Physics' | 'Mathematics';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  params: Record<string, ParamRange>;
  /** Returns question text, options (4), correct label, explanation, optional SVG */
  generate: (p: Record<string, number>) => {
    text: string;
    options: { label: string; text: string }[];
    correctAnswer: string;   // 'A' | 'B' | 'C' | 'D'
    explanation: string;
    graphSvg?: string;       // inline SVG markup
  };
}

/** Extended Question with optional generated graph SVG */
export interface ParametricQuestion extends Question {
  graphSvg?: string;
  templateId?: string;
  seed?: number;
}

// ── Seeded RNG (LCG — good enough for question sampling) ──────────────────────

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function sampleParam(range: ParamRange, rand: () => number): number {
  const step = range.step ?? 1;
  const steps = Math.floor((range.max - range.min) / step);
  return range.min + Math.round(rand() * steps) * step;
}

// ── Template library ──────────────────────────────────────────────────────────

export const templates: QuestionTemplate[] = [
  // ── Physics: uniform acceleration ──────────────────────────────────────────
  {
    id: 'phys-kinematics-accel',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'easy',
    params: {
      v:  { min: 10, max: 60, step: 5, unit: 'm/s' },
      t:  { min: 2,  max: 10, step: 1, unit: 's'   },
    },
    generate(p) {
      const { v, t } = p;
      const a = v / t;                   // from rest
      const distractors = [a / 2, a * 2, v * t].map(x => Math.round(x * 100) / 100);
      const allAnswers = [a, ...distractors].sort(() => 0.5 - Math.random());
      const correctLabel = ['A', 'B', 'C', 'D'][allAnswers.indexOf(a)];
      return {
        text: `A car accelerates uniformly from rest to ${v} m/s in ${t} seconds. What is its acceleration?`,
        options: allAnswers.map((val, i) => ({ label: ['A','B','C','D'][i], text: `${Math.round(val * 100) / 100} m/s²` })),
        correctAnswer: correctLabel,
        explanation: `Acceleration a = Δv / t = (${v} − 0) / ${t} = ${a} m/s². Using a = Δv/Δt, the fundamental kinematic equation.`,
        graphSvg: velocityTimeGraph({ v0: 0, v1: v, t }),
      };
    },
  },

  // ── Physics: Newton's 2nd law ──────────────────────────────────────────────
  {
    id: 'phys-newtons-second',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'easy',
    params: {
      m: { min: 2,  max: 20, step: 1, unit: 'kg' },
      F: { min: 10, max: 80, step: 5, unit: 'N'  },
    },
    generate(p) {
      const { m, F } = p;
      const a = F / m;
      const wrong1 = Math.round((F * m) * 10) / 10;
      const wrong2 = Math.round((m / F) * 100) / 100;
      const wrong3 = Math.round((F + m) * 10) / 10;
      const answers = [{ val: a, correct: true }, { val: wrong1, correct: false }, { val: wrong2, correct: false }, { val: wrong3, correct: false }];
      const shuffled = answers.sort(() => 0.5 - Math.random());
      const correctLabel = ['A','B','C','D'][shuffled.findIndex(x => x.correct)];
      return {
        text: `A body of mass ${m} kg is acted on by a net force of ${F} N. What is the acceleration?`,
        options: shuffled.map((x, i) => ({ label: ['A','B','C','D'][i], text: `${x.val} m/s²` })),
        correctAnswer: correctLabel,
        explanation: `Newton's 2nd law: F = ma → a = F/m = ${F}/${m} = ${Math.round(a * 100) / 100} m/s².`,
      };
    },
  },

  // ── Physics: wave speed ────────────────────────────────────────────────────
  {
    id: 'phys-wave-speed',
    subject: 'Physics',
    topic: 'Waves',
    difficulty: 'easy',
    params: {
      f: { min: 20, max: 200, step: 10, unit: 'Hz' },
      λ: { min: 1,  max: 10,  step: 1,  unit: 'm'  },
    },
    generate(p) {
      const { f, λ } = p;
      const v = f * λ;
      const distractors = [f + λ, Math.round(f / λ), Math.round(λ / f * 100) / 100];
      const answers = [{ val: v, lbl: `${v} m/s`, correct: true },
                       { val: distractors[0], lbl: `${distractors[0]} m/s`, correct: false },
                       { val: distractors[1], lbl: `${distractors[1]} m/s`, correct: false },
                       { val: distractors[2], lbl: `${distractors[2]} m/s`, correct: false }]
        .sort(() => 0.5 - Math.random());
      const correctLabel = ['A','B','C','D'][answers.findIndex(x => x.correct)];
      return {
        text: `A wave has frequency ${f} Hz and wavelength ${λ} m. What is the wave speed?`,
        options: answers.map((x, i) => ({ label: ['A','B','C','D'][i], text: x.lbl })),
        correctAnswer: correctLabel,
        explanation: `Wave speed v = fλ = ${f} × ${λ} = ${v} m/s. The wave equation v = fλ links frequency, wavelength, and speed.`,
        graphSvg: sineWaveGraph({ wavelength: λ }),
      };
    },
  },

  // ── Physics: kinetic energy ────────────────────────────────────────────────
  {
    id: 'phys-kinetic-energy',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'easy',
    params: {
      m: { min: 1, max: 10, step: 1, unit: 'kg' },
      v: { min: 2, max: 20, step: 2, unit: 'm/s' },
    },
    generate(p) {
      const { m, v } = p;
      const ke = 0.5 * m * v * v;
      const distractors = [m * v, 0.5 * m * v, m * v * v];
      const answers = [{ val: ke, correct: true }, ...distractors.map(x => ({ val: x, correct: false }))]
        .sort(() => 0.5 - Math.random());
      const correctLabel = ['A','B','C','D'][answers.findIndex(x => x.correct)];
      return {
        text: `An object of mass ${m} kg moves at ${v} m/s. What is its kinetic energy?`,
        options: answers.map((x, i) => ({ label: ['A','B','C','D'][i], text: `${x.val} J` })),
        correctAnswer: correctLabel,
        explanation: `KE = ½mv² = ½ × ${m} × ${v}² = ${ke} J. Doubling speed quadruples kinetic energy because of the v² term.`,
      };
    },
  },

  // ── Mathematics: linear equation ──────────────────────────────────────────
  {
    id: 'math-linear-eq',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'easy',
    params: {
      a: { min: 2, max: 8, step: 1 },
      b: { min: 3, max: 15, step: 1 },
      x: { min: 2, max: 9, step: 1 },   // the true answer
    },
    generate(p) {
      const { a, b, x } = p;
      const c = a * x + b;              // so: a*x + b = c  →  x = (c-b)/a
      const distractors = [x + 1, x - 1, x + 2].filter(d => d !== x && d > 0);
      const answers = [x, distractors[0], distractors[1], distractors[2]]
        .sort(() => 0.5 - Math.random());
      const correctLabel = ['A','B','C','D'][answers.indexOf(x)];
      return {
        text: `Solve for x: ${a}x + ${b} = ${c}`,
        options: answers.map((val, i) => ({ label: ['A','B','C','D'][i], text: `x = ${val}` })),
        correctAnswer: correctLabel,
        explanation: `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${c - b}/${a} = ${x}. Isolate the variable using inverse operations.`,
      };
    },
  },

  // ── Mathematics: probability ───────────────────────────────────────────────
  {
    id: 'math-probability',
    subject: 'Mathematics',
    topic: 'Probability',
    difficulty: 'easy',
    params: {
      red:   { min: 3, max: 8, step: 1 },
      blue:  { min: 2, max: 6, step: 1 },
      green: { min: 1, max: 4, step: 1 },
    },
    generate(p) {
      const { red, blue, green } = p;
      const total = red + blue + green;
      // Express as fraction in lowest terms
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const g = gcd(red, total);
      const num = red / g, den = total / g;
      const fracStr = den === 1 ? `${num}` : `${num}/${den}`;
      const decVal = Math.round((red / total) * 100) / 100;

      const distractors = [
        { n: blue, d: total },
        { n: green, d: total },
        { n: red, d: red + blue },
      ].map(({ n, d }) => { const g2 = gcd(n, d); return `${n / g2}/${d / g2}`; });

      const answers = [fracStr, ...distractors].sort(() => 0.5 - Math.random());
      const correctLabel = ['A','B','C','D'][answers.indexOf(fracStr)];
      return {
        text: `A bag contains ${red} red, ${blue} blue, and ${green} green balls. What is the probability of picking a red ball?`,
        options: answers.map((val, i) => ({ label: ['A','B','C','D'][i], text: val })),
        correctAnswer: correctLabel,
        explanation: `P(red) = red / total = ${red} / ${total} = ${fracStr} ≈ ${decVal}. Probability = favourable outcomes / total outcomes.`,
      };
    },
  },
];

// ── SVG graph helpers ─────────────────────────────────────────────────────────

/** Velocity–time graph: straight line from v0 to v1 over t seconds */
function velocityTimeGraph(p: { v0: number; v1: number; t: number }): string {
  const W = 240, H = 140, pad = 32;
  const xScale = (W - pad * 2) / p.t;
  const yScale = (H - pad * 2) / Math.max(p.v1, 1);
  const x1 = pad, y1 = H - pad - p.v0 * yScale;
  const x2 = pad + p.t * xScale, y2 = H - pad - p.v1 * yScale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#f8f9fe" rx="6"/>
  <!-- axes -->
  <line x1="${pad}" y1="${H-pad}" x2="${W-pad+4}" y2="${H-pad}" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="${pad}" y1="${H-pad}" x2="${pad}" y2="${pad-4}" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>
  <!-- data line -->
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6366f1" stroke-width="2.5"/>
  <!-- axis labels -->
  <text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="10" fill="#64748b">Time (s)</text>
  <text x="10" y="${H/2}" text-anchor="middle" font-size="10" fill="#64748b" transform="rotate(-90,10,${H/2})">Velocity (m/s)</text>
  <!-- tick labels -->
  <text x="${x2}" y="${H-pad+14}" text-anchor="middle" font-size="9" fill="#94a3b8">${p.t}s</text>
  <text x="${pad-4}" y="${y2+4}" text-anchor="end" font-size="9" fill="#94a3b8">${p.v1}</text>
</svg>`;
}

/** Simple sine wave diagram for wave questions */
function sineWaveGraph(p: { wavelength: number }): string {
  const W = 240, H = 100, pad = 20;
  const cycles = 2;
  const amplitude = (H - pad * 2) / 2;
  const cx = H / 2;
  const points: string[] = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const x = pad + ((W - pad * 2) * i) / steps;
    const y = cx - amplitude * Math.sin((2 * Math.PI * cycles * i) / steps);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#f8f9fe" rx="6"/>
  <line x1="${pad}" y1="${cx}" x2="${W-pad}" y2="${cx}" stroke="#cbd5e1" stroke-width="1"/>
  <path d="${points.join(' ')}" fill="none" stroke="#6366f1" stroke-width="2.5"/>
  <text x="${W/2}" y="${H-2}" text-anchor="middle" font-size="9" fill="#94a3b8">λ = ${p.wavelength} m (× ${cycles} cycles shown)</text>
</svg>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a Question variant from a template using an integer seed.
 * Same seed → same question every time (deterministic).
 * Pass `idOffset` to avoid ID collisions with the static question bank.
 */
export function sampleQuestion(
  template: QuestionTemplate,
  seed: number,
  idOffset = 10000,
): ParametricQuestion {
  const rand = seededRandom(seed);
  const sampledParams: Record<string, number> = {};
  for (const [key, range] of Object.entries(template.params)) {
    sampledParams[key] = sampleParam(range, rand);
  }
  const generated = template.generate(sampledParams);
  return {
    id: idOffset + seed,
    subject: template.subject,
    topic: template.topic,
    difficulty: template.difficulty,
    ...generated,
    graphSvg: generated.graphSvg,
    templateId: template.id,
    seed,
  };
}

/**
 * Generate N distinct variants from a template (seeds 0..N-1).
 * Useful for pre-filling a practice session with varied questions.
 */
export function sampleQuestions(
  template: QuestionTemplate,
  count: number,
  idOffset = 10000,
): ParametricQuestion[] {
  return Array.from({ length: count }, (_, i) => sampleQuestion(template, i, idOffset + i * 100));
}

/** All templates, indexed by subject */
export const templatesBySubject = {
  Physics:     templates.filter(t => t.subject === 'Physics'),
  Mathematics: templates.filter(t => t.subject === 'Mathematics'),
};

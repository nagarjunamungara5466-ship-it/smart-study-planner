import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import { sampleQuizQuestions } from '@/lib/defaults';
import { Modal, EmptyState } from '@/components/ui';
import { Field, SegmentedControl } from '@/components/primitives';
import { HelpCircle, Clock, Check, X, Plus, Trash2, Award, AlertTriangle } from 'lucide-react';

export function Quiz() {
  const { state, setState } = useStore();
  const [mode, setMode] = useState<'browse' | 'take'>('browse');
  const [category, setCategory] = useState<string>('Python');
  const [active, setActive] = useState<{ q: typeof sampleQuizQuestions; cat: string } | null>(null);
  const [addModal, setAddModal] = useState(false);

  const categories = ['Python', 'DSA', 'AI/ML', 'Academic'];
  const questions = sampleQuizQuestions;

  const startQuiz = (cat: string) => {
    const filtered = cat === 'Academic' ? questions.filter((q) => !['Python', 'DSA', 'AI/ML'].includes(q.category)) : questions.filter((q) => q.category === cat);
    if (filtered.length === 0) return;
    setActive({ q: filtered, cat });
    setMode('take');
  };

  const finishQuiz = (cat: string, score: number, total: number, weak: string[]) => {
    setState((s) => ({ ...s, quizResults: [...s.quizResults, { id: uid(), category: cat, score, total, date: new Date().toISOString().slice(0, 10), weakTopics: weak }] }));
    setActive(null);
    setMode('browse');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quiz & Mock Tests</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Practice with verified questions • {state.quizResults.length} attempts</p>
        </div>
      </div>

      {mode === 'browse' && (
        <>
          {/* Quiz categories */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = cat === 'Academic' ? questions.filter((q) => !['Python', 'DSA', 'AI/ML'].includes(q.category)).length : questions.filter((q) => q.category === cat).length;
              return (
                <button key={cat} onClick={() => startQuiz(cat)} className="card card-hover p-5 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)' }}>
                    <HelpCircle size={20} />
                  </div>
                  <h3 className="font-bold">{cat} Quiz</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{count} questions</p>
                  {count > 0 && <span className="btn btn-primary text-xs mt-3 w-full">Start Quiz</span>}
                </button>
              );
            })}
          </div>

          {/* Quiz history */}
          <div>
            <h3 className="section-title mb-3">Quiz History</h3>
            {state.quizResults.length === 0 ? (
              <div className="card p-6"><EmptyState icon={<Award size={32} />} title="No quiz attempts yet" message="Take your first quiz to see your performance history." /></div>
            ) : (
              <div className="space-y-2">
                {state.quizResults.slice().reverse().map((r) => {
                  const pct = (r.score / r.total) * 100;
                  return (
                    <div key={r.id} className="card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: pct >= 70 ? '#dcfce7' : pct >= 40 ? '#fef3c7' : '#fee2e2', color: pct >= 70 ? '#15803d' : pct >= 40 ? '#92400e' : '#b91c1c' }}>
                        {Math.round(pct)}%
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{r.category}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.score}/{r.total} • {r.date}</div>
                      </div>
                      {r.weakTopics.length > 0 && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#b91c1c' }}>
                          <AlertTriangle size={12} /> {r.weakTopics.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'take' && active && (
        <QuizRunner questions={active.q} category={active.cat} onFinish={finishQuiz} />
      )}
    </div>
  );
}

function QuizRunner({ questions, category, onFinish }: { questions: typeof sampleQuizQuestions; category: string; onFinish: (cat: string, score: number, total: number, weak: string[]) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(Date.now());

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const weak = questions.filter((q, i) => answers[i] !== q.correct).map((q) => q.question.split(' ').slice(0, 3).join(' '));

  if (submitted) {
    return (
      <div className="card p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3" style={{ backgroundColor: score / questions.length >= 0.7 ? '#dcfce7' : '#fef3c7', color: score / questions.length >= 0.7 ? '#15803d' : '#92400e' }}>
            {Math.round((score / questions.length) * 100)}%
          </div>
          <h2 className="text-xl font-bold">{score}/{questions.length} correct</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{category} quiz • {Math.round((Date.now() - startTime) / 1000)}s</p>
        </div>

        {weak.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 mb-4" style={{ color: '#92400e' }}>
            <div className="flex items-center gap-2 font-semibold text-sm mb-1"><AlertTriangle size={16} /> Weak topics to review:</div>
            <p className="text-xs">{weak.join(', ')}</p>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="p-4 rounded-lg bg-[var(--surface-2)]">
              <div className="font-semibold text-sm mb-2 flex items-start gap-2">
                {answers[i] === q.correct ? <Check size={16} className="text-green-500 mt-0.5 shrink-0" /> : <X size={16} className="text-red-500 mt-0.5 shrink-0" />}
                <span>{q.question}</span>
              </div>
              <div className="space-y-1 ml-6">
                {q.options.map((opt, j) => (
                  <div key={j} className={`text-xs px-2 py-1 rounded ${j === q.correct ? 'bg-green-100 text-green-700' : j === answers[i] ? 'bg-red-100 text-red-700' : ''}`}>
                    {opt} {j === q.correct && '✓'}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2 ml-6" style={{ color: 'var(--text-muted)' }}>{q.explanation}</p>
              {q.aiGenerated && <span className="badge bg-purple-100 text-purple-700 ml-6 mt-1">AI-generated</span>}
            </div>
          ))}
        </div>

        <button className="btn btn-primary w-full mt-6" onClick={() => onFinish(category, score, questions.length, weak)}>Done</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">{category} Quiz</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Question {current + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Clock size={16} /> {Math.round((Date.now() - startTime) / 1000)}s
        </div>
      </div>

      <div className="card p-6">
        <div className="h-1.5 rounded-full bg-[var(--surface-2)] mb-4 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%`, backgroundColor: 'var(--primary)' }} />
        </div>
        <p className="font-semibold mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, j) => (
            <button
              key={j}
              onClick={() => setAnswers({ ...answers, [current]: j })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${answers[current] === j ? 'border-[var(--primary)] bg-blue-50' : 'hover:bg-[var(--surface-2)]'}`}
              style={{ borderColor: answers[current] === j ? 'var(--primary)' : 'var(--border)' }}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + j)}.</span> {opt}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button className="btn btn-ghost" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>Previous</button>
          {current < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(current + 1)} disabled={answers[current] === undefined}>Next</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}

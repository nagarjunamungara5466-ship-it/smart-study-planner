import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Field } from '@/components/primitives';
import { GraduationCap, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const steps = ['Semester', 'Subjects', 'Exams', 'Schedule', 'Goals'];

export function SetupWizard({ onDone }: { onDone: () => void }) {
  const { state, setState } = useStore();
  const [step, setStep] = useState(0);
  const [semester, setSemester] = useState(state.profile.semester);
  const [subjects, setSubjects] = useState('Data Structures and Algorithms\nOperating Systems\nDatabase Management Systems\nComputer Networks');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [dailyHours, setDailyHours] = useState(String(state.profile.dailyHours));
  const [timing, setTiming] = useState(state.profile.preferredTimings);
  const [goals, setGoals] = useState(state.profile.careerObjective);

  const finish = () => {
    const subId = () => Math.random().toString(36).slice(2, 10);
    const subjList = subjects.split('\n').map((s) => s.trim()).filter(Boolean);
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        semester,
        dailyHours: Number(dailyHours) || 2,
        preferredTimings: timing,
        careerObjective: goals,
        setupComplete: true,
      },
      academicYears: s.academicYears.map((y) => ({
        ...y,
        semesters: y.semesters.map((sem) =>
          sem.active
            ? {
                ...sem,
                name: semester,
                subjects: subjList.length > 0
                  ? subjList.map((name, i) => ({
                      id: subId(),
                      name,
                      code: `CS${301 + i}`,
                      credits: 3,
                      faculty: '',
                      syllabus: '',
                      units: [],
                      internalMarks: '',
                      prepPercentage: 0,
                      difficult: false,
                      attendance: 0,
                      materials: [],
                    }))
                  : sem.subjects,
              }
            : sem
        ),
      })),
      exams: examName && examDate
        ? [...s.exams, { id: subId(), name: examName, type: examType as 'midterm', subjectId: '', date: examDate, time: '10:00', syllabus: '', totalMarks: 25, prepStatus: 0, difficulty: 'medium' as const }]
        : s.exams,
    }));
    onDone();
  };

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : finish());
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card w-full max-w-xl p-6 lg:p-8 animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--primary)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome to Smart Study Planner</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Let's set up your learning system</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: i < step ? '#22c55e' : i === step ? 'var(--primary)' : 'var(--surface-2)',
                  color: i <= step ? 'white' : 'var(--text-muted)',
                }}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="h-0.5 flex-1" style={{ backgroundColor: i < step ? '#22c55e' : 'var(--surface-2)' }} />
              )}
            </div>
          ))}
        </div>

        <h2 className="font-bold text-lg mb-4">{steps[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <Field label="Current Semester (e.g. 3-1)">
              <input className="input" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </Field>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Demo data is preloaded. You can edit everything later.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Your subjects (one per line)">
              <textarea className="input min-h-[140px]" value={subjects} onChange={(e) => setSubjects(e.target.value)} />
            </Field>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These will replace the demo subjects in your active semester.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add an upcoming exam (optional — you can add more later).</p>
            <Field label="Exam name">
              <input className="input" placeholder="e.g. DSA Mid-1" value={examName} onChange={(e) => setExamName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className="input" value={examType} onChange={(e) => setExamType(e.target.value)}>
                  <option value="internal">Internal</option>
                  <option value="midterm">Midterm</option>
                  <option value="practical">Practical</option>
                  <option value="semester_end">Semester End</option>
                  <option value="lab">Lab</option>
                  <option value="viva">Viva</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Date">
                <input type="date" className="input" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label="Daily available study hours">
              <input type="number" min="0.5" max="12" step="0.5" className="input" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} />
            </Field>
            <Field label="Preferred study timing">
              <select className="input" value={timing} onChange={(e) => setTiming(e.target.value)}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
                <option>Night</option>
                <option>Flexible</option>
              </select>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Career goal">
              <textarea className="input min-h-[80px]" value={goals} onChange={(e) => setGoals(e.target.value)} />
            </Field>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>You can complete setup now — a weekly timetable will be generated automatically.</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button className="btn btn-ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={finish}>Skip & finish</button>
            <button className="btn btn-primary" onClick={next}>
              {step === steps.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

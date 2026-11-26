import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { Exam } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState } from '@/components/ui';
import { Field, ProgressBar } from '@/components/primitives';
import { BarChart } from '@/components/charts';
import { daysBetween, formatDate, todayISO, addDays } from '@/lib/utils';
import { GraduationCap, Plus, Edit2, Trash2, Clock, Calendar } from 'lucide-react';

const examTypeLabels: Record<string, string> = {
  internal: 'Internal', midterm: 'Midterm', practical: 'Practical',
  semester_end: 'Semester End', lab: 'Lab', viva: 'Viva', other: 'Other',
};

export function Exams() {
  const { state, setState } = useStore();
  const today = todayISO();
  const [modal, setModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [deleteExam, setDeleteExam] = useState<Exam | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => daysBetween(today, e.date) >= 0);
  const past = sorted.filter((e) => daysBetween(today, e.date) < 0);

  const save = (exam: Exam) => {
    setState((s) => ({
      ...s,
      exams: s.exams.some((e) => e.id === exam.id) ? s.exams.map((e) => (e.id === exam.id ? exam : e)) : [...s.exams, exam],
      events: s.events.some((ev) => ev.title === exam.name && ev.type === 'exam')
        ? s.events.map((ev) => ev.title === exam.name && ev.type === 'exam' ? { ...ev, date: exam.date, time: exam.time } : ev)
        : [...s.events, { id: uid(), title: exam.name, date: exam.date, type: 'exam', time: exam.time }],
    }));
    setModal(false);
    setEditExam(null);
  };

  const remove = (id: string) => {
    setState((s) => ({ ...s, exams: s.exams.filter((e) => e.id !== id) }));
  };

  const selected = selectedId ? state.exams.find((e) => e.id === selectedId) : null;

  // Prep timetable for selected exam
  const prepPlan = (exam: Exam) => {
    const days = Math.max(1, daysBetween(today, exam.date));
    const remaining = 100 - exam.prepStatus;
    const perDay = Math.ceil(remaining / days);
    const plan: { day: string; focus: string; target: number }[] = [];
    for (let i = 0; i < Math.min(days, 14); i++) {
      const d = addDays(today, i);
      plan.push({ day: formatDate(d), focus: i === days - 1 ? 'Final revision + mock test' : i % 3 === 2 ? 'Revision + practice questions' : 'New topics + notes', target: Math.min(remaining, perDay * (i + 1)) });
    }
    return plan;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Examination Planner</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{upcoming.length} upcoming • {past.length} completed</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExam(null); setModal(true); }}><Plus size={16} /> Add Exam</button>
      </div>

      {/* Countdown cards */}
      {upcoming.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {upcoming.slice(0, 4).map((e) => {
            const days = daysBetween(today, e.date);
            return (
              <button key={e.id} onClick={() => setSelectedId(e.id)} className="card card-hover p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{examTypeLabels[e.type]}</span>
                  <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="text-3xl font-bold" style={{ color: days <= 7 ? '#ef4444' : 'var(--primary)' }}>{days}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>days remaining</div>
                <div className="font-semibold text-sm mt-2 truncate">{e.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(e.date)} • {e.time}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Exam list */}
      <div>
        <h3 className="section-title mb-3">All Exams (chronological)</h3>
        {sorted.length === 0 ? (
          <div className="card p-6"><EmptyState icon={<GraduationCap size={32} />} title="No exams" message="Add your exams to get countdowns and preparation plans." /></div>
        ) : (
          <div className="space-y-3">
            {sorted.map((e) => {
              const days = daysBetween(today, e.date);
              const isPast = days < 0;
              return (
                <div key={e.id} className={`card p-4 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center px-3 py-2 rounded-lg shrink-0" style={{ backgroundColor: isPast ? 'var(--surface-2)' : days <= 7 ? '#fee2e2' : '#dbeafe', color: isPast ? 'var(--text-muted)' : days <= 7 ? '#b91c1c' : '#1d4ed8' }}>
                      <div className="text-xl font-bold">{Math.abs(days)}</div>
                      <div className="text-[9px]">{isPast ? 'days ago' : 'days left'}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{e.name}</span>
                        <span className="badge bg-[var(--surface-2)]" style={{ color: 'var(--text-muted)' }}>{examTypeLabels[e.type]}</span>
                        {e.totalMarks > 0 && <span className="badge bg-[var(--surface-2)]" style={{ color: 'var(--text-muted)' }}>{e.totalMarks} marks</span>}
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(e.date)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {e.time}</span>
                        {e.syllabus && <span>• {e.syllabus}</span>}
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>Preparation</span>
                          <span className="font-semibold">{e.prepStatus}%</span>
                        </div>
                        <ProgressBar value={e.prepStatus} color={e.prepStatus < 40 ? '#ef4444' : e.prepStatus < 70 ? '#f59e0b' : '#22c55e'} />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => setSelectedId(e.id)}>View</button>
                      <button className="p-2 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => { setEditExam(e); setModal(true); }}><Edit2 size={16} /></button>
                      <button className="p-2 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteExam(e)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exam detail modal with prep timetable */}
      {selected && (
        <Modal open onClose={() => setSelectedId(null)} title={selected.name} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoBox label="Days left" value={String(daysBetween(today, selected.date))} />
              <InfoBox label="Total marks" value={String(selected.totalMarks)} />
              <InfoBox label="Preparation" value={`${selected.prepStatus}%`} />
              <InfoBox label="Difficulty" value={selected.difficulty} />
            </div>
            {selected.syllabus && <p className="text-sm p-3 rounded-lg bg-[var(--surface-2)]">Syllabus: {selected.syllabus}</p>}

            <div>
              <h4 className="font-semibold mb-2">Preparation Timetable</h4>
              <div className="space-y-2">
                {prepPlan(selected).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                    <div className="text-xs font-semibold w-24 shrink-0" style={{ color: 'var(--primary)' }}>{p.day}</div>
                    <div className="flex-1 text-sm">{p.focus}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{Math.min(100, p.target)}% goal</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal && <ExamModal exam={editExam} onClose={() => setModal(false)} onSave={save} />}
      <ConfirmModal open={!!deleteExam} onClose={() => setDeleteExam(null)} onConfirm={() => deleteExam && remove(deleteExam.id)} title="Delete Exam" message={`Delete "${deleteExam?.name}"?`} />
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-[var(--surface-2)]">
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}

function ExamModal({ exam, onClose, onSave }: { exam: Exam | null; onClose: () => void; onSave: (e: Exam) => void }) {
  const { state } = useStore();
  const subjects = state.academicYears.flatMap((y) => y.semesters).flatMap((s) => s.subjects);
  const [form, setForm] = useState<Exam>(exam ?? {
    id: uid(), name: '', type: 'midterm', subjectId: '', date: todayISO(), time: '10:00',
    syllabus: '', totalMarks: 25, prepStatus: 0, difficulty: 'medium',
  });
  return (
    <Modal open onClose={onClose} title={exam ? 'Edit Exam' : 'Add Exam'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Exam name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. DSA Mid-1" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Exam['type'] })}>
              {Object.entries(examTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Subject (optional)">
            <select className="input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">—</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Time"><input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
        </div>
        <Field label="Syllabus covered"><input className="input" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} placeholder="e.g. Units 1-2" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Total marks"><input type="number" className="input" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} /></Field>
          <Field label="Prep %"><input type="number" min="0" max="100" className="input" value={form.prepStatus} onChange={(e) => setForm({ ...form, prepStatus: Number(e.target.value) })} /></Field>
          <Field label="Difficulty">
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Exam['difficulty'] })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

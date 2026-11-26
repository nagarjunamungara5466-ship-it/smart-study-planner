import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { Task, Priority, Difficulty } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState, StatusBadge } from '@/components/ui';
import { Field } from '@/components/primitives';
import { todayISO, formatDate, daysBetween } from '@/lib/utils';
import { Plus, Edit2, Trash2, Play, Pause, Check, CalendarClock, AlertCircle, Clock } from 'lucide-react';

const categories = ['Academic', 'Programming', 'AI/ML', 'Revision', 'Other'];

export function Planner() {
  const { state, setState } = useStore();
  const today = todayISO();
  const [modal, setModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [dateFilter, setDateFilter] = useState(today);
  const [autoGen, setAutoGen] = useState(false);

  const dayTasks = state.tasks.filter((t) => t.date === dateFilter).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const completedTasks = dayTasks.filter((t) => t.completed);
  const pendingTasks = dayTasks.filter((t) => !t.completed);

  const save = (task: Task) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === task.id) ? s.tasks.map((t) => (t.id === task.id ? task : t)) : [...s.tasks, task],
    }));
    setModal(false);
    setEditTask(null);
  };

  const remove = (id: string) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

  const toggleComplete = (id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'not_started' } : t),
    }));
    // Log study hours
    const task = state.tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      const hours = task.duration / 60;
      setState((s) => {
        const existing = s.studyLogs.find((l) => l.date === task.date);
        return {
          ...s,
          studyLogs: existing
            ? s.studyLogs.map((l) => l.date === task.date ? { ...l, hours: l.hours + hours } : l)
            : [...s.studyLogs, { date: task.date, hours }],
        };
      });
    }
  };

  const setStatus = (id: string, status: Task['status']) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, status } : t) }));

  const rescheduleMissed = () => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => {
        if (!t.completed && daysBetween(t.date, today) < 0) {
          return { ...t, date: today, status: 'not_started' as const };
        }
        return t;
      }),
    }));
  };

  // Auto-generate daily timetable
  const generateDay = () => {
    const hours = state.profile.dailyHours;
    const totalMin = hours * 60;
    // Split: 40% academic, 25% programming, 20% AI/ML, 15% revision
    const splits = [
      { cat: 'Academic', pct: 0.40, title: 'College subject study', desc: 'Review today\'s subject topics and notes' },
      { cat: 'Programming', pct: 0.25, title: 'Programming practice', desc: 'Solve coding exercises on current topic' },
      { cat: 'AI/ML', pct: 0.20, title: 'AI/ML learning', desc: 'Watch tutorial + take notes on current roadmap topic' },
      { cat: 'Revision', pct: 0.15, title: 'Revision & mock test', desc: 'Revise previous topics and attempt a quick quiz' },
    ];
    const startHour = state.profile.preferredTimings === 'Morning' ? 7 : state.profile.preferredTimings === 'Afternoon' ? 14 : state.profile.preferredTimings === 'Night' ? 20 : 18;
    let cursor = startHour * 60;
    const newTasks: Task[] = splits.map((sp) => {
      const dur = Math.round(totalMin * sp.pct);
      const start = `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`;
      cursor += dur;
      const end = `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`;
      return {
        id: uid(), title: sp.title, category: sp.cat, description: sp.desc,
        date: dateFilter, startTime: start, endTime: end, duration: dur,
        priority: sp.cat === 'Academic' ? 'high' : 'medium', difficulty: 'medium',
        status: 'not_started', notes: '', completed: false, subjectId: '',
      };
    });
    setState((s) => ({ ...s, tasks: [...s.tasks, ...newTasks] }));
    setAutoGen(false);
  };

  const missedTasks = state.tasks.filter((t) => !t.completed && daysBetween(t.date, today) < 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Smart Daily Planner</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{state.profile.dailyHours}h available • {pendingTasks.length} pending today</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setAutoGen(true)}><CalendarClock size={16} /> Auto-generate</button>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setModal(true); }}><Plus size={16} /> Add Task</button>
        </div>
      </div>

      {/* Date selector */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <input type="date" className="input w-auto" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="btn btn-ghost text-sm" onClick={() => setDateFilter(today)}>Today</button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(dateFilter)}</span>
        {missedTasks.length > 0 && (
          <button className="btn btn-ghost text-sm ml-auto" onClick={rescheduleMissed} style={{ color: '#f59e0b' }}>
            <AlertCircle size={14} /> {missedTasks.length} missed — reschedule
          </button>
        )}
      </div>

      {/* Missed tasks */}
      {missedTasks.length > 0 && (
        <div className="card p-4" style={{ borderColor: '#fbbf24' }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: '#92400e' }}>Missed Tasks</h3>
          <div className="space-y-2">
            {missedTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-2)]">
                <AlertCircle size={16} className="text-amber-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(t.date)} • {t.category}</div>
                </div>
                <button className="btn btn-ghost text-xs py-1" onClick={() => { setState((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? { ...x, date: today } : x) })); }}>Move to today</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Study Timeline</h3>
        {dayTasks.length === 0 ? (
          <EmptyState icon={<CalendarClock size={32} />} title="No tasks scheduled" message="Add tasks or auto-generate a timetable for this day." action={<button className="btn btn-primary" onClick={generateDay}><CalendarClock size={16} /> Generate timetable</button>} />
        ) : (
          <div className="space-y-2">
            {dayTasks.map((t) => (
              <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${t.completed ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
                <div className="text-center w-16 shrink-0">
                  <div className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{t.startTime}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.endTime}</div>
                </div>
                <div className="w-px h-10" style={{ backgroundColor: 'var(--border)' }} />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${t.completed ? 'line-through' : ''}`}>{t.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.category} • {t.duration}min</div>
                </div>
                <div className="flex gap-1">
                  {!t.completed && t.status !== 'in_progress' && (
                    <button className="p-2 rounded-lg hover:bg-[var(--surface)]" title="Start" onClick={() => setStatus(t.id, 'in_progress')}><Play size={16} /></button>
                  )}
                  {!t.completed && t.status === 'in_progress' && (
                    <button className="p-2 rounded-lg hover:bg-[var(--surface)]" title="Pause" onClick={() => setStatus(t.id, 'not_started')}><Pause size={16} /></button>
                  )}
                  <button className={`p-2 rounded-lg hover:bg-[var(--surface)] ${t.completed ? 'text-green-500' : ''}`} title="Complete" onClick={() => toggleComplete(t.id)}><Check size={16} /></button>
                  <button className="p-2 rounded-lg hover:bg-[var(--surface)]" onClick={() => { setEditTask(t); setModal(true); }}><Edit2 size={14} /></button>
                  <button className="p-2 rounded-lg hover:bg-[var(--surface)] text-red-500" onClick={() => setDeleteTask(t)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {dayTasks.length > 0 && (
          <div className="mt-4 flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>{completedTasks.length}/{dayTasks.length} completed</span>
            <span>{(dayTasks.reduce((a, b) => a + b.duration, 0) / 60).toFixed(1)}h total</span>
          </div>
        )}
      </div>

      {autoGen && (
        <Modal open onClose={() => setAutoGen(false)} title="Auto-generate timetable" footer={<>
          <button className="btn btn-ghost" onClick={() => setAutoGen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={generateDay}>Generate for {formatDate(dateFilter)}</button>
        </>}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            This will create {state.profile.dailyHours}h of tasks split between Academic (40%), Programming (25%), AI/ML (20%) and Revision (15%) based on your daily available hours. You can edit each task afterwards.
          </p>
        </Modal>
      )}

      {modal && <TaskModal task={editTask} defaultDate={dateFilter} onClose={() => setModal(false)} onSave={save} />}
      <ConfirmModal open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={() => deleteTask && remove(deleteTask.id)} title="Delete Task" message={`Delete "${deleteTask?.title}"?`} />
    </div>
  );
}

export function TaskModal({ task, defaultDate, onClose, onSave }: { task: Task | null; defaultDate: string; onClose: () => void; onSave: (t: Task) => void }) {
  const [form, setForm] = useState<Task>(task ?? {
    id: uid(), title: '', category: 'Academic', description: '', date: defaultDate,
    startTime: '18:00', endTime: '18:45', duration: 45, priority: 'medium',
    difficulty: 'medium', status: 'not_started', notes: '', completed: false, subjectId: '',
  });

  const calcDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  };

  return (
    <Modal open onClose={onClose} title={task ? 'Edit Task' : 'Add Task'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => form.title && onSave(form)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Task title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Practice Python loops" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        </div>
        <Field label="Description"><textarea className="input min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time"><input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value, duration: calcDuration(e.target.value, form.endTime) })} /></Field>
          <Field label="End time"><input type="time" className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value, duration: calcDuration(form.startTime, e.target.value) })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </Field>
          <Field label="Difficulty">
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </Field>
        </div>
        <Field label="Notes (optional)"><textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { TaskStatus } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState, StatusBadge } from '@/components/ui';
import { TaskModal } from '@/pages/Planner';
import { Field } from '@/components/primitives';
import { todayISO, formatDate, daysBetween } from '@/lib/utils';
import { Plus, Edit2, Trash2, Check, Search, AlertCircle, CheckSquare } from 'lucide-react';

const categories = ['All', 'Academic', 'Programming', 'AI/ML', 'Revision', 'Other'];

export function Tasks() {
  const { state, setState } = useStore();
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('All');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [search, setSearch] = useState('');

  const today = todayISO();

  const filtered = state.tasks.filter((t) => {
    if (filterCat !== 'All' && t.category !== filterCat) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterDate === 'today' && t.date !== today) return false;
    if (filterDate === 'overdue' && !(daysBetween(today, t.date) < 0 && !t.completed)) return false;
    if (filterDate === 'upcoming' && !(daysBetween(today, t.date) > 0 && !t.completed)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const overdue = state.tasks.filter((t) => !t.completed && daysBetween(today, t.date) < 0);

  const toggleComplete = (id: string) => {
    const task = state.tasks.find((t) => t.id === id);
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'not_started' } : t) }));
    if (task && !task.completed) {
      const hours = task.duration / 60;
      setState((s) => {
        const existing = s.studyLogs.find((l) => l.date === task.date);
        return { ...s, studyLogs: existing ? s.studyLogs.map((l) => l.date === task.date ? { ...l, hours: l.hours + hours } : l) : [...s.studyLogs, { date: task.date, hours }] };
      });
    }
  };

  const remove = (id: string) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

  const save = (t: typeof state.tasks[0]) => {
    setState((s) => ({ ...s, tasks: s.tasks.some((x) => x.id === t.id) ? s.tasks.map((x) => x.id === t.id ? t : x) : [...s.tasks, t] }));
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{state.tasks.length} total • {overdue.length} overdue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Task</button>
      </div>

      {/* Overdue section */}
      {overdue.length > 0 && (
        <div className="card p-4" style={{ borderColor: '#fbbf24' }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#92400e' }}><AlertCircle size={16} /> Missed Tasks ({overdue.length})</h3>
          <div className="space-y-2">
            {overdue.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)]">
                <button className="p-1 rounded hover:bg-[var(--surface)]" onClick={() => toggleComplete(t.id)}><Check size={16} /></button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(t.date)} • {t.category}</div>
                </div>
                <span className="badge bg-red-100 text-red-700">{Math.abs(daysBetween(today, t.date))}d late</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input w-auto" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="input w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card p-6"><EmptyState icon={<CheckSquare size={32} />} title="No tasks found" message="Add a task or adjust your filters." /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const isOverdue = !t.completed && daysBetween(today, t.date) < 0;
            const status: TaskStatus = t.completed ? 'completed' : isOverdue ? 'overdue' : t.status === 'in_progress' ? 'in_progress' : 'not_started';
            return (
              <div key={t.id} className={`card p-4 flex items-center gap-3 ${t.completed ? 'opacity-50' : ''}`}>
                <button className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${t.completed ? 'bg-green-500 border-green-500' : ''}`} onClick={() => toggleComplete(t.id)}>
                  {t.completed && <Check size={14} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${t.completed ? 'line-through' : ''}`}>{t.title}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                    <span>{t.category}</span>
                    <span>•</span>
                    <span>{formatDate(t.date)}</span>
                    {t.description && <><span>•</span><span className="truncate">{t.description}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={status} />
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => setModal(true)}><Edit2 size={14} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteId(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && <TaskModal task={null} defaultDate={today} onClose={() => setModal(false)} onSave={save} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Task" message="Delete this task?" />
    </div>
  );
}

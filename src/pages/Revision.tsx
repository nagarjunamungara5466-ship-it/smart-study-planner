import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { RevisionItem } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState } from '@/components/ui';
import { Field } from '@/components/primitives';
import { todayISO, formatDate, addDays, daysBetween } from '@/lib/utils';
import { RotateCcw, Plus, Trash2, Check, Calendar } from 'lucide-react';

const intervals = [0, 1, 3, 7, 14, 30];
const labels = ['1st (same day)', '2nd (+1d)', '3rd (+3d)', '4th (+7d)', '5th (+14d)', '6th (+30d)'];

export function Revision() {
  const { state, setState } = useStore();
  const today = todayISO();
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dueToday = state.revisions.filter((r) => r.revisions.some((rev) => rev.date === today && !rev.done));
  const upcoming = state.revisions.filter((r) => r.revisions.some((rev) => daysBetween(today, rev.date) > 0 && !rev.done) && !r.revisions.some((rev) => rev.date === today && !rev.done));

  const toggleRev = (id: string, idx: number) => {
    setState((s) => ({
      ...s,
      revisions: s.revisions.map((r) => r.id === id ? { ...r, revisions: r.revisions.map((rev, i) => i === idx ? { ...rev, done: !rev.done } : rev) } : r),
    }));
  };

  const addRevision = (topic: string, subjectId: string, date: string) => {
    const item: RevisionItem = {
      id: uid(), topic, subjectId, originalDate: date,
      revisions: intervals.map((d, i) => ({ label: labels[i], date: addDays(date, d), done: false })),
    };
    setState((s) => ({ ...s, revisions: [...s.revisions, item] }));
    setModal(false);
  };

  const remove = (id: string) => setState((s) => ({ ...s, revisions: s.revisions.filter((r) => r.id !== id) }));

  const subjects = state.academicYears.flatMap((y) => y.semesters).flatMap((s) => s.subjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Smart Revision System</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Spaced repetition • {dueToday.length} due today</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Revision Topic</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <RotateCcw size={16} />
          <span>Schedule: 1st same day → +1 → +3 → +7 → +14 → +30 days</span>
        </div>
      </div>

      {/* Due today */}
      <div>
        <h3 className="section-title mb-3">Due Today ({dueToday.length})</h3>
        {dueToday.length === 0 ? (
          <div className="card p-6"><EmptyState icon={<Check size={32} />} title="Nothing to revise today" message="You're all caught up with revisions." /></div>
        ) : (
          <div className="space-y-2">
            {dueToday.map((r) => {
              const dueRev = r.revisions.find((rev) => rev.date === today && !rev.done);
              return (
                <div key={r.id} className="card p-4 flex items-center gap-3">
                  <button className="w-7 h-7 rounded-full border-2 flex items-center justify-center hover:bg-green-50 hover:border-green-500" onClick={() => toggleRev(r.id, r.revisions.indexOf(dueRev!))} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r.topic}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{dueRev?.label} • original: {formatDate(r.originalDate)}</div>
                  </div>
                  <span className="badge bg-amber-100 text-amber-700">Due now</span>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="section-title mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map((r) => {
              const nextRev = r.revisions.find((rev) => !rev.done);
              return (
                <div key={r.id} className="card p-4 flex items-center gap-3">
                  <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r.topic}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Next: {nextRev ? formatDate(nextRev.date) : '—'} ({nextRev?.label})</div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full revision schedule */}
      <div>
        <h3 className="section-title mb-3">All Revision Topics</h3>
        <div className="space-y-3">
          {state.revisions.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-sm">{r.topic}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>started {formatDate(r.originalDate)}</span>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.revisions.map((rev, i) => {
                  const days = daysBetween(today, rev.date);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleRev(r.id, i)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${rev.done ? 'bg-green-100 text-green-700 border-green-300' : days === 0 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-[var(--surface-2)]'}`}
                      style={!rev.done && days !== 0 ? { borderColor: 'var(--border)' } : {}}
                    >
                      {rev.done && <Check size={10} className="inline mr-1" />}
                      {rev.label}
                      <span className="block text-[9px] opacity-70">{formatDate(rev.date)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && <RevisionModal subjects={subjects} onClose={() => setModal(false)} onSave={addRevision} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Revision" message="Delete this revision topic and its schedule?" />
    </div>
  );
}

function RevisionModal({ subjects, onClose, onSave }: { subjects: { id: string; name: string }[]; onClose: () => void; onSave: (topic: string, subjectId: string, date: string) => void }) {
  const [topic, setTopic] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(todayISO());
  return (
    <Modal open onClose={onClose} title="Add Revision Topic" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => topic && onSave(topic, subjectId, date)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Topic name"><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Python Functions" /></Field>
        <Field label="Subject (optional)">
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">—</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Original learning date"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revisions will be auto-scheduled: same day, +1, +3, +7, +14, +30 days.</p>
      </div>
    </Modal>
  );
}

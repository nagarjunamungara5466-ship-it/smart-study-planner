import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import { Modal, ConfirmModal } from '@/components/ui';
import { Field } from '@/components/primitives';
import { Plus, Trash2, Check, Briefcase, Target, Link as LinkIcon } from 'lucide-react';

const areas = ['Python programming', 'DSA', 'Problem-solving', 'Technical interview preparation', 'Aptitude', 'Logical reasoning', 'Communication skills', 'Spoken English', 'Resume preparation', 'GitHub portfolio', 'Projects', 'Internship preparation', 'Mock interviews'];

const freeResources: Record<string, string> = {
  'Python programming': 'https://www.hackerrank.com/domains/python',
  'DSA': 'https://neetcode.io/roadmap',
  'Problem-solving': 'https://leetcode.com/',
  'Aptitude': 'https://www.indiabix.com/',
  'Logical reasoning': 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
  'Resume preparation': 'https://novoresume.com/',
  'GitHub portfolio': 'https://docs.github.com/en/pages',
  'Mock interviews': 'https://www.pramp.com/',
};

export function Career() {
  const { state, setState } = useStore();
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleDone = (id: string) => setState((s) => ({ ...s, careerTargets: s.careerTargets.map((t) => t.id === id ? { ...t, done: !t.done } : t) }));
  const remove = (id: string) => setState((s) => ({ ...s, careerTargets: s.careerTargets.filter((t) => t.id !== id) }));
  const add = (area: string, target: string) => {
    setState((s) => ({ ...s, careerTargets: [...s.careerTargets, { id: uid(), area, target, done: false }] }));
    setModal(false);
  };

  const done = state.careerTargets.filter((t) => t.done).length;
  const pct = state.careerTargets.length > 0 ? (done / state.careerTargets.length) * 100 : 0;

  // Group by area
  const grouped = state.careerTargets.reduce((acc, t) => {
    (acc[t.area] = acc[t.area] || []).push(t);
    return acc;
  }, {} as Record<string, typeof state.careerTargets>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase size={24} style={{ color: 'var(--primary)' }} /> Career Preparation</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Placement prep • {done}/{state.careerTargets.length} targets done ({Math.round(pct)}%)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Target</button>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">Weekly Career Preparation Progress</span>
          <span style={{ color: 'var(--text-muted)' }}>{Math.round(pct)}%</span>
        </div>
        <div className="h-3 rounded-full bg-[var(--surface-2)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }} />
        </div>
      </div>

      {/* Prep areas grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => {
          const targets = grouped[area] || [];
          const areaDone = targets.filter((t) => t.done).length;
          return (
            <div key={area} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{area}</h4>
                {freeResources[area] && (
                  <a href={freeResources[area]} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                    <LinkIcon size={12} /> Resource
                  </a>
                )}
              </div>
              {targets.length === 0 ? (
                <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No targets yet.</p>
              ) : (
                <div className="space-y-2">
                  {targets.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleDone(t.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${t.done ? 'bg-green-500 border-green-500' : ''}`}
                      >
                        {t.done && <Check size={12} className="text-white" />}
                      </button>
                      <span className={`text-xs flex-1 ${t.done ? 'line-through opacity-50' : ''}`}>{t.target}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-red-500" onClick={() => setDeleteId(t.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              {targets.length > 0 && (
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{areaDone}/{targets.length} done</div>
              )}
            </div>
          );
        })}
      </div>

      {modal && <TargetModal onClose={() => setModal(false)} onSave={add} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Target" message="Delete this career target?" />
    </div>
  );
}

function TargetModal({ onClose, onSave }: { onClose: () => void; onSave: (area: string, target: string) => void }) {
  const [area, setArea] = useState(areas[0]);
  const [target, setTarget] = useState('');
  return (
    <Modal open onClose={onClose} title="Add Career Target" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => target && onSave(area, target)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Area">
          <select className="input" value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Weekly target"><input className="input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. Solve 15 problems" /></Field>
      </div>
    </Modal>
  );
}

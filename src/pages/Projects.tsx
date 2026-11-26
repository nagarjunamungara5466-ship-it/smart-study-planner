import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { Project } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState, ProgressRing } from '@/components/ui';
import { Field, ProgressBar } from '@/components/primitives';
import { todayISO, formatDate, daysBetween } from '@/lib/utils';
import { Plus, Edit2, Trash2, FolderKanban, Link as LinkIcon, FileText } from 'lucide-react';

export function Projects() {
  const { state, setState } = useStore();
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const save = (p: Project) => {
    setState((s) => ({
      ...s,
      projects: s.projects.some((x) => x.id === p.id) ? s.projects.map((x) => x.id === p.id ? p : x) : [...s.projects, p],
      events: s.events.some((e) => e.title === p.title && e.type === 'project') ? s.events.map((e) => e.title === p.title && e.type === 'project' ? { ...e, date: p.deadline } : e) : [...s.events, { id: uid(), title: p.title, date: p.deadline, type: 'project', time: '23:59' }],
    }));
    setModal(false); setEdit(null);
  };

  const remove = (id: string) => setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }));

  const sorted = [...state.projects].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const today = todayISO();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Project & Assignment Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{state.projects.length} projects • {state.projects.filter((p) => p.completion < 100).length} in progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true); }}><Plus size={16} /> Add Project</button>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-6"><EmptyState icon={<FolderKanban size={32} />} title="No projects yet" message="Track college mini-projects, CSP, lab assignments, seminars and more." action={<button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true); }}><Plus size={16} /> Add Project</button>} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((p) => {
            const days = daysBetween(today, p.deadline);
            return (
              <div key={p.id} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{p.title}</h3>
                    <span className="badge bg-[var(--surface-2)] mt-1" style={{ color: 'var(--text-muted)' }}>{p.type}</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => { setEdit(p); setModal(true); }}><Edit2 size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteId(p.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <ProgressRing value={p.completion} size={64} stroke={6} color={p.completion === 100 ? '#22c55e' : 'var(--primary)'} />
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Deadline</div>
                    <div className="font-semibold text-sm">{formatDate(p.deadline)}</div>
                    <div className={`text-xs ${days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : ''}`} style={days >= 0 && days > 7 ? { color: 'var(--text-muted)' } : {}}>
                      {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
                    </div>
                  </div>
                </div>
                {p.notes && <div className="text-xs p-2 rounded-lg bg-[var(--surface-2)] mb-2 flex items-start gap-2"><FileText size={14} className="mt-0.5 shrink-0" />{p.notes}</div>}
                {p.links && <a href={p.links} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: 'var(--primary)' }}><LinkIcon size={12} /> Open document</a>}
              </div>
            );
          })}
        </div>
      )}

      {modal && <ProjectModal project={edit} onClose={() => setModal(false)} onSave={save} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} title="Delete Project" message="Delete this project?" />
    </div>
  );
}

function ProjectModal({ project, onClose, onSave }: { project: Project | null; onClose: () => void; onSave: (p: Project) => void }) {
  const [form, setForm] = useState<Project>(project ?? { id: uid(), title: '', type: 'College Mini-Project', deadline: todayISO(), completion: 0, notes: '', links: '' });
  return (
    <Modal open onClose={onClose} title={project ? 'Edit Project' : 'Add Project'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => form.title && onSave(form)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Project title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Type">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>College Mini-Project</option><option>Community Service Project</option><option>Programming Project</option>
            <option>Lab Assignment</option><option>Seminar Presentation</option><option>Documentation</option><option>Other</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Deadline"><input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
          <Field label="Completion %"><input type="number" min="0" max="100" className="input" value={form.completion} onChange={(e) => setForm({ ...form, completion: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Notes"><textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <Field label="Document link (optional)"><input className="input" value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} placeholder="https://..." /></Field>
      </div>
    </Modal>
  );
}

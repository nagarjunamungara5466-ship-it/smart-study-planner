import { useState, useRef } from 'react';
import { useStore, uid } from '@/lib/store';
import type { Subject, Unit, Chapter, TopicStatus, StudyMaterial } from '@/lib/types';
import { Modal, ConfirmModal, EmptyState, StatusBadge, ProgressRing } from '@/components/ui';
import { Field } from '@/components/primitives';
import { BookOpen, Plus, Edit2, Trash2, ChevronRight, ChevronDown, FileText, Paperclip, Download, Upload, FileQuestion, Gauge, Clock, TrendingUp, Lightbulb, CheckCircle2, Circle } from 'lucide-react';

export function Academic() {
  const { state, setState } = useStore();
  const activeSem = state.academicYears.flatMap((y) => y.semesters).find((s) => s.active);
  const subjects = activeSem?.subjects ?? [];

  const [subjectModal, setSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unitModal, setUnitModal] = useState<{ subjectId: string; unit: Unit | null } | null>(null);
  const [chapterModal, setChapterModal] = useState<{ subjectId: string; unitId: string; chapter: Chapter | null } | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<{ subjectId: string; unitId: string } | null>(null);
  const [deleteChapter, setDeleteChapter] = useState<{ subjectId: string; unitId: string; chapterId: string } | null>(null);
  const [materialModal, setMaterialModal] = useState<string | null>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<{ subjectId: string; materialId: string } | null>(null);

  const updateSubjects = (updater: (subs: Subject[]) => Subject[]) => {
    setState((s) => ({
      ...s,
      academicYears: s.academicYears.map((y) => ({
        ...y,
        semesters: y.semesters.map((sem) =>
          sem.active ? { ...sem, subjects: updater(sem.subjects) } : sem
        ),
      })),
    }));
  };

  const saveSubject = (subj: Subject) => {
    updateSubjects((subs) => {
      const exists = subs.some((s) => s.id === subj.id);
      return exists ? subs.map((s) => (s.id === subj.id ? subj : s)) : [...subs, subj];
    });
    setSubjectModal(false);
    setEditSubject(null);
  };

  const removeSubject = (id: string) => updateSubjects((subs) => subs.filter((s) => s.id !== id));
  const removeUnit = (subjectId: string, unitId: string) =>
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? { ...s, units: s.units.filter((u) => u.id !== unitId) } : s));
  const removeChapter = (subjectId: string, unitId: string, chapterId: string) =>
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? { ...s, units: s.units.map((u) => u.id === unitId ? { ...u, chapters: u.chapters.filter((c) => c.id !== chapterId) } : u) } : s));

  const saveUnit = (subjectId: string, unit: Unit) => {
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? {
      ...s,
      units: s.units.some((u) => u.id === unit.id) ? s.units.map((u) => u.id === unit.id ? unit : u) : [...s.units, unit],
    } : s));
    setUnitModal(null);
  };

  const saveChapter = (subjectId: string, unitId: string, chapter: Chapter) => {
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? {
      ...s,
      units: s.units.map((u) => u.id === unitId ? {
        ...u,
        chapters: u.chapters.some((c) => c.id === chapter.id) ? u.chapters.map((c) => c.id === chapter.id ? chapter : c) : [...u.chapters, chapter],
      } : u),
    } : s));
    setChapterModal(null);
  };

  const updateChapterStatus = (subjectId: string, unitId: string, chapterId: string, status: TopicStatus) => {
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? {
      ...s,
      units: s.units.map((u) => u.id === unitId ? { ...u, chapters: u.chapters.map((c) => c.id === chapterId ? { ...c, status } : c) } : u),
    } : s));
    // Recalculate prep
    updatePrep(subjectId);
  };

  const updatePrep = (subjectId: string) => {
    updateSubjects((subs) => subs.map((s) => {
      if (s.id !== subjectId) return s;
      const all = s.units.flatMap((u) => u.chapters);
      if (all.length === 0) return s;
      const score = all.reduce((acc, c) => acc + (c.status === 'completed' ? 100 : c.status === 'practicing' ? 75 : c.status === 'learning' ? 40 : 0), 0) / all.length;
      return { ...s, prepPercentage: Math.round(score) };
    }));
  };

  const addMaterial = (subjectId: string, material: StudyMaterial) => {
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? { ...s, materials: [...s.materials, material] } : s));
    setMaterialModal(null);
  };

  const removeMaterial = (subjectId: string, materialId: string) => {
    updateSubjects((subs) => subs.map((s) => s.id === subjectId ? { ...s, materials: s.materials.filter((m) => m.id !== materialId) } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Academic Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {activeSem ? `Semester ${activeSem.name}` : 'No active semester'} • {subjects.length} subjects
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditSubject(null); setSubjectModal(true); }}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No subjects yet"
            message="Add your semester subjects to start tracking syllabus and preparation."
            action={<button className="btn btn-primary" onClick={() => { setEditSubject(null); setSubjectModal(true); }}><Plus size={16} /> Add Subject</button>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((s) => {
            const expanded = expandedId === s.id;
            const totalChapters = s.units.flatMap((u) => u.chapters).length;
            return (
              <div key={s.id} className="card overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <button
                    className="p-1 rounded hover:bg-[var(--surface-2)]"
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                  >
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{s.name}</span>
                      <span className="badge bg-[var(--surface-2)]" style={{ color: 'var(--text-muted)' }}>{s.code}</span>
                      {s.difficult && <span className="badge bg-red-100 text-red-700">Difficult</span>}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {s.credits} credits • {s.units.length} units • {totalChapters} chapters • {s.materials?.length || 0} materials
                    </div>
                  </div>
                  <ProgressRing value={s.prepPercentage} size={56} stroke={6} />
                  <div className="flex gap-1">
                    <button className="p-2 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => { setEditSubject(s); setSubjectModal(true); }}><Edit2 size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-[var(--surface-2)] text-red-500" onClick={() => setDeleteSubject(s)}><Trash2 size={16} /></button>
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    {s.faculty && <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Faculty: {s.faculty}</p>}
                    {s.syllabus && <p className="text-sm mb-3 p-3 rounded-lg bg-[var(--surface-2)]">{s.syllabus}</p>}

                    <ProgressOverview subject={s} dailyHours={state.profile.dailyHours} />

                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Units & Chapters</h4>
                      <button className="btn btn-ghost text-xs py-1.5" onClick={() => setUnitModal({ subjectId: s.id, unit: null })}>
                        <Plus size={14} /> Add Unit
                      </button>
                    </div>

                    {s.units.length === 0 ? (
                      <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No units added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {s.units.map((u) => (
                          <div key={u.id} className="rounded-lg bg-[var(--surface-2)] p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{u.name}</span>
                              <div className="flex gap-1">
                                <button className="btn btn-ghost text-xs py-1" onClick={() => setChapterModal({ subjectId: s.id, unitId: u.id, chapter: null })}><Plus size={12} /> Chapter</button>
                                <button className="p-1 rounded text-red-500" onClick={() => setDeleteUnit({ subjectId: s.id, unitId: u.id })}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            {u.chapters.length === 0 ? (
                              <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No chapters yet.</p>
                            ) : (
                              <div className="space-y-1.5">
                                {u.chapters.map((c) => (
                                  <div key={c.id} className="flex items-center gap-2 group">
                                    <select
                                      className="input py-1 px-2 text-xs w-auto"
                                      value={c.status}
                                      onChange={(e) => updateChapterStatus(s.id, u.id, c.id, e.target.value as TopicStatus)}
                                    >
                                      <option value="not_started">Not Started</option>
                                      <option value="learning">Learning</option>
                                      <option value="practicing">Practicing</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <span className="text-sm flex-1 truncate">{c.name}</span>
                                    <button className="p-1 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteChapter({ subjectId: s.id, unitId: u.id, chapterId: c.id })}><Trash2 size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      {s.internalMarks && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Internal marks: {s.internalMarks}</div>}
                      {s.attendance > 0 && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Attendance: {s.attendance}%</div>}
                    </div>

                    {/* Study Materials */}
                    <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><Paperclip size={15} /> Study Materials & Files</h4>
                        <button className="btn btn-ghost text-xs py-1.5" onClick={() => setMaterialModal(s.id)}>
                          <Upload size={14} /> Upload File
                        </button>
                      </div>
                      {(!s.materials || s.materials.length === 0) ? (
                        <div className="p-4 rounded-lg bg-[var(--surface-2)] text-center">
                          <FileText size={20} className="mx-auto mb-1 opacity-40" />
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No materials uploaded yet. Add PDFs, notes, slides or question papers.</p>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {s.materials.map((m) => (
                            <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] group">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: materialTagColor(m.tag) + '20', color: materialTagColor(m.tag) }}>
                                {materialIcon(m.tag)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{m.name}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {materialTagLabel(m.tag)} • {formatSize(m.size)}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <a
                                  href={m.dataUrl}
                                  download={m.name}
                                  className="p-1.5 rounded-lg hover:bg-[var(--surface)]"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </a>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => setDeleteMaterial({ subjectId: s.id, materialId: m.id })}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {subjectModal && (
        <SubjectModal subject={editSubject} onClose={() => setSubjectModal(false)} onSave={saveSubject} />
      )}
      {materialModal && (
        <MaterialModal subjectId={materialModal} onClose={() => setMaterialModal(null)} onSave={addMaterial} />
      )}
      <ConfirmModal open={!!deleteMaterial} onClose={() => setDeleteMaterial(null)} onConfirm={() => deleteMaterial && removeMaterial(deleteMaterial.subjectId, deleteMaterial.materialId)} title="Delete Material" message="Delete this file? The uploaded file will be removed permanently." />
      {unitModal && (
        <UnitModal unit={unitModal.unit} onClose={() => setUnitModal(null)} onSave={(u) => saveUnit(unitModal.subjectId, u)} />
      )}
      {chapterModal && (
        <ChapterModal chapter={chapterModal.chapter} onClose={() => setChapterModal(null)} onSave={(c) => saveChapter(chapterModal.subjectId, chapterModal.unitId, c)} />
      )}
      <ConfirmModal open={!!deleteSubject} onClose={() => setDeleteSubject(null)} onConfirm={() => deleteSubject && removeSubject(deleteSubject.id)} title="Delete Subject" message={`Delete "${deleteSubject?.name}"? This removes all units and chapters.`} />
      <ConfirmModal open={!!deleteUnit} onClose={() => setDeleteUnit(null)} onConfirm={() => deleteUnit && removeUnit(deleteUnit.subjectId, deleteUnit.unitId)} title="Delete Unit" message="Delete this unit and all its chapters?" />
      <ConfirmModal open={!!deleteChapter} onClose={() => setDeleteChapter(null)} onConfirm={() => deleteChapter && removeChapter(deleteChapter.subjectId, deleteChapter.unitId, deleteChapter.chapterId)} title="Delete Chapter" message="Delete this chapter?" />
    </div>
  );
}

function SubjectModal({ subject, onClose, onSave }: { subject: Subject | null; onClose: () => void; onSave: (s: Subject) => void }) {
  const [form, setForm] = useState<Subject>(subject ?? {
    id: uid(), name: '', code: '', credits: 3, faculty: '', syllabus: '', units: [],
    internalMarks: '', prepPercentage: 0, difficult: false, attendance: 0, materials: [],
  });
  return (
    <Modal open onClose={onClose} title={subject ? 'Edit Subject' : 'Add Subject'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Subject name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code"><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS301" /></Field>
          <Field label="Credits"><input type="number" className="input" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Faculty (optional)"><input className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} /></Field>
        <Field label="Syllabus (optional)"><textarea className="input min-h-[80px]" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Internal marks (optional)"><input className="input" value={form.internalMarks} onChange={(e) => setForm({ ...form, internalMarks: e.target.value })} placeholder="18/20" /></Field>
          <Field label="Attendance %"><input type="number" className="input" value={form.attendance} onChange={(e) => setForm({ ...form, attendance: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Preparation %"><input type="number" min="0" max="100" className="input" value={form.prepPercentage} onChange={(e) => setForm({ ...form, prepPercentage: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.difficult} onChange={(e) => setForm({ ...form, difficult: e.target.checked })} />
          Mark as difficult subject
        </label>
      </div>
    </Modal>
  );
}

function UnitModal({ unit, onClose, onSave }: { unit: Unit | null; onClose: () => void; onSave: (u: Unit) => void }) {
  const [name, setName] = useState(unit?.name ?? '');
  return (
    <Modal open onClose={onClose} title={unit ? 'Edit Unit' : 'Add Unit'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => name && onSave({ id: unit?.id ?? uid(), name, chapters: unit?.chapters ?? [] })}>Save</button>
    </>}>
      <Field label="Unit name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Unit 1: Introduction" /></Field>
    </Modal>
  );
}

function ChapterModal({ chapter, onClose, onSave }: { chapter: Chapter | null; onClose: () => void; onSave: (c: Chapter) => void }) {
  const [name, setName] = useState(chapter?.name ?? '');
  const [status, setStatus] = useState<TopicStatus>(chapter?.status ?? 'not_started');
  return (
    <Modal open onClose={onClose} title={chapter ? 'Edit Chapter' : 'Add Chapter'} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => name && onSave({ id: chapter?.id ?? uid(), name, status })}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Chapter name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arrays" /></Field>
        <Field label="Status">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as TopicStatus)}>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="practicing">Practicing</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

const tagOptions: { value: StudyMaterial['tag']; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'pdf', label: 'PDF / Textbook' },
  { value: 'slides', label: 'Slides / PPT' },
  { value: 'qpapers', label: 'Question Papers' },
  { value: 'other', label: 'Other' },
];

function materialTagColor(tag: StudyMaterial['tag']): string {
  const map: Record<StudyMaterial['tag'], string> = {
    notes: '#3b82f6', pdf: '#ef4444', slides: '#f59e0b', qpapers: '#a855f7', other: '#64748b',
  };
  return map[tag];
}

function materialTagLabel(tag: StudyMaterial['tag']): string {
  return tagOptions.find((t) => t.value === tag)?.label ?? tag;
}

function materialIcon(tag: StudyMaterial['tag']) {
  if (tag === 'qpapers') return <FileQuestion size={18} />;
  return <FileText size={18} />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MaterialModal({ subjectId, onClose, onSave }: { subjectId: string; onClose: () => void; onSave: (subjectId: string, material: StudyMaterial) => void }) {
  const [tag, setTag] = useState<StudyMaterial['tag']>('notes');
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 4 * 1024 * 1024; // 4 MB — localStorage safe

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    if (f.size > MAX_SIZE) {
      setError(`File is ${formatSize(f.size)} — max supported size is ${formatSize(MAX_SIZE)} for browser storage. Try a smaller file or a link.`);
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSave = () => {
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const material: StudyMaterial = {
        id: uid(),
        name: name || file.name,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
        size: file.size,
        addedAt: new Date().toISOString(),
        tag,
      };
      onSave(subjectId, material);
      setBusy(false);
    };
    reader.onerror = () => {
      setError('Could not read this file. Please try a different file.');
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal open onClose={onClose} title="Upload Study Material" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSave} disabled={busy}>{busy ? 'Saving...' : 'Upload'}</button>
    </>}>
      <div className="space-y-3">
        <Field label="Material type">
          <select className="input" value={tag} onChange={(e) => setTag(e.target.value as StudyMaterial['tag'])}>
            {tagOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Display name (optional)">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Unit 1 Notes" />
        </Field>
        <Field label="File (PDF, image, document — max 4 MB)">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,image/*,application/pdf" />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <span className="font-medium">{file.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>({formatSize(file.size)})</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload size={24} className="mx-auto opacity-50" />
                <p className="text-sm font-medium">Click to choose a file</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Files are stored in your browser and stay available after refresh</p>
              </div>
            )}
          </div>
        </Field>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}

const STATUS_WEIGHT: Record<TopicStatus, number> = {
  not_started: 0, learning: 40, practicing: 75, completed: 100,
};

function computeUnitProgress(chapters: Chapter[]): number {
  if (chapters.length === 0) return 0;
  return Math.round(chapters.reduce((acc, c) => acc + STATUS_WEIGHT[c.status], 0) / chapters.length);
}

function isUnitComplete(chapters: Chapter[]): boolean {
  return chapters.length > 0 && chapters.every((c) => c.status === 'completed');
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function ProgressOverview({ subject, dailyHours }: { subject: Subject; dailyHours: number }) {
  const units = subject.units;
  const totalUnits = units.length;
  const completedUnits = units.filter((u) => isUnitComplete(u.chapters)).length;
  const remainingUnits = totalUnits - completedUnits;

  const allChapters = units.flatMap((u) => u.chapters);
  const totalChapters = allChapters.length;
  const completedChapters = allChapters.filter((c) => c.status === 'completed').length;
  const learningChapters = allChapters.filter((c) => c.status === 'learning').length;
  const practicingChapters = allChapters.filter((c) => c.status === 'practicing').length;
  const notStartedChapters = allChapters.filter((c) => c.status === 'not_started').length;

  const percentLearned = subject.prepPercentage;

  // Time estimate: ~30 min per chapter to go from not_started→completed,
  // ~15 min for learning→completed, ~10 min for practicing→completed
  const estMinutes =
    notStartedChapters * 30 + learningChapters * 15 + practicingChapters * 10;
  // Split daily hours across all active subjects equally (approximation)
  // but here we show per-subject estimate based on a 40% daily allocation to academics
  const dailyMinutesForSubject = Math.max(15, Math.round(dailyHours * 60 * 0.4));
  const daysToFinish = estMinutes > 0 ? Math.ceil(estMinutes / dailyMinutesForSubject) : 0;

  // Speed suggestions based on progress
  const suggestions: { icon: typeof Lightbulb; text: string; color: string }[] = [];
  if (totalChapters === 0) {
    suggestions.push({ icon: Lightbulb, text: 'Add units and chapters to start tracking your progress.', color: '#3b82f6' });
  } else {
    if (percentLearned < 30) {
      suggestions.push({ icon: TrendingUp, text: 'Just starting — aim to learn 1 new chapter per day to build momentum.', color: '#f59e0b' });
    } else if (percentLearned < 70) {
      suggestions.push({ icon: TrendingUp, text: 'Good progress! Keep learning 1-2 chapters daily and revise completed ones.', color: '#3b82f6' });
    } else if (percentLearned < 100) {
      suggestions.push({ icon: TrendingUp, text: 'Almost there — focus on remaining chapters and practice questions.', color: '#22c55e' });
    } else {
      suggestions.push({ icon: CheckCircle2, text: 'All chapters complete! Schedule revision using spaced repetition.', color: '#22c55e' });
    }
    if (subject.difficult) {
      suggestions.push({ icon: Lightbulb, text: 'This is a difficult subject — spend extra time and break topics into smaller chunks.', color: '#ef4444' });
    }
    if (daysToFinish > 0) {
      const dailyMin = dailyMinutesForSubject;
      const fasterDaily = dailyMin + 30;
      const fasterDays = Math.ceil(estMinutes / fasterDaily);
      suggestions.push({
        icon: Gauge,
        text: `At your current pace (${formatDuration(dailyMin)}/day for this subject), you need ~${daysToFinish} more days. Add 30 min/day to finish in ~${fasterDays} days instead.`,
        color: '#a855f7',
      });
    }
    if (notStartedChapters > completedChapters && notStartedChapters > 0) {
      suggestions.push({ icon: Lightbulb, text: `${notStartedChapters} chapter(s) haven't been started yet. Begin with the easiest one to build confidence.`, color: '#f59e0b' });
    }
  }

  return (
    <div className="mb-4 p-4 rounded-xl bg-[var(--surface-2)]">
      <div className="flex items-center gap-2 mb-3">
        <Gauge size={16} style={{ color: 'var(--primary)' }} />
        <h4 className="font-semibold text-sm">Progress Overview</h4>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatTile
          icon={<CheckCircle2 size={16} />}
          label="Units Completed"
          value={`${completedUnits}`}
          sub={`of ${totalUnits}`}
          color="#22c55e"
        />
        <StatTile
          icon={<Circle size={16} />}
          label="Units Remaining"
          value={`${remainingUnits}`}
          sub={`of ${totalUnits}`}
          color="#f59e0b"
        />
        <StatTile
          icon={<TrendingUp size={16} />}
          label="Chapters Done"
          value={`${completedChapters}`}
          sub={`of ${totalChapters}`}
          color="#3b82f6"
        />
        <StatTile
          icon={<Clock size={16} />}
          label="Est. Time Left"
          value={estMinutes > 0 ? formatDuration(estMinutes) : '—'}
          sub={daysToFinish > 0 ? `~${daysToFinish} days` : 'all done'}
          color="#a855f7"
        />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold">Learned so far</span>
          <span className="font-bold" style={{ color: percentLearned >= 70 ? '#22c55e' : percentLearned >= 40 ? '#f59e0b' : '#ef4444' }}>{percentLearned}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--surface)] overflow-hidden flex">
          {[
            { pct: (completedChapters / Math.max(1, totalChapters)) * 100, color: '#22c55e' },
            { pct: (practicingChapters / Math.max(1, totalChapters)) * 100, color: '#f59e0b' },
            { pct: (learningChapters / Math.max(1, totalChapters)) * 100, color: '#3b82f6' },
          ].map((seg, i) => (
            <div key={i} className="h-full transition-all duration-500" style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Completed {completedChapters}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Practicing {practicingChapters}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Learning {learningChapters}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--surface)] border" style={{ borderColor: 'var(--border)' }} /> Not started {notStartedChapters}</span>
        </div>
      </div>

      {/* Per-unit breakdown */}
      {units.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>UNIT-BY-UNIT BREAKDOWN</h5>
          <div className="space-y-1.5">
            {units.map((u) => {
              const pct = computeUnitProgress(u.chapters);
              const done = isUnitComplete(u.chapters);
              return (
                <div key={u.id} className="flex items-center gap-2">
                  <span className="text-xs w-28 truncate" style={{ color: 'var(--text-muted)' }}>{u.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: done ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#f59e0b' }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{pct}%</span>
                  {done ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Speed-up suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <h5 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Gauge size={13} /> HOW TO SPEED UP
          </h5>
          <div className="space-y-2">
            {suggestions.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-lg" style={{ backgroundColor: s.color + '12' }}>
                  <Icon size={15} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                  <span>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-[var(--surface)]">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  );
}

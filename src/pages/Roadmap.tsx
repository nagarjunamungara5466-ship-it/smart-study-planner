import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { RoadmapLevel, TopicStatus } from '@/lib/types';
import { Modal, EmptyState, StatusBadge, ProgressRing } from '@/components/ui';
import { Field } from '@/components/primitives';
import { Plus, Edit2, Trash2, BookOpen, Link as LinkIcon } from 'lucide-react';

const statusColors: Record<TopicStatus, string> = {
  not_started: '#94a3b8', learning: '#3b82f6', practicing: '#f59e0b', completed: '#22c55e',
};

const freeResources: Record<string, string> = {
  'Python for AI': 'https://www.kaggle.com/learn/python',
  'Mathematics for Machine Learning': 'https://www.khanacademy.org/math',
  'NumPy': 'https://numpy.org/learn/',
  'Pandas': 'https://www.kaggle.com/learn/pandas',
  'Matplotlib': 'https://matplotlib.org/stable/tutorials/index.html',
  'Machine Learning Fundamentals': 'https://www.kaggle.com/learn/intro-to-machine-learning',
  'Supervised Learning': 'https://www.kaggle.com/learn/intermediate-machine-learning',
  'Deep Learning': 'https://www.tensorflow.org/tutorials',
  'Neural Networks': 'https://www.3blue1brown.com/topics/neural-networks',
  'Natural Language Processing': 'https://www.kaggle.com/learn/natural-language-processing',
};

export function Roadmap({ type }: { type: 'programming' | 'ai' }) {
  const { state, setState } = useStore();
  const levels = type === 'programming' ? state.progRoadmap : state.aiRoadmap;
  const [topicModal, setTopicModal] = useState<{ levelId: string; topicId: string | null } | null>(null);
  const [levelModal, setLevelModal] = useState(false);
  const [deleteTopic, setDeleteTopic] = useState<{ levelId: string; topicId: string } | null>(null);

  const updateLevels = (updater: (lvls: RoadmapLevel[]) => RoadmapLevel[]) => {
    setState((s) => type === 'programming' ? { ...s, progRoadmap: updater(s.progRoadmap) } : { ...s, aiRoadmap: updater(s.aiRoadmap) });
  };

  const setTopicStatus = (levelId: string, topicId: string, status: TopicStatus) => {
    updateLevels((lvls) => lvls.map((l) => l.id === levelId ? { ...l, topics: l.topics.map((t) => t.id === topicId ? { ...t, status } : t) } : l));
  };

  const saveTopic = (levelId: string, topicId: string | null, name: string, resources: string) => {
    updateLevels((lvls) => lvls.map((l) => {
      if (l.id !== levelId) return l;
      if (topicId) {
        return { ...l, topics: l.topics.map((t) => t.id === topicId ? { ...t, name, resources } : t) };
      }
      return { ...l, topics: [...l.topics, { id: uid(), name, status: 'not_started' as const, resources }] };
    }));
    setTopicModal(null);
  };

  const removeTopic = (levelId: string, topicId: string) => {
    updateLevels((lvls) => lvls.map((l) => l.id === levelId ? { ...l, topics: l.topics.filter((t) => t.id !== topicId) } : l));
  };

  const addLevel = (title: string) => {
    updateLevels((lvls) => [...lvls, { id: uid(), title, topics: [] }]);
    setLevelModal(false);
  };

  const totalTopics = levels.flatMap((l) => l.topics).length;
  const completedTopics = levels.flatMap((l) => l.topics).filter((t) => t.status === 'completed').length;
  const overallPct = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{type === 'programming' ? 'Programming Roadmap' : 'AI & ML Roadmap'}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{completedTopics}/{totalTopics} topics completed</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setLevelModal(true)}><Plus size={16} /> Add Level</button>
      </div>

      {/* Overall progress */}
      <div className="card p-5 flex items-center gap-6">
        <ProgressRing value={overallPct} size={100} stroke={10} />
        <div>
          <h3 className="font-semibold">Overall Progress</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{type === 'programming' ? 'Python → DSA → Advanced Projects' : 'AI Foundations → ML → Deep Learning'}</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: statusColors.completed }} />Completed: {completedTopics}</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: statusColors.learning }} />Learning: {levels.flatMap((l) => l.topics).filter((t) => t.status === 'learning').length}</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: statusColors.practicing }} />Practicing: {levels.flatMap((l) => l.topics).filter((t) => t.status === 'practicing').length}</span>
          </div>
        </div>
      </div>

      {/* Levels */}
      {levels.map((level, idx) => {
        const levelTotal = level.topics.length;
        const levelDone = level.topics.filter((t) => t.status === 'completed').length;
        const levelPct = levelTotal > 0 ? (levelDone / levelTotal) * 100 : 0;
        return (
          <div key={level.id} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: 'var(--primary)' }}>{idx + 1}</div>
                <div>
                  <h3 className="font-bold">{level.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{levelDone}/{levelTotal} completed</p>
                </div>
              </div>
              <button className="btn btn-ghost text-sm" onClick={() => setTopicModal({ levelId: level.id, topicId: null })}><Plus size={14} /> Add Topic</button>
            </div>

            {level.topics.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No topics yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {level.topics.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg bg-[var(--surface-2)] group">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-medium text-sm">{t.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded text-xs" onClick={() => setTopicModal({ levelId: level.id, topicId: t.id })}><Edit2 size={12} /></button>
                        <button className="p-1 rounded text-xs text-red-500" onClick={() => setDeleteTopic({ levelId: level.id, topicId: t.id })}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <select
                      className="input py-1 px-2 text-xs w-auto"
                      value={t.status}
                      onChange={(e) => setTopicStatus(level.id, t.id, e.target.value as TopicStatus)}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="learning">Learning</option>
                      <option value="practicing">Practicing</option>
                      <option value="completed">Completed</option>
                    </select>
                    {(t.resources || freeResources[t.name]) && (
                      <a
                        href={t.resources || freeResources[t.name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-2 flex items-center gap-1"
                        style={{ color: 'var(--primary)' }}
                      >
                        <LinkIcon size={12} /> Free resource
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${levelPct}%`, backgroundColor: 'var(--primary)' }} />
              </div>
            </div>
          </div>
        );
      })}

      {levels.length === 0 && (
        <div className="card p-6"><EmptyState icon={<BookOpen size={32} />} title="No roadmap levels" message="Add a level to start building your roadmap." /></div>
      )}

      {topicModal && <TopicModal onClose={() => setTopicModal(null)} onSave={(name, res) => saveTopic(topicModal.levelId, topicModal.topicId, name, res)} />}
      {levelModal && <LevelModal onClose={() => setLevelModal(false)} onSave={addLevel} />}
      {deleteTopic && (
        <Modal open onClose={() => setDeleteTopic(null)} title="Delete Topic" footer={<>
          <button className="btn btn-ghost" onClick={() => setDeleteTopic(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => { removeTopic(deleteTopic.levelId, deleteTopic.topicId); setDeleteTopic(null); }}>Delete</button>
        </>}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Delete this topic?</p>
        </Modal>
      )}
    </div>
  );
}

function TopicModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, resources: string) => void }) {
  const [name, setName] = useState('');
  const [resources, setResources] = useState('');
  return (
    <Modal open onClose={onClose} title="Add Topic" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => name && onSave(name, resources)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Topic name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Resource URL (optional)"><input className="input" value={resources} onChange={(e) => setResources(e.target.value)} placeholder="https://..." /></Field>
      </div>
    </Modal>
  );
}

function LevelModal({ onClose, onSave }: { onClose: () => void; onSave: (title: string) => void }) {
  const [title, setTitle] = useState('');
  return (
    <Modal open onClose={onClose} title="Add Level" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => title && onSave(title)}>Save</button>
    </>}>
      <Field label="Level title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Level 4: ..." /></Field>
    </Modal>
  );
}

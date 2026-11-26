import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import type { Profile } from '@/lib/types';
import { Field } from '@/components/primitives';
import { ConfirmModal } from '@/components/ui';
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Moon, Sun, Bell, User } from 'lucide-react';

export function SettingsPage() {
  const { state, setState, reset, importData } = useStore();
  const [editProfile, setEditProfile] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        importData(data);
        alert('Data imported successfully.');
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      update({ notifications: true });
    } else {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        update({ notifications: true });
        new Notification('Smart Study Planner', { body: 'Notifications enabled! You will be reminded of your study tasks.' });
      } else {
        alert('Notification permission denied.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon size={24} /> Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Customize your study planner</p>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Appearance</h3>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {state.profile.darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <div>
              <div className="font-medium text-sm">Dark Mode</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Toggle between dark and light themes</div>
            </div>
          </div>
          <button
            className={`w-12 h-7 rounded-full transition-colors relative ${state.profile.darkMode ? 'bg-[var(--primary)]' : 'bg-[var(--surface-2)]'}`}
            onClick={() => update({ darkMode: !state.profile.darkMode })}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${state.profile.darkMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Study preferences */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Study Preferences</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Daily study hours">
            <input type="number" min="0.5" max="12" step="0.5" className="input" value={state.profile.dailyHours} onChange={(e) => update({ dailyHours: Number(e.target.value) })} />
          </Field>
          <Field label="Preferred study timing">
            <select className="input" value={state.profile.preferredTimings} onChange={(e) => update({ preferredTimings: e.target.value })}>
              <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option><option>Flexible</option>
            </select>
          </Field>
        </div>
        <Field label="Learning priorities (interests)">
          <input className="input" value={state.profile.interests} onChange={(e) => update({ interests: e.target.value })} />
        </Field>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Notifications</h3>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div>
              <div className="font-medium text-sm">Browser Notifications</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Get reminders for study tasks and exams</div>
            </div>
          </div>
          <button
            className={`w-12 h-7 rounded-full transition-colors relative ${state.profile.notifications ? 'bg-[var(--primary)]' : 'bg-[var(--surface-2)]'}`}
            onClick={() => (state.profile.notifications ? update({ notifications: false }) : enableNotifications())}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${state.profile.notifications ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title flex items-center gap-2"><User size={20} /> Student Profile</h3>
          <button className="btn btn-ghost text-sm" onClick={() => setEditProfile(!editProfile)}>{editProfile ? 'Done' : 'Edit'}</button>
        </div>
        {editProfile ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Degree"><input className="input" value={state.profile.degree} onChange={(e) => update({ degree: e.target.value })} /></Field>
            <Field label="College"><input className="input" value={state.profile.college} onChange={(e) => update({ college: e.target.value })} /></Field>
            <Field label="Year"><input className="input" value={state.profile.year} onChange={(e) => update({ year: e.target.value })} /></Field>
            <Field label="Semester"><input className="input" value={state.profile.semester} onChange={(e) => update({ semester: e.target.value })} /></Field>
            <Field label="Batch"><input className="input" value={state.profile.batch} onChange={(e) => update({ batch: e.target.value })} /></Field>
            <Field label="CGPA"><input className="input" value={state.profile.cgpa} onChange={(e) => update({ cgpa: e.target.value })} /></Field>
            <Field label="Programming level"><input className="input" value={state.profile.progLevel} onChange={(e) => update({ progLevel: e.target.value })} /></Field>
            <Field label="Python level"><input className="input" value={state.profile.python} onChange={(e) => update({ python: e.target.value })} /></Field>
            <Field label="Java level"><input className="input" value={state.profile.java} onChange={(e) => update({ java: e.target.value })} /></Field>
            <Field label="C level"><input className="input" value={state.profile.c} onChange={(e) => update({ c: e.target.value })} /></Field>
            <Field label="DSA level"><input className="input" value={state.profile.dsa} onChange={(e) => update({ dsa: e.target.value })} /></Field>
            <Field label="Laptop"><input className="input" value={state.profile.laptop} onChange={(e) => update({ laptop: e.target.value })} /></Field>
            <Field label="Learning budget"><input className="input" value={state.profile.learningBudget} onChange={(e) => update({ learningBudget: e.target.value })} /></Field>
            <Field label="Preferred method"><input className="input" value={state.profile.preferredMethod} onChange={(e) => update({ preferredMethod: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Field label="Career objective"><textarea className="input min-h-[60px]" value={state.profile.careerObjective} onChange={(e) => update({ careerObjective: e.target.value })} /></Field>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <InfoRow label="Degree" value={state.profile.degree} />
            <InfoRow label="College" value={state.profile.college} />
            <InfoRow label="Year" value={state.profile.year} />
            <InfoRow label="Semester" value={state.profile.semester} />
            <InfoRow label="Batch" value={state.profile.batch} />
            <InfoRow label="CGPA" value={state.profile.cgpa} />
            <InfoRow label="Programming" value={state.profile.progLevel} />
            <InfoRow label="DSA" value={state.profile.dsa} />
            <InfoRow label="Laptop" value={state.profile.laptop} />
            <InfoRow label="Daily hours" value={`${state.profile.dailyHours}h`} />
          </div>
        )}
      </div>

      {/* Data management */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-ghost" onClick={exportData}><Download size={16} /> Export Data</button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import Data</button>
          <input type="file" ref={fileRef} accept="application/json" className="hidden" onChange={importFile} />
          <button className="btn btn-danger" onClick={() => setResetModal(true)}><RotateCcw size={16} /> Reset Application</button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>All data is stored locally in your browser. Export regularly to keep backups.</p>
      </div>

      <ConfirmModal open={resetModal} onClose={() => setResetModal(false)} onConfirm={reset} title="Reset Application" message="This will erase ALL your data and restore demo data. This cannot be undone. Consider exporting a backup first." />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-[var(--surface-2)]">
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

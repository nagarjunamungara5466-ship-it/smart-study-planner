import { useState } from 'react';
import { useStore, uid } from '@/lib/store';
import type { CalendarEvent } from '@/lib/types';
import { Modal, ConfirmModal } from '@/components/ui';
import { Field, SegmentedControl } from '@/components/primitives';
import { todayISO, formatLongDate, monthName, getMonthGrid, isoDate, daysBetween } from '@/lib/utils';
import { Plus, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const eventColors: Record<string, string> = {
  exam: '#ef4444', study: '#3b82f6', assignment: '#f59e0b', revision: '#a855f7', project: '#22c55e', other: '#64748b',
};

export function Calendar() {
  const { state, setState } = useStore();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allEvents = [...state.events, ...state.exams.map((e) => ({ id: e.id, title: e.name, date: e.date, type: 'exam' as const, time: e.time }))];
  const eventsForDate = (d: string) => allEvents.filter((e) => e.date === d);

  const saveEvent = (ev: CalendarEvent) => {
    setState((s) => ({ ...s, events: s.events.some((e) => e.id === ev.id) ? s.events.map((e) => e.id === ev.id ? ev : e) : [...s.events, ev] }));
    setModal(false);
  };
  const removeEvent = (id: string) => setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));

  const move = (delta: number) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + delta);
    else if (view === 'week') d.setDate(d.getDate() + delta * 7);
    else d.setDate(d.getDate() + delta);
    setCursor(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar & Reminders</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track exams, deadlines and study sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Add Event</button>
      </div>

      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => move(-1)}><ChevronLeft size={18} /></button>
          <h3 className="font-bold min-w-[140px] text-center">
            {view === 'month' ? monthName(cursor) : view === 'day' ? formatLongDate(isoDate(cursor)) : `Week of ${formatLongDate(isoDate(getWeekStart(cursor)))}`}
          </h3>
          <button className="p-2 rounded-lg hover:bg-[var(--surface-2)]" onClick={() => move(1)}><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost text-sm" onClick={() => { setCursor(new Date()); setSelectedDate(todayISO()); }}>Today</button>
          <SegmentedControl
            options={[{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }]}
            value={view}
            onChange={(v) => setView(v as typeof view)}
          />
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="card p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getMonthGrid(cursor.getFullYear(), cursor.getMonth()).map((d, i) => {
              const iso = isoDate(d);
              const isToday = iso === todayISO();
              const inMonth = d.getMonth() === cursor.getMonth();
              const evs = eventsForDate(iso);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(iso)}
                  className={`min-h-[70px] p-1.5 rounded-lg border text-left transition-all ${isToday ? 'border-[var(--primary)]' : 'border-transparent'} ${selectedDate === iso ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]'}`}
                  style={{ opacity: inMonth ? 1 : 0.4 }}
                >
                  <div className={`text-xs font-semibold ${isToday ? 'text-[var(--primary)]' : ''}`}>{d.getDate()}</div>
                  <div className="mt-1 space-y-0.5">
                    {evs.slice(0, 3).map((e) => (
                      <div key={e.id} className="text-[9px] px-1 py-0.5 rounded truncate" style={{ backgroundColor: eventColors[e.type] + '30', color: eventColors[e.type] }}>
                        {e.title}
                      </div>
                    ))}
                    {evs.length > 3 && <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>+{evs.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="card p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const d = getWeekStart(cursor);
              d.setDate(d.getDate() + i);
              const iso = isoDate(d);
              const evs = eventsForDate(iso);
              const isToday = iso === todayISO();
              return (
                <div key={i} className={`p-2 rounded-lg min-h-[120px] ${isToday ? 'bg-blue-50' : 'bg-[var(--surface-2)]'}`}>
                  <div className="text-xs font-semibold mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getDate()}</div>
                  <div className="space-y-1">
                    {evs.map((e) => (
                      <div key={e.id} className="text-[10px] p-1 rounded truncate" style={{ backgroundColor: eventColors[e.type] + '30', color: eventColors[e.type] }}>{e.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === 'day' && (
        <div className="card p-4">
          <h3 className="font-bold mb-3">{formatLongDate(selectedDate)}</h3>
          {eventsForDate(selectedDate).length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {eventsForDate(selectedDate).sort((a, b) => a.time.localeCompare(b.time)).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: eventColors[e.type] }} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{e.title}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{e.type} • {e.time}</div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-red-500" onClick={() => setDeleteId(e.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected date events */}
      {view === 'month' && (
        <div className="card p-4">
          <h3 className="font-semibold mb-3">{formatLongDate(selectedDate)}</h3>
          {eventsForDate(selectedDate).length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No events. Click "Add Event" to create one.</p>
          ) : (
            <div className="space-y-2">
              {eventsForDate(selectedDate).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: eventColors[e.type] }} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{e.title}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{e.type} • {e.time}</div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-red-500" onClick={() => setDeleteId(e.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming events list */}
      <div>
        <h3 className="section-title mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {allEvents.filter((e) => daysBetween(todayISO(), e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10).map((e) => (
            <div key={e.id} className="card p-3 flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: eventColors[e.type] }} />
              <div className="flex-1">
                <div className="font-semibold text-sm">{e.title}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{e.type} • {e.date} • {e.time}</div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{daysBetween(todayISO(), e.date)}d</span>
            </div>
          ))}
        </div>
      </div>

      {modal && <EventModal date={selectedDate} onClose={() => setModal(false)} onSave={saveEvent} />}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && removeEvent(deleteId)} title="Delete Event" message="Delete this event?" />
    </div>
  );
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function EventModal({ date, onClose, onSave }: { date: string; onClose: () => void; onSave: (e: CalendarEvent) => void }) {
  const [form, setForm] = useState<CalendarEvent>({ id: uid(), title: '', date, type: 'study', time: '18:00' });
  return (
    <Modal open onClose={onClose} title="Add Event" footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => form.title && onSave(form)}>Save</button>
    </>}>
      <div className="space-y-3">
        <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. DSA Study Session" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })}>
              <option value="study">Study</option><option value="exam">Exam</option><option value="assignment">Assignment</option>
              <option value="revision">Revision</option><option value="project">Project</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Time"><input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
        </div>
        <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

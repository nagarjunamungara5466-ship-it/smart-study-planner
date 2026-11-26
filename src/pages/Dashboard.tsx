import { useStore } from '@/lib/store';
import { getGreeting, todayName, formatLongDate, todayISO, daysBetween, clamp, average } from '@/lib/utils';
import { ProgressRing, EmptyState } from '@/components/ui';
import { BarChart, DonutChart } from '@/components/charts';
import { Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, Flame, Target, BookOpen, GraduationCap } from 'lucide-react';
import type { PageKey } from '@/components/Layout';

export function Dashboard({ setPage }: { setPage: (p: PageKey) => void }) {
  const { state } = useStore();
  const today = todayISO();
  const todayTasks = state.tasks.filter((t) => t.date === today);
  const completed = todayTasks.filter((t) => t.completed).length;
  const pending = todayTasks.filter((t) => !t.completed).length;

  // Upcoming exams
  const upcomingExams = [...state.exams]
    .filter((e) => daysBetween(today, e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Study hours
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const log = state.studyLogs.find((l) => l.date === iso);
    return { label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), value: log?.hours ?? 0 };
  });
  const totalWeek = last7.reduce((a, b) => a + b.value, 0);
  const totalToday = last7[6]?.value ?? 0;

  // Weekly progress
  const allTasksThisWeek = state.tasks.filter((t) => {
    const diff = daysBetween(today, t.date);
    return diff >= -6 && diff <= 0;
  });
  const weeklyPct = allTasksThisWeek.length > 0
    ? (allTasksThisWeek.filter((t) => t.completed).length / allTasksThisWeek.length) * 100
    : 0;

  // Monthly progress (last 30 days)
  const monthTasks = state.tasks.filter((t) => {
    const diff = daysBetween(today, t.date);
    return diff >= -29 && diff <= 0;
  });
  const monthlyPct = monthTasks.length > 0
    ? (monthTasks.filter((t) => t.completed).length / monthTasks.length) * 100
    : 0;

  // Streak
  const streak = computeStreak(state.studyLogs);

  // Upcoming deadlines (projects + exams within 14 days)
  const deadlines = [
    ...upcomingExams.map((e) => ({ title: e.name, date: e.date, type: 'Exam' })),
    ...state.projects
      .filter((p) => daysBetween(today, p.deadline) >= 0 && daysBetween(today, p.deadline) <= 30)
      .map((p) => ({ title: p.title, date: p.deadline, type: 'Project' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  // Today's schedule
  const schedule = todayTasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Active semester subjects
  const activeSem = state.academicYears.flatMap((y) => y.semesters).find((s) => s.active);
  const subjects = activeSem?.subjects ?? [];
  const avgPrep = subjects.length > 0 ? average(subjects.map((s) => s.prepPercentage)) : 0;

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="card p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, var(--primary), var(--navy, #102a43))', borderColor: 'transparent' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{getGreeting()}!</h1>
            <p className="text-white/80 mt-1">{formatLongDate(today)}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="badge bg-white/20 text-white">Semester {state.profile.semester}</span>
              <span className="badge bg-white/20 text-white">CGPA {state.profile.cgpa}</span>
              <span className="badge bg-white/20 text-white">{state.profile.dailyHours}h/day</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{streak}</div>
              <div className="text-xs text-white/70">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalWeek.toFixed(1)}h</div>
              <div className="text-xs text-white/70">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed Today" value={completed} color="#22c55e" onClick={() => setPage('tasks')} />
        <StatCard icon={<Clock size={20} />} label="Pending Today" value={pending} color="#f59e0b" onClick={() => setPage('tasks')} />
        <StatCard icon={<Clock size={20} />} label="Study Hours Today" value={`${totalToday}h`} color="#3b82f6" onClick={() => setPage('analytics')} />
        <StatCard icon={<Flame size={20} />} label="Learning Streak" value={`${streak}d`} color="#f97316" onClick={() => setPage('analytics')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly study chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Weekly Study Hours</h3>
            <TrendingUp size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <BarChart data={last7} />
        </div>

        {/* Progress rings */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Progress</h3>
          <div className="flex justify-around items-center">
            <div className="text-center">
              <ProgressRing value={weeklyPct} color="#3b82f6" />
              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Weekly</div>
            </div>
            <div className="text-center">
              <ProgressRing value={monthlyPct} color="#22c55e" />
              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Monthly</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Exam countdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Exam Countdown</h3>
            <GraduationCap size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {upcomingExams.length === 0 ? (
            <EmptyState icon={<GraduationCap size={28} />} title="No upcoming exams" message="Add exams to see countdowns." />
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((e) => {
                const days = daysBetween(today, e.date);
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                    <div className="text-center px-3 py-1 rounded-lg" style={{ backgroundColor: days <= 7 ? '#fee2e2' : '#dbeafe', color: days <= 7 ? '#b91c1c' : '#1d4ed8' }}>
                      <div className="text-xl font-bold">{days}</div>
                      <div className="text-[9px]">days</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{e.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.type} • {e.totalMarks} marks</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="btn btn-ghost w-full mt-3" onClick={() => setPage('exams')}>View all exams</button>
        </div>

        {/* Today's schedule */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Today's Schedule</h3>
            <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {schedule.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="All clear!" message="No pending tasks for today." />
          ) : (
            <div className="space-y-2">
              {schedule.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-2)]">
                  <div className="text-xs font-semibold w-12" style={{ color: 'var(--primary)' }}>{t.startTime}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.category} • {t.duration}min</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-ghost w-full mt-3" onClick={() => setPage('planner')}>Open planner</button>
        </div>

        {/* Upcoming deadlines */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Upcoming Deadlines</h3>
            <AlertCircle size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {deadlines.length === 0 ? (
            <EmptyState icon={<AlertCircle size={28} />} title="No deadlines" message="Nothing due soon." />
          ) : (
            <div className="space-y-2">
              {deadlines.map((d, i) => {
                const days = daysBetween(today, d.date);
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-2)]">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.type}</div>
                    </div>
                    <span className={`badge ${days <= 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{days}d left</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject prep */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Subject Preparation</h3>
            <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {subjects.length === 0 ? (
            <EmptyState icon={<BookOpen size={28} />} title="No subjects" message="Add subjects in Academic section." />
          ) : (
            <div className="space-y-3">
              {subjects.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{s.prepPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.prepPercentage}%`, backgroundColor: s.prepPercentage < 40 ? '#ef4444' : s.prepPercentage < 70 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task distribution donut */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Task Distribution</h3>
          <DonutChart
            segments={[
              { label: 'Academic', value: state.tasks.filter((t) => t.category === 'Academic').length, color: '#3b82f6' },
              { label: 'Programming', value: state.tasks.filter((t) => t.category === 'Programming').length, color: '#22c55e' },
              { label: 'AI/ML', value: state.tasks.filter((t) => t.category === 'AI/ML').length, color: '#f59e0b' },
              { label: 'Revision', value: state.tasks.filter((t) => t.category === 'Revision').length, color: '#a855f7' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="card card-hover p-4 text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20', color }}>{icon}</div>
      </div>
      <div className="stat-num">{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </button>
  );
}

function computeStreak(logs: { date: string; hours: number }[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].filter((l) => l.hours > 0).sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return 0;
  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = yesterday.toISOString().slice(0, 10);
  if (sorted[0].date !== today && sorted[0].date !== yIso) return 0;
  let streak = 0;
  let cursor = new Date(sorted[0].date + 'T00:00:00');
  const set = new Set(sorted.map((l) => l.date));
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

import { useStore } from '@/lib/store';
import { BarChart, LineChart, DonutChart } from '@/components/charts';
import { ProgressRing } from '@/components/ui';
import { todayISO, daysBetween, average } from '@/lib/utils';
import { TrendingUp, Award, Brain, Code2, BarChart3 } from 'lucide-react';

export function Analytics() {
  const { state } = useStore();
  const today = todayISO();

  // Daily hours (last 7)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), value: state.studyLogs.find((l) => l.date === iso)?.hours ?? 0 };
  });

  // Monthly hours (last 30 days grouped by week)
  const last30 = Array.from({ length: 4 }, (_, i) => {
    let sum = 0;
    for (let j = 0; j < 7; j++) {
      const d = new Date();
      d.setDate(d.getDate() - (27 - (i * 7 + j)));
      const iso = d.toISOString().slice(0, 10);
      sum += state.studyLogs.find((l) => l.date === iso)?.hours ?? 0;
    }
    return { label: `W${i + 1}`, value: Math.round(sum * 10) / 10 };
  });

  // Subject progress
  const subjects = state.academicYears.flatMap((y) => y.semesters).flatMap((s) => s.subjects);
  const subjectData = subjects.map((s) => ({ label: s.name.split(' ').slice(0, 2).join(' '), value: s.prepPercentage }));

  // Quiz performance
  const quizAvg = state.quizResults.length > 0 ? (state.quizResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / state.quizResults.length) : 0;

  // Coding practice
  const progTopics = state.progRoadmap.flatMap((l) => l.topics);
  const progDone = progTopics.filter((t) => t.status === 'completed').length;
  const progPct = progTopics.length > 0 ? (progDone / progTopics.length) * 100 : 0;

  // AI topics
  const aiTopics = state.aiRoadmap.flatMap((l) => l.topics);
  const aiDone = aiTopics.filter((t) => t.status === 'completed').length;
  const aiPct = aiTopics.length > 0 ? (aiDone / aiTopics.length) * 100 : 0;

  // Strong / weak subjects
  const sortedSubs = [...subjects].sort((a, b) => b.prepPercentage - a.prepPercentage);
  const strong = sortedSubs.slice(0, 3);
  const weak = [...sortedSubs].reverse().slice(0, 3);

  // Streak
  const streak = computeStreak(state.studyLogs);
  const totalHours = state.studyLogs.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track your learning progress over time</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={20} />} label="Total Study Hours" value={`${totalHours.toFixed(1)}h`} color="#3b82f6" />
        <StatCard icon={<Award size={20} />} label="Learning Streak" value={`${streak} days`} color="#f97316" />
        <StatCard icon={<BarChart3 size={20} />} label="Quiz Average" value={`${Math.round(quizAvg)}%`} color="#22c55e" />
        <StatCard icon={<Code2 size={20} />} label="Coding Progress" value={`${Math.round(progPct)}%`} color="#a855f7" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily study hours */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Daily Study Hours (Last 7 days)</h3>
          <BarChart data={last7} color="#3b82f6" />
        </div>

        {/* Weekly trend */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Weekly Study Trend (Last 4 weeks)</h3>
          <LineChart data={last30} color="#22c55e" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subject progress */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-4">Subject-wise Progress</h3>
          {subjectData.length > 0 ? (
            <BarChart data={subjectData} color="#2563eb" max={100} />
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No subjects yet.</p>
          )}
        </div>

        {/* Progress rings */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Learning Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProgressRing value={progPct} size={64} stroke={6} color="#a855f7" />
              <div>
                <div className="font-semibold text-sm">Programming</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{progDone}/{progTopics.length} topics</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={aiPct} size={64} stroke={6} color="#22c55e" />
              <div>
                <div className="font-semibold text-sm">AI / ML</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{aiDone}/{aiTopics.length} topics</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={quizAvg} size={64} stroke={6} color="#f59e0b" />
              <div>
                <div className="font-semibold text-sm">Quiz Score</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{state.quizResults.length} attempts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strong / weak subjects */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Award size={18} className="text-green-500" /> Strong Subjects</h3>
          {strong.length > 0 ? (
            <div className="space-y-2">
              {strong.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-2)]">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-sm font-medium flex-1">{s.name}</span>
                  <span className="text-sm font-bold text-green-600">{s.prepPercentage}%</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Add subjects to see analysis.</p>}
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><Brain size={18} className="text-red-500" /> Weak Subjects (focus here)</h3>
          {weak.length > 0 ? (
            <div className="space-y-2">
              {weak.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-2)]">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-sm font-medium flex-1">{s.name}</span>
                  <span className="text-sm font-bold text-red-600">{s.prepPercentage}%</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Add subjects to see analysis.</p>}
        </div>
      </div>

      {/* Task distribution */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Task Distribution</h3>
        <DonutChart
          segments={[
            { label: 'Academic', value: state.tasks.filter((t) => t.category === 'Academic').length, color: '#3b82f6' },
            { label: 'Programming', value: state.tasks.filter((t) => t.category === 'Programming').length, color: '#22c55e' },
            { label: 'AI/ML', value: state.tasks.filter((t) => t.category === 'AI/ML').length, color: '#f59e0b' },
            { label: 'Revision', value: state.tasks.filter((t) => t.category === 'Revision').length, color: '#a855f7' },
            { label: 'Other', value: state.tasks.filter((t) => t.category === 'Other').length, color: '#64748b' },
          ]}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className="p-2 rounded-lg w-fit mb-2" style={{ backgroundColor: color + '20', color }}>{icon}</div>
      <div className="stat-num">{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function computeStreak(logs: { date: string; hours: number }[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].filter((l) => l.hours > 0).sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return 0;
  const today = todayISO();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yIso = y.toISOString().slice(0, 10);
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

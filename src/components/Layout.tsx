
import { type ReactNode } from 'react';
import {
  LayoutDashboard, BookOpen, GraduationCap, CalendarClock, CalendarDays,
  Code2, BrainCircuit, CheckSquare, RotateCcw, HelpCircle, BarChart3,
  Lightbulb, FolderKanban, Briefcase, Settings, Moon, Sun, X, Menu,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export type PageKey =
  | 'dashboard' | 'academic' | 'exams' | 'planner' | 'programming'
  | 'ai' | 'tasks' | 'revision' | 'quiz' | 'calendar' | 'analytics'
  | 'assistant' | 'projects' | 'career' | 'settings';

const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'academic', label: 'Academic', icon: BookOpen },
  { key: 'exams', label: 'Exams', icon: GraduationCap },
  { key: 'planner', label: 'Daily Planner', icon: CalendarClock },
  { key: 'programming', label: 'Programming', icon: Code2 },
  { key: 'ai', label: 'AI / ML Roadmap', icon: BrainCircuit },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'revision', label: 'Revision', icon: RotateCcw },
  { key: 'quiz', label: 'Quiz & Tests', icon: HelpCircle },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'assistant', label: 'AI Assistant', icon: Lightbulb },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'career', label: 'Career Prep', icon: Briefcase },
  { key: 'settings', label: 'Settings', icon: Settings },
];

interface LayoutProps {
  page: PageKey;
  setPage: (p: PageKey) => void;
  children: ReactNode;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export function Layout({
  page,
  setPage,
  children,
  mobileNavOpen,
  setMobileNavOpen,
}: LayoutProps) {
  const { state, setState } = useStore();
  const dark = state.profile.darkMode;

  const toggleDark = () =>
    setState((s) => ({
      ...s,
      profile: { ...s.profile, darkMode: !s.profile.darkMode },
    }));

  const go = (p: PageKey) => {
    setPage(p);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r p-4 sticky top-0 h-screen"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            S
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Smart Study</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              AI Learning System
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;

            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'text-white' : 'hover:bg-[var(--surface-2)]'
                }`}
                style={
                  active
                    ? { backgroundColor: 'var(--primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={toggleDark}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--surface-2)] transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />

          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col overflow-hidden animate-fade-in"
            style={{
              backgroundColor: 'var(--surface)',
              height: '100dvh',
              maxHeight: '100dvh',
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between p-4 shrink-0 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  S
                </div>
                <span className="font-bold">Smart Study</span>
              </div>

              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2 rounded-lg"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable navigation */}
            <nav
              className="flex-1 min-h-0 overflow-y-scroll overscroll-contain space-y-1 p-4"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehaviorY: 'contain',
              }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = page === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                      active ? 'text-white' : ''
                    }`}
                    style={
                      active
                        ? { backgroundColor: 'var(--primary)' }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Fixed theme button */}
            <div
              className="shrink-0 border-t p-4"
              style={{
                borderColor: 'var(--border)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
              }}
            >
              <button
                onClick={toggleDark}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top header */}
<div
  className="lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0"
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
  }}
>
  <span className="font-bold text-sm">Smart Study AI</span>

  <button
    onClick={() => setMobileNavOpen(true)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
    style={{
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
    }}
  >
    <Menu size={20} />
    Menu
  </button>
</div><main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around px-2 py-2 z-30"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = page === item.key;

            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium"
                style={
                  active
                    ? { color: 'var(--primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <Icon size={20} />
                <span className="truncate max-w-[60px]">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

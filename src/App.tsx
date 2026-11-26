import { useState } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { Layout, type PageKey } from '@/components/Layout';
import { SetupWizard } from '@/pages/SetupWizard';
import { Dashboard } from '@/pages/Dashboard';
import { Academic } from '@/pages/Academic';
import { Exams } from '@/pages/Exams';
import { Planner } from '@/pages/Planner';
import { Roadmap } from '@/pages/Roadmap';
import { Tasks } from '@/pages/Tasks';
import { Revision } from '@/pages/Revision';
import { Quiz } from '@/pages/Quiz';
import { Calendar } from '@/pages/Calendar';
import { Analytics } from '@/pages/Analytics';
import { Assistant } from '@/pages/Assistant';
import { Projects } from '@/pages/Projects';
import { Career } from '@/pages/Career';
import { SettingsPage } from '@/pages/Settings';

function AppInner() {
  const { state } = useStore();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!state.profile.setupComplete) {
    return <SetupWizard onDone={() => setPage('dashboard')} />;
  }

  const pages: Record<PageKey, React.ReactNode> = {
    dashboard: <Dashboard setPage={setPage} />,
    academic: <Academic />,
    exams: <Exams />,
    planner: <Planner />,
    programming: <Roadmap type="programming" />,
    ai: <Roadmap type="ai" />,
    tasks: <Tasks />,
    revision: <Revision />,
    quiz: <Quiz />,
    calendar: <Calendar />,
    analytics: <Analytics />,
    assistant: <Assistant />,
    projects: <Projects />,
    career: <Career />,
    settings: <SettingsPage />,
  };

  return (
    <Layout page={page} setPage={setPage} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen}>
      {pages[page]}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}

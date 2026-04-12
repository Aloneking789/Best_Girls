import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import DashboardClient from './dashboard-client';

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }]} />
        <main className="flex-1 overflow-y-auto">
          <DashboardClient />
        </main>
      </div>
    </div>
  );
}

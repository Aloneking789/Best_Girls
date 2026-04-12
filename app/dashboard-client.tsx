'use client';

import { useState, useEffect } from 'react';
import MetricCard from '@/components/metric-card';
import { Mail, TrendingUp, Users, GraduationCap } from 'lucide-react';
import { getDashboard, DashboardMetrics } from '@/lib/api';

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your college admin panel</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-semibold">Error loading dashboard</p>
          <p className="text-destructive/80 text-sm">{error}</p>
        </div>
      )}

      {!loading && dashboardData && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Inquiries"
              value={dashboardData.inquiryCount}
              icon={<Mail size={24} />}
              trend="up"
              trendValue={8}
              color="green"
            />
            <MetricCard
              title="Placements"
              value={dashboardData.placementCount}
              icon={<TrendingUp size={24} />}
              color="blue"
            />
            <MetricCard
              title="Events"
              value={dashboardData.eventCount}
              icon={<Users size={24} />}
              trend="up"
              trendValue={3}
              color="orange"
            />
            <MetricCard
              title="Notices"
              value={dashboardData.noticeCount}
              icon={<GraduationCap size={24} />}
              trend="up"
              trendValue={12}
              color="purple"
            />
          </div>
        </>
      )}
    </div>
  );
}

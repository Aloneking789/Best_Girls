'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '@/components/metric-card';
import { Users, BookOpen, Mail, Bell, TrendingUp, GraduationCap } from 'lucide-react';

const chartData = [
  { month: 'Jan', admissions: 65, leads: 45, events: 28 },
  { month: 'Feb', admissions: 78, leads: 52, events: 35 },
  { month: 'Mar', admissions: 92, leads: 68, events: 42 },
  { month: 'Apr', admissions: 110, leads: 85, events: 55 },
  { month: 'May', admissions: 125, leads: 95, events: 62 },
  { month: 'Jun', admissions: 145, leads: 115, events: 78 },
];

const pieData = [
  { name: 'Approved', value: 45, color: '#10b981' },
  { name: 'Pending', value: 28, color: '#f59e0b' },
  { name: 'Rejected', value: 12, color: '#ef4444' },
];

const recentAdmissions = [
  { id: 1, name: 'John Smith', status: 'Approved', date: '2024-04-10', course: 'B.Tech' },
  { id: 2, name: 'Sarah Johnson', status: 'Pending', date: '2024-04-09', course: 'MBA' },
  { id: 3, name: 'Mike Davis', status: 'Approved', date: '2024-04-08', course: 'B.Tech' },
  { id: 4, name: 'Emma Wilson', status: 'Pending', date: '2024-04-07', course: 'M.Tech' },
  { id: 5, name: 'Alex Brown', status: 'Rejected', date: '2024-04-06', course: 'PhD' },
];

const recentLeads = [
  { id: 1, name: 'Lisa Anderson', date: '2024-04-10', read: false },
  { id: 2, name: 'Tom Harris', date: '2024-04-09', read: true },
  { id: 3, name: 'Jessica Lee', date: '2024-04-08', read: false },
  { id: 4, name: 'David Miller', date: '2024-04-07', read: true },
];

const latestNotices = [
  { id: 1, title: 'Exam Schedule Released', type: 'Exam', date: '2024-04-10' },
  { id: 2, title: 'Holiday Announcement', type: 'Announcement', date: '2024-04-09' },
  { id: 3, title: 'Admission Results Out', type: 'General', date: '2024-04-08' },
];

export default function DashboardClient() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Exam':
        return 'bg-blue-100 text-blue-800';
      case 'Announcement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your college admin panel</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Admissions"
          value={342}
          icon={<GraduationCap size={24} />}
          trend="up"
          trendValue={12}
          color="blue"
        />
        <MetricCard
          title="Pending Admissions"
          value={28}
          icon={<TrendingUp size={24} />}
          color="orange"
        />
        <MetricCard
          title="Contact Leads"
          value={156}
          icon={<Mail size={24} />}
          trend="up"
          trendValue={8}
          color="green"
        />
        <MetricCard
          title="Unread Leads"
          value={12}
          icon={<Users size={24} />}
          trend="down"
          trendValue={3}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Activity Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="admissions" stroke="#0369a1" name="Admissions" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="#0284c7" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="events" stroke="#06b6d4" name="Events" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Admission Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Admissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.map((admission) => (
                  <tr key={admission.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4 text-foreground">{admission.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(admission.status)}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{admission.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4 text-foreground">{lead.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${lead.read ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {lead.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Latest Notices */}
      <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">Latest Notices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {latestNotices.map((notice) => (
                <tr key={notice.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{notice.title}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(notice.type)}`}>
                      {notice.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{notice.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

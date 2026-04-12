'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';

interface Admission {
  id: number;
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  lastModified: string;
}

const admissionsData: Admission[] = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '9876543210', courseInterest: 'B.Tech CSE', status: 'Approved', submittedDate: '2024-04-01', lastModified: '2024-04-10' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '9876543211', courseInterest: 'MBA', status: 'Pending', submittedDate: '2024-04-05', lastModified: '2024-04-10' },
  { id: 3, name: 'Mike Davis', email: 'mike@example.com', phone: '9876543212', courseInterest: 'M.Tech AI', status: 'Approved', submittedDate: '2024-04-03', lastModified: '2024-04-09' },
  { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '9876543213', courseInterest: 'BBA', status: 'Pending', submittedDate: '2024-04-07', lastModified: '2024-04-10' },
  { id: 5, name: 'Alex Brown', email: 'alex@example.com', phone: '9876543214', courseInterest: 'B.Tech Mechanical', status: 'Rejected', submittedDate: '2024-04-02', lastModified: '2024-04-08' },
];

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>(admissionsData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAdmissions = admissions
    .filter(a =>
      (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.includes(searchQuery)) &&
      (filterStatus === 'All' || a.status === filterStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

  const paginatedAdmissions = filteredAdmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAdmissions.length / itemsPerPage);

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

  const handleEdit = (admission: Admission) => {
    setSelectedAdmission(admission);
    setIsEditModalOpen(true);
  };

  const handleView = (admission: Admission) => {
    setSelectedAdmission(admission);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setAdmissions(admissions.filter(a => a.id !== id));
  };

  const handleAddAdmission = (formData: any) => {
    const newAdmission: Admission = {
      id: Math.max(...admissions.map(a => a.id), 0) + 1,
      ...formData,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setAdmissions([newAdmission, ...admissions]);
    setIsAddModalOpen(false);
  };

  const handleUpdateAdmission = (formData: any) => {
    if (selectedAdmission) {
      setAdmissions(admissions.map(a =>
        a.id === selectedAdmission.id
          ? {
            ...a,
            ...formData,
            lastModified: new Date().toISOString().split('T')[0],
          }
          : a
      ));
      setIsEditModalOpen(false);
      setSelectedAdmission(null);
    }
  };

  const stats = {
    pending: admissions.filter(a => a.status === 'Pending').length,
    approved: admissions.filter(a => a.status === 'Approved').length,
    rejected: admissions.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Admissions' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admissions</h1>
                <p className="text-muted-foreground mt-1">Manage student applications and admissions</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> New Application
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Course</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Submitted</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdmissions.map((admission) => (
                    <tr key={admission.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{admission.name}</td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">{admission.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{admission.courseInterest}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(admission.status)}`}>
                          {admission.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{admission.submittedDate}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(admission)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="View"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(admission)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(admission.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-muted'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Modal */}
      {selectedAdmission && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Admission Details"
        >
          <div className="space-y-3 text-sm">
            <div><strong>Name:</strong> {selectedAdmission.name}</div>
            <div><strong>Email:</strong> {selectedAdmission.email}</div>
            <div><strong>Phone:</strong> {selectedAdmission.phone}</div>
            <div><strong>Course:</strong> {selectedAdmission.courseInterest}</div>
            <div><strong>Status:</strong> {selectedAdmission.status}</div>
            <div><strong>Submitted:</strong> {selectedAdmission.submittedDate}</div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Admission"
      >
        <AdmissionForm onSubmit={handleAddAdmission} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Admission Status"
      >
        <AdmissionForm
          initialData={selectedAdmission || undefined}
          onSubmit={handleUpdateAdmission}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function AdmissionForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Admission;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    courseInterest: initialData?.courseInterest || '',
    status: initialData?.status || 'Pending',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={!!initialData}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!!initialData}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!!initialData}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Course Interest</label>
        <select
          value={formData.courseInterest}
          onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={!!initialData}
        >
          <option value="">Select Course</option>
          <option value="B.Tech CSE">B.Tech CSE</option>
          <option value="B.Tech Mechanical">B.Tech Mechanical</option>
          <option value="MBA">MBA</option>
          <option value="M.Tech AI">M.Tech AI</option>
          <option value="BBA">BBA</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pending' | 'Approved' | 'Rejected' })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Admission
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

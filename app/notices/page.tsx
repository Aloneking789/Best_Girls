'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Clock } from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  type: 'Exam' | 'Announcement' | 'General';
  publishedAt: string;
  expiryDate: string;
  isArchived: boolean;
  body: string;
}

const noticesData: Notice[] = [
  { id: 1, title: 'Exam Schedule Released', type: 'Exam', publishedAt: '2024-04-10', expiryDate: '2024-05-31', isArchived: false, body: 'Spring semester exam schedule has been released. Check the portal for details.' },
  { id: 2, title: 'Holiday Announcement', type: 'Announcement', publishedAt: '2024-04-09', expiryDate: '2024-04-30', isArchived: false, body: 'Campus will be closed for summer holidays from June 1st.' },
  { id: 3, title: 'Fee Payment Due', type: 'General', publishedAt: '2024-04-08', expiryDate: '2024-04-20', isArchived: false, body: 'Please submit your fees by April 20th to avoid late charges.' },
  { id: 4, title: 'Old Admission Notice', type: 'Announcement', publishedAt: '2024-03-01', expiryDate: '2024-03-31', isArchived: true, body: 'This notice has expired.' },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(noticesData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNotices = notices
    .filter(notice =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterType === 'All' || notice.type === filterType) &&
      (filterStatus === 'All' || (filterStatus === 'Active' && !notice.isArchived) || (filterStatus === 'Archived' && notice.isArchived))
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Exam':
        return 'bg-red-100 text-red-800';
      case 'Announcement':
        return 'bg-blue-100 text-blue-800';
      case 'General':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  const handleAddNotice = (formData: any) => {
    const newNotice: Notice = {
      id: Math.max(...notices.map(n => n.id), 0) + 1,
      ...formData,
      isArchived: false,
      publishedAt: new Date().toISOString().split('T')[0],
    };
    setNotices([newNotice, ...notices]);
    setIsAddModalOpen(false);
  };

  const handleUpdateNotice = (formData: any) => {
    if (selectedNotice) {
      setNotices(notices.map(notice =>
        notice.id === selectedNotice.id
          ? { ...notice, ...formData }
          : notice
      ));
      setIsEditModalOpen(false);
      setSelectedNotice(null);
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Notice Board' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Notice Board</h1>
                <p className="text-muted-foreground mt-1">Manage notices and announcements</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Post Notice
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Types</option>
                  <option value="Exam">Exam</option>
                  <option value="Announcement">Announcement</option>
                  <option value="General">General</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Title</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Published</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Expires</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotices.map((notice) => (
                    <tr key={notice.id} className={`border-b border-border hover:bg-muted transition-colors ${isExpired(notice.expiryDate) && !notice.isArchived ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-6 font-medium text-foreground">{notice.title}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(notice.type)}`}>
                          {notice.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{notice.publishedAt}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          {isExpired(notice.expiryDate) && <Clock size={16} className="text-red-600" />}
                          {notice.expiryDate}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${notice.isArchived
                            ? 'bg-gray-100 text-gray-800'
                            : isExpired(notice.expiryDate)
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                          {notice.isArchived ? 'Archived' : isExpired(notice.expiryDate) ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(notice.id)}
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Post New Notice"
      >
        <NoticeForm onSubmit={handleAddNotice} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Notice"
      >
        <NoticeForm
          initialData={selectedNotice || undefined}
          onSubmit={handleUpdateNotice}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function NoticeForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Notice;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || 'General',
    body: initialData?.body || '',
    expiryDate: initialData?.expiryDate || '',
    isArchived: initialData?.isArchived || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Exam' | 'Announcement' | 'General' })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Exam">Exam</option>
            <option value="Announcement">Announcement</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Content</label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={5}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="archived"
          checked={formData.isArchived}
          onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="archived" className="text-sm text-foreground">Mark as Archived</label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Post'} Notice
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

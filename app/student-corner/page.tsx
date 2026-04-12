'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';

interface StudentItem {
  id: number;
  title: string;
  category: string;
  content: string;
  postedDate: string;
  externalUrl?: string;
}

const studentItemsData: StudentItem[] = [
  { id: 1, title: 'Class Timetable - Spring 2024', category: 'Timetable', content: 'Updated class schedule for all streams', postedDate: '2024-04-10', externalUrl: 'https://example.com/timetable' },
  { id: 2, title: 'Exam Guidelines', category: 'Notice', content: 'Important guidelines for semester exams', postedDate: '2024-04-09' },
  { id: 3, title: 'Library Timings', category: 'Announcement', content: 'Library will be open from 8 AM to 10 PM', postedDate: '2024-04-08' },
  { id: 4, title: 'Assignment Submission Portal', category: 'Link', content: 'Submit all assignments through the new portal', postedDate: '2024-04-07', externalUrl: 'https://example.com/assignments' },
];

const downloadItemsData = [
  { id: 1, title: 'Student Handbook PDF', category: 'Handbook', url: '#', postedDate: '2024-03-01' },
  { id: 2, title: 'Merit Certificate Template', category: 'Forms', url: '#', postedDate: '2024-02-20' },
  { id: 3, title: 'Fee Receipt Format', category: 'Forms', url: '#', postedDate: '2024-02-15' },
];

export default function StudentCornerPage() {
  const [studentItems, setStudentItems] = useState<StudentItem[]>(studentItemsData);
  const [downloads, setDownloads] = useState(downloadItemsData);
  const [activeTab, setActiveTab] = useState('items');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = (activeTab === 'items' ? studentItems : downloads)
    .filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === 'All' || item.category === filterCategory)
    )
    .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleEdit = (item: StudentItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (activeTab === 'items') {
      setStudentItems(studentItems.filter(i => i.id !== id));
    } else {
      setDownloads(downloads.filter(i => i.id !== id));
    }
  };

  const handleAddItem = (formData: any) => {
    if (activeTab === 'items') {
      const newItem: StudentItem = {
        id: Math.max(...studentItems.map(i => i.id), 0) + 1,
        ...formData,
        postedDate: new Date().toISOString().split('T')[0],
      };
      setStudentItems([newItem, ...studentItems]);
    }
    setIsAddModalOpen(false);
  };

  const handleUpdateItem = (formData: any) => {
    if (selectedItem && activeTab === 'items') {
      setStudentItems(studentItems.map(item =>
        item.id === selectedItem.id ? { ...item, ...formData } : item
      ));
      setIsEditModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Student Corner' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Student Corner</h1>
                <p className="text-muted-foreground mt-1">Manage timetables, notices, and student resources</p>
              </div>
              {activeTab === 'items' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} /> Add Item
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border">
              {[
                { id: 'items', label: 'Timetable & Notices' },
                { id: 'downloads', label: 'Downloads' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Categories</option>
                  {activeTab === 'items' ? (
                    <>
                      <option value="Timetable">Timetable</option>
                      <option value="Notice">Notice</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Link">Link</option>
                    </>
                  ) : (
                    <>
                      <option value="Handbook">Handbook</option>
                      <option value="Forms">Forms</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Title</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Posted</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{item.title}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{item.postedDate}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {activeTab === 'items' && 'externalUrl' in item && item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              title="Open Link"
                            >
                              <Download size={18} />
                            </a>
                          )}
                          {activeTab === 'downloads' && 'url' in item && item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={18} />
                            </a>
                          )}
                          {activeTab === 'items' && (
                            <>
                              <button
                                onClick={() => handleEdit(item as StudentItem)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          {activeTab === 'downloads' && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
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
        title="Add Student Item"
      >
        <StudentItemForm onSubmit={handleAddItem} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Item"
      >
        <StudentItemForm
          initialData={selectedItem || undefined}
          onSubmit={handleUpdateItem}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function StudentItemForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: StudentItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    content: initialData?.content || '',
    externalUrl: initialData?.externalUrl || '',
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

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select Category</option>
          <option value="Timetable">Timetable</option>
          <option value="Notice">Notice</option>
          <option value="Announcement">Announcement</option>
          <option value="Link">Link</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">External URL (Optional)</label>
        <input
          type="url"
          value={formData.externalUrl}
          onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://example.com"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Item
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

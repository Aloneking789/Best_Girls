'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff, Search } from 'lucide-react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  DepartmentCreatePayload,
  DepartmentUpdatePayload,
} from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('createdAt');
  const itemsPerPage = 10;

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort departments
  const filteredDepartments = departments
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const handleOpenModal = (department?: Department) => {
    if (department) {
      setEditingId(department.id);
      setFormData(department);
    } else {
      setEditingId(null);
      setFormData({ isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!formData.name?.trim() || !formData.description?.trim()) {
        setError('Name and description are required');
        setActionLoading(false);
        return;
      }

      if (editingId) {
        const payload: DepartmentUpdatePayload = {
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
        };

        const updated = await updateDepartment(editingId, payload);
        setDepartments(departments.map(d => (d.id === editingId ? updated : d)));
      } else {
        const payload: DepartmentCreatePayload = {
          name: formData.name || '',
          slug: formData.slug || (formData.name || '').toLowerCase().replace(/\s+/g, '-'),
          description: formData.description || '',
          isActive: formData.isActive !== undefined ? formData.isActive : true,
        };

        const created = await createDepartment(payload);
        setDepartments([...departments, created]);
      }

      setIsModalOpen(false);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      setActionLoading(true);
      setError(null);
      await deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Departments']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Departments</h1>
              <button
                onClick={() => handleOpenModal()}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Add Department
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt')}
                className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="createdAt">Sort by Newest</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">NAME</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">SLUG</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">DESCRIPTION</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">STATUS</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDepartments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              No departments found
                            </td>
                          </tr>
                        ) : (
                          paginatedDepartments.map((dept) => (
                            <tr key={dept.id} className="border-b border-border hover:bg-muted/30">
                              <td className="py-4 px-4 font-medium">{dept.name}</td>
                              <td className="py-4 px-4 text-sm text-muted-foreground">{dept.slug}</td>
                              <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">
                                {dept.description}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${dept.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                  {dept.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center space-x-2">
                                <button
                                  onClick={() => handleOpenModal(dept)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-primary/10 text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(dept.id)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-lg ${currentPage === i + 1
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Department' : 'Add Department'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
            <input
              type="text"
              placeholder="Enter department name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
            <input
              type="text"
              placeholder="Auto-generated from name"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
            <textarea
              placeholder="Enter department description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={actionLoading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

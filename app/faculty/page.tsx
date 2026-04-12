'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  toggleFeatureFaculty,
  getDepartments,
  Faculty,
  Department,
  FacultyCreatePayload,
  FacultyUpdatePayload,
} from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'order'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch faculty and departments on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [facultyData, deptData] = await Promise.all([getFaculty(), getDepartments()]);
      setFaculty(facultyData);
      setDepartments(deptData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty
    .filter(
      f =>
        (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.email?.includes(searchQuery)) &&
        (!filterDept || f.departmentId === filterDept)
    )
    .sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : a.order - b.order));

  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);

  const handleEdit = (item: Faculty) => {
    setSelectedFaculty(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      setActionLoading(true);
      setError(null);
      await deleteFaculty(id);
      setFaculty(faculty.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete faculty');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleFeatureFaculty(id);
      setFaculty(faculty.map(f => (f.id === id ? updated : f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle featured status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFaculty = async (formData: FacultyCreatePayload) => {
    try {
      setActionLoading(true);
      setError(null);
      const created = await createFaculty(formData);
      setFaculty([...faculty, created]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create faculty');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFaculty = async (formData: FacultyUpdatePayload) => {
    if (!selectedFaculty) return;
    try {
      setActionLoading(true);
      setError(null);
      const updated = await updateFaculty(selectedFaculty.id, formData);
      setFaculty(faculty.map(f => (f.id === selectedFaculty.id ? updated : f)));
      setIsEditModalOpen(false);
      setSelectedFaculty(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update faculty');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumb={['Faculty Management']} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Faculty Members</h1>
                <p className="text-muted-foreground mt-1">Manage all faculty and staff</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={actionLoading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Add Faculty
              </button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
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
                  value={filterDept}
                  onChange={(e) => {
                    setFilterDept(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="order">Sort by Order</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Photo</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Designation</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Department</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Featured</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedFaculty.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              No faculty found
                            </td>
                          </tr>
                        ) : (
                          paginatedFaculty.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-6">
                                {item.photoUrl && (
                                  <img
                                    src={item.photoUrl}
                                    alt={item.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                              </td>
                              <td className="py-4 px-6 font-medium text-foreground">{item.name}</td>
                              <td className="py-4 px-6 text-muted-foreground">{item.designation || '-'}</td>
                              <td className="py-4 px-6 text-muted-foreground text-xs">{item.department.name}</td>
                              <td className="py-4 px-6 text-muted-foreground text-xs">{item.email || '-'}</td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleToggleFeatured(item.id)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-amber-100 text-amber-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  title="Toggle Featured"
                                >
                                  <Star size={18} fill={item.isFeatured ? 'currentColor' : 'none'} />
                                </button>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    disabled={actionLoading}
                                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={actionLoading}
                                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              </>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Faculty Member">
        <FacultyForm
          departments={departments}
          onSubmit={handleAddFaculty}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Faculty Member">
        <FacultyForm
          initialData={selectedFaculty || undefined}
          departments={departments}
          onSubmit={handleUpdateFaculty}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>
    </div>
  );
}

function FacultyForm({
  initialData,
  departments,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Faculty;
  departments: Department[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    designation: initialData?.designation || '',
    departmentId: initialData?.departmentId || '',
    email: initialData?.email || '',
    qualification: initialData?.qualification || '',
    experience: initialData?.experience || '',
    staffType: initialData?.staffType || '',
    bio: initialData?.bio || '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ...(selectedPhoto && { photo: selectedPhoto }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Designation</label>
          <input
            type="text"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Department *</label>
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Qualification *</label>
          <input
            type="text"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Experience</label>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Staff Type</label>
          <input
            type="text"
            value={formData.staffType}
            onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedPhoto(file);
          }}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {(selectedPhoto || (initialData?.photoUrl && !selectedPhoto)) && (
          <img
            src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : initialData?.photoUrl}
            alt="Preview"
            className="mt-2 h-24 w-24 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

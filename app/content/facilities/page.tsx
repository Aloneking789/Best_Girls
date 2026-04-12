'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff, Search } from 'lucide-react';
import { getFacilities, createFacility, updateFacility, deleteFacility, toggleFacility, Facility, FacilityCreatePayload, FacilityUpdatePayload } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'title' | 'sortOrder'>('sortOrder');
  const itemsPerPage = 10;

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFacilities();
      setFacilities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load facilities');
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort facilities
  const filteredFacilities = facilities
    .filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.sortOrder - b.sortOrder;
    });

  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingId(facility.id);
      setFormData(facility);
    } else {
      setEditingId(null);
      setFormData({ sortOrder: facilities.length + 1 });
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!formData.title?.trim()) {
        setError('Title is required');
        setActionLoading(false);
        return;
      }

      // Use the Facility interface API functions
      if (editingId) {
        const payload: FacilityUpdatePayload = {
          title: formData.title,
          sortOrder: formData.sortOrder || 0,
        };
        if (selectedImage) {
          payload.image = selectedImage;
        }

        const updated = await updateFacility(editingId, payload);
        setFacilities(facilities.map(f => f.id === editingId ? updated : f));
      } else {
        const payload: FacilityCreatePayload = {
          title: formData.title,
          sortOrder: formData.sortOrder || 1,
        };
        if (selectedImage) {
          payload.image = selectedImage;
        }

        const created = await createFacility(payload);
        setFacilities([...facilities, created]);
      }

      setIsModalOpen(false);
      setFormData({});
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save facility');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;

    try {
      setActionLoading(true);
      setError(null);
      await deleteFacility(id);
      setFacilities(facilities.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete facility');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleFacility(id);
      setFacilities(facilities.map(f => f.id === id ? updated : f));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle facility');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Campus Facilities']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Campus Facilities</h1>
              <button
                onClick={() => handleOpenModal()}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Add Facility
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search facilities..."
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
                onChange={(e) => setSortBy(e.target.value as 'title' | 'sortOrder')}
                className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="sortOrder">Sort by Order</option>
                <option value="title">Sort by Title</option>
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
                          <th className="text-left py-3 px-4 font-semibold text-foreground">TITLE</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">IMAGE</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ORDER</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">STATUS</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedFacilities.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              No facilities found
                            </td>
                          </tr>
                        ) : (
                          paginatedFacilities.map((facility) => (
                            <tr key={facility.id} className="border-b border-border hover:bg-muted/30">
                              <td className="py-4 px-4 font-medium">{facility.title}</td>
                              <td className="py-4 px-4 text-center">
                                {facility.image && (
                                  <img src={facility.image} alt={facility.title} className="h-10 w-10 rounded object-cover mx-auto" />
                                )}
                              </td>
                              <td className="py-4 px-4 text-center text-sm">{facility.sortOrder}</td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => handleToggle(facility.id)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {facility.isActive ? (
                                    <Eye size={18} className="text-primary" />
                                  ) : (
                                    <EyeOff size={18} className="text-muted-foreground" />
                                  )}
                                </button>
                              </td>
                              <td className="py-4 px-4 text-center space-x-2">
                                <button
                                  onClick={() => handleOpenModal(facility)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-primary/10 text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(facility.id)}
                                  disabled={actionLoading}
                                  className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
        title={editingId ? 'Edit Facility' : 'Add Facility'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter facility title"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
            <input
              type="number"
              value={formData.sortOrder || 0}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              placeholder="Enter sort order"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Image</label>
            <div className="space-y-2">
              {(selectedImage || (editingId && formData.image)) && (
                <div className="relative">
                  <img
                    src={selectedImage ? URL.createObjectURL(selectedImage) : (formData.image as string)}
                    alt="Preview"
                    className="w-full h-40 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedImage(file);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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

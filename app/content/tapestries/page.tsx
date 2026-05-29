'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getToken } from '@/lib/api';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';

interface Tapestry {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  title: string;
  image: File | null;
}

const API_BASE_URL = 'https://kgvit.vercel.app/api/v1/tapastries';

export default function TapestryTalesPage() {
  const [tapestries, setTapestries] = useState<Tapestry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({ title: '', image: null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch tapestries
  const fetchTapestries = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setTapestries(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tapestries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tapestries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTapestries();
  }, []);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ title: '', image: null });
    setImagePreview(null);
    setEditingImagePreview(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (tapestry: Tapestry) => {
    setIsEditMode(true);
    setEditingId(tapestry.id);
    setFormData({ title: tapestry.title, image: null });
    setImagePreview(null);
    setEditingImagePreview(tapestry.imageUrl);
    setIsModalOpen(true);
  };

  // Create tapestry
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.image) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title and image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('image', formData.image);

      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: missing auth token');
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tapestry created successfully',
        });
        setIsModalOpen(false);
        fetchTapestries();
      } else {
        throw new Error(data.message || 'Failed to create tapestry');
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tapestry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update tapestry
  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('title', formData.title);

      // Only append image if a new one was selected
      if (formData.image) {
        fd.append('image', formData.image);
      }

      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: missing auth token');
      }

      const response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tapestry updated successfully',
        });
        setIsModalOpen(false);
        fetchTapestries();
      } else {
        throw new Error(data.message || 'Failed to update tapestry');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update tapestry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tapestry
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tapestry?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: missing auth token');
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tapestry deleted successfully',
        });
        fetchTapestries();
      } else {
        throw new Error('Failed to delete tapestry');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tapestry',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Tapestry Tales']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Tapestry Tales</h1>
                <p className="text-muted-foreground mt-1">Manage your tapestry collection</p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Create Tapestry
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && tapestries.length === 0 && (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">No tapestries found</p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Create First Tapestry
                </button>
              </div>
            )}

            {/* Tapestries Grid */}
            {!loading && tapestries.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tapestries.map((tapestry) => (
                  <div
                    key={tapestry.id}
                    className="bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={tapestry.imageUrl}
                        alt={tapestry.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {tapestry.title}
                      </h3>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Created: {new Date(tapestry.createdAt).toLocaleDateString()}</p>
                        <p>Updated: {new Date(tapestry.updatedAt).toLocaleDateString()}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <button
                          onClick={() => openEditModal(tapestry)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tapestry.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold">
                    {isEditMode ? 'Edit Tapestry' : 'Create Tapestry'}
                  </h2>

                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tapestry title"
                    />
                  </div>

                  {/* Image Section */}
                  <div>
                    {isEditMode && editingImagePreview && !imagePreview && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Current Image</p>
                        <div className="relative w-full h-32 bg-muted rounded overflow-hidden">
                          <Image
                            src={editingImagePreview}
                            alt="Current tapestry"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <label className="block text-sm font-medium mb-2">
                      {isEditMode ? 'Change Image (Optional)' : 'Image'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {imagePreview && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Preview</p>
                        <div className="relative w-full h-32 bg-muted rounded overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={isEditMode ? handleUpdate : handleCreate}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : isEditMode ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

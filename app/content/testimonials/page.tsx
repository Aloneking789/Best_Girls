'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  toggleTestimonial,
  updateTestimonial,
  type Testimonial,
} from '@/lib/api';

interface TestimonialFormData {
  id?: string;
  name?: string;
  designation?: string;
  type?: 'text' | 'video';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  imageFile?: File;
  sortOrder?: number;
  published?: boolean;
}

const initialFormData: TestimonialFormData = {
  type: 'text',
  sortOrder: 0,
  published: false,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setImagePreview(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      id: testimonial.id,
      name: testimonial.name,
      designation: testimonial.designation,
      type: testimonial.type.toLowerCase() as 'text' | 'video',
      content: testimonial.content,
      videoUrl: testimonial.videoUrl ?? '',
      imageUrl: testimonial.imageUrl,
      sortOrder: testimonial.order,
      published: testimonial.isPublished,
      imageFile: undefined,
    });
    setImagePreview(testimonial.imageUrl);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this testimonial?');
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError(null);
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((testimonial) => testimonial.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleTestimonial(id);
      setTestimonials((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publication');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.designation?.trim()) {
      setError('Name and designation are required.');
      return;
    }

    if (formData.type === 'text' && !formData.content?.trim()) {
      setError('Please add testimonial text.');
      return;
    }

    if (formData.type === 'video' && !formData.videoUrl?.trim()) {
      setError('Please add a video URL.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        type: formData.type === 'video' ? 'VIDEO' : 'TEXT',
        content: formData.type === 'text' ? formData.content?.trim() || '' : undefined,
        videoUrl: formData.type === 'video' ? formData.videoUrl?.trim() || '' : undefined,
        order: formData.sortOrder ?? 0,
        isPublished: formData.published ?? false,
        image: formData.imageFile,
      };

      let savedTestimonial: Testimonial;

      if (editingId) {
        savedTestimonial = await updateTestimonial(editingId, payload);
        setTestimonials((prev) => prev.map((item) => (item.id === editingId ? savedTestimonial : item)));
      } else {
        savedTestimonial = await createTestimonial(payload as any);
        setTestimonials((prev) => [savedTestimonial, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save testimonial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Testimonials']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
                <p className="text-muted-foreground mt-1">Manage testimonial content, publication status and media.</p>
              </div>
              <button
                onClick={handleOpenAdd}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60"
              >
                <Plus size={18} /> Add Testimonial
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">Loading testimonials…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                    {testimonial.imageUrl && (
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="h-48 w-full object-cover" />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.designation}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${testimonial.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {testimonial.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <p className="text-foreground mb-4 whitespace-pre-line">{testimonial.type === 'text' ? testimonial.content : testimonial.videoUrl}</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20"
                        >
                          <Edit2 size={16} className="inline-block mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={actionLoading}
                          className="bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20"
                        >
                          <Trash2 size={16} className="inline-block mr-2" /> Delete
                        </button>
                        <button
                          onClick={() => handleTogglePublished(testimonial.id)}
                          disabled={actionLoading}
                          className="bg-secondary/10 text-secondary py-2 rounded text-sm hover:bg-secondary/20"
                        >
                          {testimonial.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              placeholder="Designation"
              value={formData.designation || ''}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <select
              value={formData.type || 'text'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="text">Text</option>
          
            </select>
            {formData.type === 'text' ? (
              <textarea
                placeholder="Quote/Text"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            ) : (
              <input
                type="text"
                placeholder="Video URL"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            )}
            <input
              type="number"
              placeholder="Sort Order"
              value={formData.sortOrder ?? 0}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.published ?? false}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Publish testimonial</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-muted-foreground"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-3 h-28 w-full rounded-lg object-cover" />
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

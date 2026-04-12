'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { getSliders, createSlider, updateSlider, deleteSlider, toggleSlider, type Slider } from '@/lib/api';

export default function SliderPage() {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch sliders on mount
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSliders();
      setSlides(data);
    } catch (err) {
      setError('Failed to load sliders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlides = slides
    .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'order') return a.order - b.order;
      return 0;
    });

  const handleOpenModal = (slide?: Slider) => {
    if (slide) {
      setEditingId(slide.id);
      setFormData({
        title: slide.title,
        caption: slide.caption,
        linkUrl: slide.linkUrl,
        order: slide.order,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        caption: '',
        linkUrl: '',
        order: 0,
      });
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!formData.title || !formData.caption || !formData.linkUrl) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingId) {
        // Update existing slider
        const updated = await updateSlider(editingId, {
          title: formData.title,
          caption: formData.caption,
          linkUrl: formData.linkUrl,
          order: formData.order || 0,
          image: selectedImage || undefined,
        });
        setSlides(slides.map(s => s.id === editingId ? updated : s));
      } else {
        // Create new slider
        if (!selectedImage) {
          setError('Please select an image');
          return;
        }

        const created = await createSlider({
          title: formData.title,
          caption: formData.caption,
          linkUrl: formData.linkUrl,
          image: selectedImage,
        });
        setSlides([...slides, created]);
      }

      setIsModalOpen(false);
      setFormData({});
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save slider');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await deleteSlider(id);
      setSlides(slides.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slider');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleSlider(id);
      setSlides(slides.map(s => s.id === id ? updated : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle slider');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Homepage Slider']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Homepage Slider</h1>
              <button
                onClick={() => handleOpenModal()}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus size={18} /> Add Slide
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading sliders...</p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <input
                    type="text"
                    placeholder="Search slides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="order">Sort by Order</option>
                  </select>
                </div>

                {filteredSlides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sliders found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">IMAGE</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">TITLE</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">CAPTION</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">LINK</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ORDER</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIVE</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSlides.map(slide => (
                          <tr key={slide.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <img 
                                src={slide.imageUrl} 
                                alt={slide.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </td>
                            <td className="py-4 px-4 font-medium">{slide.title}</td>
                            <td className="py-4 px-4 text-sm text-muted-foreground">{slide.caption}</td>
                            <td className="py-4 px-4 text-sm text-primary">{slide.linkUrl}</td>
                            <td className="py-4 px-4 text-center text-sm">{slide.order}</td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleToggle(slide.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center p-2 hover:bg-muted rounded disabled:opacity-50"
                              >
                                {slide.isActive ? (
                                  <Eye size={18} className="text-primary" />
                                ) : (
                                  <EyeOff size={18} className="text-muted-foreground" />
                                )}
                              </button>
                            </td>
                            <td className="py-4 px-4 text-center space-x-2">
                              <button
                                onClick={() => handleOpenModal(slide)}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center p-2 hover:bg-primary/10 text-primary rounded disabled:opacity-50"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(slide.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center p-2 hover:bg-destructive/10 text-destructive rounded disabled:opacity-50"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Slide' : 'Add New Slide'}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter slide title"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Caption *</label>
            <input
              type="text"
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Enter slide caption"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Link URL *</label>
            <input
              type="text"
              value={formData.linkUrl || ''}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image Upload {!editingId && '*'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {selectedImage ? `Selected: ${selectedImage.name}` : editingId ? 'Leave empty to keep current image' : 'Required for new sliders'}
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={actionLoading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

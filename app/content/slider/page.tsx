'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  caption: string;
  linkUrl: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

const mockSlides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to KVGIT',
    caption: 'Quality Education & Innovation',
    linkUrl: '/about',
    image: '/slide1.jpg',
    sortOrder: 1,
    active: true,
  },
  {
    id: '2',
    title: 'Admissions Open',
    caption: 'Apply Now for 2024',
    linkUrl: '/admissions',
    image: '/slide2.jpg',
    sortOrder: 2,
    active: true,
  },
];

export default function SliderPage() {
  const [slides, setSlides] = useState<Slide[]>(mockSlides);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Slide>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('sortOrder');

  const filteredSlides = slides
    .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'sortOrder') return a.sortOrder - b.sortOrder;
      return 0;
    });

  const handleOpenModal = (slide?: Slide) => {
    if (slide) {
      setEditingId(slide.id);
      setFormData(slide);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setSlides(slides.map(s => s.id === editingId ? { ...s, ...formData } as Slide : s));
    } else {
      setSlides([...slides, { id: Date.now().toString(), ...formData } as Slide]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const toggleActive = (id: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, active: !s.active } : s));
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
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus size={18} /> Add Slide
              </button>
            </div>

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
                  <option value="sortOrder">Sort by Order</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
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
                        <td className="py-4 px-4 font-medium">{slide.title}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{slide.caption}</td>
                        <td className="py-4 px-4 text-sm text-primary">{slide.linkUrl}</td>
                        <td className="py-4 px-4 text-center text-sm">{slide.sortOrder}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggleActive(slide.id)}
                            className="inline-flex items-center justify-center p-2 hover:bg-muted rounded"
                          >
                            {slide.active ? (
                              <Eye size={18} className="text-primary" />
                            ) : (
                              <EyeOff size={18} className="text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(slide)}
                            className="inline-flex items-center justify-center p-2 hover:bg-primary/10 text-primary rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(slide.id)}
                            className="inline-flex items-center justify-center p-2 hover:bg-destructive/10 text-destructive rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Slide' : 'Add New Slide'}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Caption</label>
            <input
              type="text"
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Link URL</label>
            <input
              type="text"
              value={formData.linkUrl || ''}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
            <input
              type="number"
              value={formData.sortOrder || 0}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Image Upload</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

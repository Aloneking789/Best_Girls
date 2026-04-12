'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  active: boolean;
}

const mockGalleries: Gallery[] = [
  { id: '1', title: 'Campus Tour', slug: 'campus-tour', description: 'Beautiful campus views', coverImage: '/gallery1.jpg', sortOrder: 1, active: true },
];

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>(mockGalleries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Gallery>>({});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Gallery']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Gallery Albums</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Album
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map(gallery => (
                <div key={gallery.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-2">{gallery.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{gallery.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(gallery.id); setFormData(gallery); setIsModalOpen(true); }} className="flex-1 bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20">Edit</button>
                      <button onClick={() => setGalleries(galleries.filter(g => g.id !== gallery.id))} className="flex-1 bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Album' : 'Add Gallery Album'}>
        <form className="space-y-3">
          <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Slug" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="file" accept="image/*" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="number" placeholder="Sort Order" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { const newGal = { id: editingId || Date.now().toString(), ...formData } as Gallery; if (editingId) { setGalleries(galleries.map(g => g.id === editingId ? newGal : g)); } else { setGalleries([...galleries, newGal]); } setIsModalOpen(false); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

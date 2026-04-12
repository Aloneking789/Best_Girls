'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  type: 'text' | 'video';
  content: string;
  videoUrl?: string;
  image: string;
  sortOrder: number;
  published: boolean;
}

const mockTestimonials: Testimonial[] = [
  { id: '1', name: 'John Doe', designation: 'Student', type: 'text', content: 'Great education and experience', image: '/person1.jpg', sortOrder: 1, published: true },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Testimonials']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Testimonial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">{t.designation}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${t.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {t.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-foreground mb-4">{t.content}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(t.id); setFormData(t); setIsModalOpen(true); }} className="flex-1 bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20">Edit</button>
                    <button onClick={() => setTestimonials(testimonials.filter(x => x.id !== t.id))} className="flex-1 bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}>
        <form className="space-y-3 max-h-96 overflow-y-auto">
          <input type="text" placeholder="Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Designation" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <select value={formData.type || 'text'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            <option value="text">Text</option>
            <option value="video">Video</option>
          </select>
          {formData.type === 'text' ? (
            <textarea placeholder="Quote/Text" value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          ) : (
            <input type="text" placeholder="Video URL" value={formData.videoUrl || ''} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          )}
          <input type="number" placeholder="Sort Order" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { const newTestimonial = { id: editingId || Date.now().toString(), ...formData } as Testimonial; if (editingId) { setTestimonials(testimonials.map(t => t.id === editingId ? newTestimonial : t)); } else { setTestimonials([...testimonials, newTestimonial]); } setIsModalOpen(false); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

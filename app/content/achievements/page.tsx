'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
}

const mockAchievements: Achievement[] = [
  { id: '1', title: 'Best College Award', category: 'Academics', year: '2024', description: 'Won best college award', image: '/award1.jpg' },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Achievements']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Achievement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map(a => (
                <div key={a.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{a.title}</h3>
                      <p className="text-xs text-muted-foreground">{a.category} • {a.year}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-4">{a.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(a.id); setFormData(a); setIsModalOpen(true); }} className="flex-1 bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20">Edit</button>
                    <button onClick={() => setAchievements(achievements.filter(x => x.id !== a.id))} className="flex-1 bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Achievement' : 'Add Achievement'}>
        <form className="space-y-3">
          <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Category" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Year" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="file" accept="image/*" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { const newA = { id: editingId || Date.now().toString(), ...formData } as Achievement; if (editingId) { setAchievements(achievements.map(x => x.id === editingId ? newA : x)); } else { setAchievements([...achievements, newA]); } setIsModalOpen(false); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Placement {
  id: string;
  companyName: string;
  studentName: string;
  year: string;
  testimonial: string;
  logo: string;
  sortOrder: number;
}

const mockPlacements: Placement[] = [
  { id: '1', companyName: 'Google', studentName: 'Raj Kumar', year: '2024', testimonial: 'Great experience at Google', logo: '/google.png', sortOrder: 1 },
];

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>(mockPlacements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Placement>>({});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Placements']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Placements</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Placement
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left py-3 px-4 font-semibold">COMPANY</th>
                      <th className="text-left py-3 px-4 font-semibold">STUDENT</th>
                      <th className="text-left py-3 px-4 font-semibold">YEAR</th>
                      <th className="text-center py-3 px-4 font-semibold">ORDER</th>
                      <th className="text-center py-3 px-4 font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placements.map(p => (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{p.companyName}</td>
                        <td className="py-3 px-4">{p.studentName}</td>
                        <td className="py-3 px-4">{p.year}</td>
                        <td className="py-3 px-4 text-center">{p.sortOrder}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button onClick={() => { setEditingId(p.id); setFormData(p); setIsModalOpen(true); }} className="inline-flex p-2 hover:bg-primary/10 text-primary rounded"><Edit2 size={16} /></button>
                          <button onClick={() => setPlacements(placements.filter(x => x.id !== p.id))} className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 size={16} /></button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Placement' : 'Add Placement'}>
        <form className="space-y-3">
          <input type="text" placeholder="Company Name" value={formData.companyName || ''} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Student Name" value={formData.studentName || ''} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Year" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <textarea placeholder="Testimonial" value={formData.testimonial || ''} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="number" placeholder="Sort Order" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { const newP = { id: editingId || Date.now().toString(), ...formData } as Placement; if (editingId) { setPlacements(placements.map(x => x.id === editingId ? newP : x)); } else { setPlacements([...placements, newP]); } setIsModalOpen(false); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

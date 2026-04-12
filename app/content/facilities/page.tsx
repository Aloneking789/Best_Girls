'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface Facility {
  id: string;
  title: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

const mockFacilities: Facility[] = [
  { id: '1', title: 'Cafeteria', image: '/cafe.jpg', sortOrder: 1, active: true },
  { id: '2', title: 'Transportation', image: '/transport.jpg', sortOrder: 2, active: true },
  { id: '3', title: 'Auditorium', image: '/audit.jpg', sortOrder: 3, active: true },
  { id: '4', title: 'Library', image: '/lib.jpg', sortOrder: 4, active: true },
];

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({});

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingId(facility.id);
      setFormData(facility);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setFacilities(facilities.map(f => f.id === editingId ? { ...f, ...formData } as Facility : f));
    } else {
      setFacilities([...facilities, { id: Date.now().toString(), ...formData } as Facility]);
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setFacilities(facilities.map(f => f.id === id ? { ...f, active: !f.active } : f));
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
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus size={18} /> Add Facility
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">TITLE</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ORDER</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIVE</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map(facility => (
                      <tr key={facility.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-4 px-4 font-medium">{facility.title}</td>
                        <td className="py-4 px-4 text-center">{facility.sortOrder}</td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => toggleActive(facility.id)} className="inline-flex p-2 hover:bg-muted rounded">
                            {facility.active ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(facility)}
                            className="inline-flex p-2 hover:bg-primary/10 text-primary rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setFacilities(facilities.filter(f => f.id !== facility.id))}
                            className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Facility' : 'Add Facility'}>
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
            <button type="button" onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">
              Save
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

const mockDepts: Department[] = [
  { id: '1', name: 'Computer Science', slug: 'cs', description: 'Department of CSE', sortOrder: 1, active: true },
  { id: '2', name: 'Electronics', slug: 'ece', description: 'Department of ECE', sortOrder: 2, active: true },
];

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>(mockDepts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Departments']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Departments</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Department
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left py-3 px-4 font-semibold">NAME</th>
                      <th className="text-left py-3 px-4 font-semibold">SLUG</th>
                      <th className="text-center py-3 px-4 font-semibold">ORDER</th>
                      <th className="text-center py-3 px-4 font-semibold">STATUS</th>
                      <th className="text-center py-3 px-4 font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depts.map(dept => (
                      <tr key={dept.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{dept.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{dept.slug}</td>
                        <td className="py-3 px-4 text-center">{dept.sortOrder}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${dept.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {dept.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button onClick={() => { setEditingId(dept.id); setFormData(dept); setIsModalOpen(true); }} className="inline-flex p-2 hover:bg-primary/10 text-primary rounded"><Edit2 size={16} /></button>
                          <button onClick={() => setDepts(depts.filter(d => d.id !== dept.id))} className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 size={16} /></button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Department' : 'Add Department'}>
        <form className="space-y-3">
          <input type="text" placeholder="Department Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="text" placeholder="Slug" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="number" placeholder="Sort Order" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { const newDept = { id: editingId || Date.now().toString(), ...formData } as Department; if (editingId) { setDepts(depts.map(d => d.id === editingId ? newDept : d)); } else { setDepts([...depts, newDept]); } setIsModalOpen(false); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface QuickLink {
  id: string;
  label: string;
  iconClass: string;
  url: string;
  sortOrder: number;
  active: boolean;
}

const mockLinks: QuickLink[] = [
  { id: '1', label: 'Admissions', iconClass: 'fas fa-graduation-cap', url: '/apply', sortOrder: 1, active: true },
  { id: '2', label: 'Courses', iconClass: 'fas fa-book', url: '/courses', sortOrder: 2, active: true },
  { id: '3', label: 'Events', iconClass: 'fas fa-calendar', url: '/events', sortOrder: 3, active: true },
];

export default function QuickLinksPage() {
  const [links, setLinks] = useState<QuickLink[]>(mockLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<QuickLink>>({});

  const handleSave = () => {
    if (editingId) {
      setLinks(links.map(l => l.id === editingId ? { ...l, ...formData } as QuickLink : l));
    } else {
      setLinks([...links, { id: Date.now().toString(), ...formData } as QuickLink]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Quick Links']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Quick Links</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Link
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">LABEL</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">ICON CLASS</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">URL</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ORDER</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIVE</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(link => (
                      <tr key={link.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-4 px-4 font-medium">{link.label}</td>
                        <td className="py-4 px-4 text-sm">{link.iconClass}</td>
                        <td className="py-4 px-4 text-sm text-primary">{link.url}</td>
                        <td className="py-4 px-4 text-center">{link.sortOrder}</td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => setLinks(links.map(l => l.id === link.id ? { ...l, active: !l.active } : l))} className="inline-flex p-2 hover:bg-muted rounded">
                            {link.active ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center space-x-2">
                          <button onClick={() => { setEditingId(link.id); setFormData(link); setIsModalOpen(true); }} className="inline-flex p-2 hover:bg-primary/10 text-primary rounded">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => setLinks(links.filter(l => l.id !== link.id))} className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Link' : 'Add Quick Link'}>
        <form className="space-y-4">
          <input type="text" placeholder="Label" value={formData.label || ''} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" placeholder="Icon Class (e.g., fas fa-book)" value={formData.iconClass || ''} onChange={(e) => setFormData({ ...formData, iconClass: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" placeholder="URL" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="number" placeholder="Sort Order" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

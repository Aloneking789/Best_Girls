'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { getPlacements, createPlacement, updatePlacement, deletePlacement, Placement, PlacementCreatePayload, PlacementUpdatePayload } from '@/lib/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPlacements();
      setPlacements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlacement = async (formData: PlacementCreatePayload) => {
    try {
      setActionLoading(true);
      const newPlacement = await createPlacement(formData);
      setPlacements([...placements, newPlacement]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create placement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlacement = async (id: string, formData: PlacementUpdatePayload) => {
    try {
      setActionLoading(true);
      const updated = await updatePlacement(id, formData);
      setPlacements(placements.map(p => p.id === id ? updated : p));
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update placement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlacement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement?')) return;
    try {
      setActionLoading(true);
      await deletePlacement(id);
      setPlacements(placements.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete placement');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Placements']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Placements</h1>
              <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} disabled={actionLoading} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Plus size={18} /> Add Placement
              </button>
            </div>

            {loading && <div className="text-center py-12 text-muted-foreground">Loading placements...</div>}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-6">
                {error}
              </div>
            )}

            {!loading && placements.length > 0 && (
              <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted">
                        <th className="text-left py-3 px-4 font-semibold">COMPANY</th>
                        <th className="text-left py-3 px-4 font-semibold">STUDENT</th>
                        <th className="text-center py-3 px-4 font-semibold">YEAR</th>
                        <th className="text-left py-3 px-4 font-semibold">TESTIMONIAL</th>
                        <th className="text-center py-3 px-4 font-semibold">ORDER</th>
                        <th className="text-center py-3 px-4 font-semibold">STATUS</th>
                        <th className="text-center py-3 px-4 font-semibold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placements.map(p => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-4 font-medium">{p.companyName}</td>
                          <td className="py-3 px-4">{p.studentName}</td>
                          <td className="py-3 px-4 text-center">{p.year}</td>
                          <td className="py-3 px-4 text-sm truncate max-w-xs">{p.testimonial}</td>
                          <td className="py-3 px-4 text-center">{p.order}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center space-x-2">
                            <button
                              onClick={() => { setEditingId(p.id); setIsModalOpen(true); }}
                              disabled={actionLoading}
                              className="inline-flex p-2 hover:bg-primary/10 text-primary rounded disabled:opacity-50"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePlacement(p.id)}
                              disabled={actionLoading}
                              className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && placements.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No placements found</div>
            )}
          </div>
        </main>
      </div>

    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setEditingId(null);
      }}
      title={editingId ? 'Edit Placement' : 'Add Placement'}
    >
      <PlacementForm
        placement={editingId ? placements.find(p => p.id === editingId) : undefined}
        onSubmit={(formData) => {
          if (editingId) {
            handleUpdatePlacement(editingId, formData);
          } else {
            handleAddPlacement(formData as PlacementCreatePayload);
          }
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        isLoading={actionLoading}
      />
    </Modal>
    </div>
  );
}

interface PlacementFormProps {
  placement?: Placement;
  onSubmit: (data: PlacementUpdatePayload | PlacementCreatePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function PlacementForm({ placement, onSubmit, onCancel, isLoading }: PlacementFormProps) {
  const [formData, setFormData] = useState({
    companyName: placement?.companyName || '',
    studentName: placement?.studentName || '',
    year: placement?.year || new Date().getFullYear(),
    testimonial: placement?.testimonial || '',
    companyLogo: null as File | null,
    order: placement?.order || 0,
    isActive: placement?.isActive !== false,
  });

  const [logoPreview, setLogoPreview] = useState<string>(placement?.companyLogo || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, companyLogo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, companyLogo: null });
    setLogoPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      companyName: formData.companyName,
      studentName: formData.studentName,
      year: formData.year,
      testimonial: formData.testimonial,
      companyLogo: formData.companyLogo || logoPreview || undefined,
      order: formData.order,
      isActive: formData.isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Student Name</label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Testimonial</label>
        <textarea
          value={formData.testimonial}
          onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          rows={3}
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Company Logo</label>
        {logoPreview && (
          <div className="mb-2 relative inline-block">
            <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded border border-border object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isLoading}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Order</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded disabled:opacity-50"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-foreground">Active</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (placement ? 'Updating...' : 'Adding...') : placement ? 'Update' : 'Add'} Placement
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

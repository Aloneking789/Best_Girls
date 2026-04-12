'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { Achievement, AchievementCreatePayload, AchievementUpdatePayload, getAchievements, createAchievement, updateAchievement, deleteAchievement } from '@/lib/api';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const handleAddAchievement = async (payload: AchievementCreatePayload) => {
    try {
      setActionLoading(true);
      const newAchievement = await createAchievement(payload);
      setAchievements([newAchievement, ...achievements]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating achievement:', err);
      alert('Failed to create achievement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAchievement = async (payload: AchievementUpdatePayload) => {
    if (editingId) {
      try {
        setActionLoading(true);
        const updated = await updateAchievement(editingId, payload);
        setAchievements(achievements.map(a => a.id === editingId ? updated : a));
        setIsModalOpen(false);
        setEditingId(null);
      } catch (err) {
        console.error('Error updating achievement:', err);
        alert('Failed to update achievement');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      setActionLoading(true);
      await deleteAchievement(id);
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting achievement:', err);
      alert('Failed to delete achievement');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Achievements']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} disabled={actionLoading} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Plus size={18} /> Add Achievement
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading achievements...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
            ) : null}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.length > 0 ? (
                  achievements.map(a => (
                    <div key={a.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">{a.category} • {a.year}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-4">{a.description}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(a.id); setFormData(a); setIsModalOpen(true); }} disabled={actionLoading} className="flex-1 bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20 disabled:opacity-50">Edit</button>
                        <button onClick={() => handleDeleteAchievement(a.id)} disabled={actionLoading} className="flex-1 bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20 disabled:opacity-50">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">No achievements found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !actionLoading && setIsModalOpen(false)} title={editingId ? 'Edit Achievement' : 'Add Achievement'}>
        <AchievementForm
          initialData={editingId ? (achievements.find(a => a.id === editingId) || undefined) : undefined}
          isEdit={!!editingId}
          onSubmit={editingId ? handleUpdateAchievement : handleAddAchievement}
          onCancel={() => setIsModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>
    </div>
  );
}

interface AchievementFormProps {
  initialData?: Achievement;
  isEdit: boolean;
  onSubmit: (data: AchievementCreatePayload | AchievementUpdatePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function AchievementForm({ initialData, isEdit, onSubmit, onCancel, isLoading = false }: AchievementFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    year: initialData?.year?.toString() || new Date().getFullYear().toString(),
    imageUrl: initialData?.imageUrl || 'NA',
    isActive: initialData?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      year: parseInt(formData.year),
      ...(imageFile && { image: imageFile }),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          rows={3}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Image</label>
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-24 w-32 rounded-lg object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              disabled={isLoading}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          disabled={isLoading}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
          disabled={isLoading}
        />
        <span className="text-sm font-medium text-foreground">Active</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add'} Achievement
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

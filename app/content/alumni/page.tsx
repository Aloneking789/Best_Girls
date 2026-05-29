'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';

interface AlumniProfile {
  id: string;
  name: string;
  degree: string;
  batch: string;
  company: string;
  position: string;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlumniForm {
  name: string;
  degree: string;
  batch: string;
  company: string;
  position: string;
  order: number;
  isActive: boolean;
  image: File | null;
}

const API_BASE_URL = 'https://kgvit.vercel.app/api/v1/alumni-profiles';

function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('authToken') ?? '';
}

export default function AlumniPage() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlumniForm>({
    name: '',
    degree: '',
    batch: '',
    company: '',
    position: '',
    order: 0,
    isActive: true,
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(API_BASE_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setProfiles(data.data);
        return;
      }
      throw new Error('Invalid response from the server');
    } catch (error) {
      console.error('Failed to fetch alumni profiles:', error);
      toast({
        title: 'Load error',
        description: 'Unable to fetch alumni profiles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormData((current) => ({ ...current, image: file }));

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setEditingImagePreview(null);
    setImagePreview(null);
    setFormData({
      name: '',
      degree: '',
      batch: '',
      company: '',
      position: '',
      order: 0,
      isActive: true,
      image: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (profile: AlumniProfile) => {
    setIsEditMode(true);
    setEditingId(profile.id);
    setEditingImagePreview(profile.imageUrl);
    setImagePreview(null);
    setFormData({
      name: profile.name.replace(/^"|"$/g, ''),
      degree: profile.degree.replace(/^"|"$/g, ''),
      batch: profile.batch.replace(/^"|"$/g, ''),
      company: profile.company.replace(/^"|"$/g, ''),
      position: profile.position.replace(/^"|"$/g, ''),
      order: profile.order,
      isActive: profile.isActive,
      image: null,
    });
    setIsModalOpen(true);
  };

  const createProfile = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Alumni name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const body = new FormData();
      body.append('name', formData.name);
      body.append('degree', formData.degree);
      body.append('batch', formData.batch);
      body.append('company', formData.company);
      body.append('position', formData.position);
      body.append('order', String(formData.order));
      body.append('isActive', String(formData.isActive));
      if (formData.image) {
        body.append('image', formData.image);
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create alumni profile');
      }

      toast({ title: 'Created', description: 'Alumni profile created successfully.' });
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: 'Create failed',
        description: error instanceof Error ? error.message : 'Unable to create profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProfile = async () => {
    if (!editingId) return;
    if (!formData.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Alumni name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const body = new FormData();
      body.append('name', formData.name);
      body.append('degree', formData.degree);
      body.append('batch', formData.batch);
      body.append('company', formData.company);
      body.append('position', formData.position);
      body.append('order', String(formData.order));
      body.append('isActive', String(formData.isActive));
      if (formData.image) {
        body.append('image', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update alumni profile');
      }

      toast({ title: 'Updated', description: 'Alumni profile updated successfully.' });
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unable to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Delete this alumni profile?')) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('Unable to delete profile');
      }
      toast({ title: 'Deleted', description: 'Alumni profile removed.' });
      fetchProfiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unable to delete profile.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Alumni']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Alumni</h1>
                <p className="text-muted-foreground mt-1">Manage alumni profiles and published alumni content.</p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                Add Alumni
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/50 p-8 text-center">
                <p className="text-lg font-medium">No alumni profiles available.</p>
                <p className="text-sm text-muted-foreground mt-2">Create a new profile to start displaying alumni data.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
                    <div className="relative h-44 bg-slate-100">
                      {profile.imageUrl ? (
                        <Image
                          src={profile.imageUrl}
                          alt={profile.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No image available
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold leading-6">{profile.name.replace(/^"|"$/g, '')}</h2>
                          <p className="text-sm text-muted-foreground">{profile.position.replace(/^"|"$/g, '')} at {profile.company.replace(/^"|"$/g, '')}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Degree: {profile.degree.replace(/^"|"$/g, '')}</p>
                        <p>Batch: {profile.batch.replace(/^"|"$/g, '')}</p>
                        <p>Order: {profile.order}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(profile)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProfile(profile.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Alumni Profile' : 'New Alumni Profile'}</h2>
                      <p className="text-sm text-muted-foreground">
                        {isEditMode ? 'Update the alumni details and optionally replace the image.' : 'Add a new alumni profile to the directory.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium">
                      <span>Name</span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Yashvi Soni"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Degree</span>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(event) => setFormData((current) => ({ ...current, degree: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="BBA"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Batch</span>
                      <input
                        type="text"
                        value={formData.batch}
                        onChange={(event) => setFormData((current) => ({ ...current, batch: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="2020-23"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Company</span>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Central Bank of India"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Position</span>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(event) => setFormData((current) => ({ ...current, position: event.target.value }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Relationship Officer"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      <span>Order</span>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(event) => setFormData((current) => ({ ...current, order: Number(event.target.value) }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="0"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium md:col-span-2">
                      <span>Status</span>
                      <select
                        value={String(formData.isActive)}
                        onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.value === 'true' }))}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 space-y-4">
                    {isEditMode && editingImagePreview && !imagePreview && (
                      <div className="rounded-3xl border border-border bg-slate-50 p-4">
                        <p className="text-sm font-medium">Current image</p>
                        <div className="mt-3 h-48 overflow-hidden rounded-3xl bg-slate-100">
                          <Image src={editingImagePreview} alt="Current alumni" fill className="object-cover" />
                        </div>
                      </div>
                    )}

                    <label className="block text-sm font-medium">
                      <span>{isEditMode ? 'Change image (optional)' : 'Image (optional)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    {imagePreview && (
                      <div className="rounded-3xl border border-border bg-slate-50 p-4">
                        <p className="text-sm font-medium">Preview</p>
                        <div className="mt-3 h-48 overflow-hidden rounded-3xl bg-slate-100">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={isEditMode ? updateProfile : createProfile}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create profile'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

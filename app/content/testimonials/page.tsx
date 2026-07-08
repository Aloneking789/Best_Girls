"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Modal from "@/components/modal";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  toggleTestimonial,
  updateTestimonial,
  type Testimonial,
} from "@/lib/api";

interface TestimonialFormData {
  id?: string;
  name?: string;
  videoUrl?: string;
  imageUrl?: string;
  imageFile?: File;
  sortOrder?: number;
  published?: boolean;
}

const initialFormData: TestimonialFormData = {
  videoUrl: "",
  sortOrder: 0,
  published: false,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<TestimonialFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load testimonials",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setImagePreview(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      id: testimonial.id,
      name: testimonial.name,
      designation: testimonial.designation,
      videoUrl: testimonial.designation || testimonial.videoUrl || "",
      imageUrl: testimonial.imageUrl,
      sortOrder: testimonial.order,
      published: testimonial.isPublished,
      imageFile: undefined,
    });
    setImagePreview(testimonial.imageUrl);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this testimonial?",
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError(null);
      await deleteTestimonial(id);
      setTestimonials((prev) =>
        prev.filter((testimonial) => testimonial.id !== id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete testimonial",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleTestimonial(id);
      setTestimonials((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle publication",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.videoUrl?.trim()) {
      setError("Name and video URL are required.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        designation: formData.videoUrl?.trim() || "",
        type: "VIDEO" as const,
        content: "NO CONTENT NEEDED",
        videoUrl: formData.videoUrl?.trim() || "",
        order: formData.sortOrder ?? 0,
        isPublished: formData.published ?? false,
        image: formData.imageFile,
      };

      let savedTestimonial: Testimonial;

      if (editingId) {
        savedTestimonial = await updateTestimonial(editingId, payload);
        setTestimonials((prev) =>
          prev.map((item) => (item.id === editingId ? savedTestimonial : item)),
        );
      } else {
        savedTestimonial = await createTestimonial(payload as any);
        setTestimonials((prev) => [savedTestimonial, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save testimonial",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={["Content & Website", "Video Testimonials"]} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Video Testimonials
                </h1>
                <p className="text-muted-foreground mt-1">
                  Collect video testimonials using name, image, and sort order.
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60"
              >
                <Plus size={18} /> Add Video Testimonial
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
                Loading testimonials…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
                  >
                    {testimonial.imageUrl && (
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-foreground">
                            {testimonial.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.designation}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${testimonial.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {testimonial.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="text-foreground mb-4 whitespace-pre-line">
                        {testimonial.type === "TEXT"
                          ? testimonial.content
                          : testimonial.videoUrl}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="bg-primary/10 text-primary py-2 rounded text-sm hover:bg-primary/20"
                        >
                          <Edit2 size={16} className="inline-block mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={actionLoading}
                          className="bg-destructive/10 text-destructive py-2 rounded text-sm hover:bg-destructive/20"
                        >
                          <Trash2 size={16} className="inline-block mr-2" />{" "}
                          Delete
                        </button>
                        <button
                          onClick={() => handleTogglePublished(testimonial.id)}
                          disabled={actionLoading}
                          className="bg-secondary/10 text-secondary py-2 rounded text-sm hover:bg-secondary/20"
                        >
                          {testimonial.isPublished ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Video Testimonial" : "Add Video Testimonial"}
      >
        <div className="space-y-7 max-h-96 overflow-y-auto px-1">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Video URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.videoUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-shadow"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a direct link to the testimonial video.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.sortOrder ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-shadow"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Publish toggle */}
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 cursor-pointer">
            <span className="text-sm font-medium text-foreground">
              Mark as Published
            </span>
            <input
              type="checkbox"
              checked={formData.published ?? false}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </label>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Image
            </label>
            <div className="border border-dashed border-border rounded-lg p-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 h-28 w-full rounded-lg object-cover border border-border"
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-2 border-t border-border">
          <button
            type="button"
            onClick={handleSave}
            disabled={actionLoading}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

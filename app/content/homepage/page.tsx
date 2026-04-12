'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface HomepageContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  ctaButtonText: string;
  ctaLink: string;
}

export default function HomepageContentPage() {
  const [content, setContent] = useState<HomepageContent>({
    id: '1',
    title: 'Welcome to KVGIT',
    subtitle: 'Excellence in Education',
    description: 'Providing world-class education and innovation',
    bannerImage: '/banner.jpg',
    ctaButtonText: 'Apply Now',
    ctaLink: '/apply',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<HomepageContent>(content);

  const handleSave = () => {
    setContent(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Homepage Content']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Homepage Content</h1>
              <button
                onClick={() => {
                  setFormData(content);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Edit2 size={18} /> Edit
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Current Content</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{content.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subtitle</p>
                    <p className="font-medium">{content.subtitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-sm">{content.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTA Button Text</p>
                    <p className="font-medium">{content.ctaButtonText}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTA Link</p>
                    <p className="font-medium text-sm text-primary">{content.ctaLink}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Banner Preview</h2>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Banner Image Preview</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Homepage Content">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description (Rich Text)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CTA Button Text</label>
            <input
              type="text"
              value={formData.ctaButtonText}
              onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">CTA Link</label>
            <input
              type="text"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

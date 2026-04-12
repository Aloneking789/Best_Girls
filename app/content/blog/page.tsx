'use client';
import { useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  status: 'published' | 'draft';
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Welcome to KVGIT',
    slug: 'welcome-to-kvgit',
    excerpt: 'Introducing our new blog platform',
    body: 'Full article content here...',
    coverImage: '/blog1.jpg',
    publishedAt: '2024-01-15',
    metaTitle: 'Welcome to KVGIT',
    metaDescription: 'Learn about KVGIT',
    status: 'published',
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({});

  const handleSave = () => {
    if (editingId) {
      setPosts(posts.map(p => p.id === editingId ? { ...p, ...formData } as BlogPost : p));
    } else {
      setPosts([...posts, { id: Date.now().toString(), ...formData } as BlogPost]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header breadcrumb={['Content & Website', 'Blog & News']} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">Blog & News</h1>
              <button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                <Plus size={18} /> Add Post
              </button>
            </div>

            <div className="grid gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-card rounded-lg shadow-sm border border-border p-6 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                    <div className="text-sm text-muted-foreground">
                      <span>Published: {post.publishedAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => { setEditingId(post.id); setFormData(post); setIsModalOpen(true); }} className="inline-flex p-2 hover:bg-primary/10 text-primary rounded">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setPosts(posts.filter(p => p.id !== post.id))} className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Post' : 'Add Blog Post'}>
        <form className="space-y-4 max-h-96 overflow-y-auto">
          <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" placeholder="Slug (auto-generated)" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <textarea placeholder="Excerpt" value={formData.excerpt || ''} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <textarea placeholder="Body (Rich Text)" value={formData.body || ''} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={4} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="date" value={formData.publishedAt || ''} onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={formData.status || 'draft'} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSave} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90">Save</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

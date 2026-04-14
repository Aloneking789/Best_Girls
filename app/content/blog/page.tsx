'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import Modal from '@/components/modal';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostCategories,
  createPostCategory,
  Post,
  PostCategory,
  PostCreatePayload,
  PostUpdatePayload,
} from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Post>>({});
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch posts and categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsData, categoriesData] = await Promise.all([getPosts(), getPostCategories()]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search posts
  const filteredPosts = posts
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => !filterCategory || p.categoryId === filterCategory);

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const handleAddPost = () => {
    setEditingId(null);
    setFormData({ isPublished: false });
    setSelectedImage(null);
    setIsPostModalOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingId(post.id);
    setFormData(post);
    setSelectedImage(null);
    setIsPostModalOpen(true);
  };

  const handleSavePost = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!formData.title?.trim() || !formData.excerpt?.trim() || !formData.content?.trim() || !formData.categoryId) {
        setError('Title, excerpt, content, and category are required');
        setActionLoading(false);
        return;
      }

      if (editingId) {
        const payload: PostUpdatePayload = {
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
          excerpt: formData.excerpt,
          content: formData.content,
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt,
          categoryId: formData.categoryId,
          isPublished: formData.isPublished || false,
          publishedAt: formData.publishedAt || undefined,
        };
        if (selectedImage) payload.coverImage = selectedImage;

        const updated = await updatePost(editingId, payload);
        setPosts(posts.map(p => (p.id === editingId ? updated : p)));
      } else {
        const payload: PostCreatePayload = {
          title: formData.title || '',
          slug: formData.slug || (formData.title || '').toLowerCase().replace(/\s+/g, '-'),
          excerpt: formData.excerpt || '',
          content: formData.content || '',
          metaTitle: formData.metaTitle || formData.title || '',
          metaDescription: formData.metaDescription || formData.excerpt || '',
          categoryId: formData.categoryId || '',
          isPublished: formData.isPublished || false,
          publishedAt: formData.publishedAt || undefined,
        };
        if (selectedImage) payload.coverImage = selectedImage;

        const created = await createPost(payload);
        setPosts([...posts, created]);
      }

      setIsPostModalOpen(false);
      setFormData({});
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setActionLoading(true);
      setError(null);
      await deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!categoryFormData.name.trim()) {
        setError('Category name is required');
        setActionLoading(false);
        return;
      }

      const newCategory = await createPostCategory({ name: categoryFormData.name });
      setCategories([...categories, newCategory]);
      setCategoryFormData({ name: '' });
      setIsCategoryModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setActionLoading(false);
    }
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
              <button
                onClick={handleAddPost}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} /> Add Post
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add__') {
                    setIsCategoryModalOpen(true);
                    e.target.value = '';
                  } else {
                    setFilterCategory(value);
                    setCurrentPage(1);
                  }
                }}
                className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 border border-border rounded-lg bg-background hover:bg-muted text-foreground font-medium"
              >
                + Add Category
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedPosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No posts found</div>
                  ) : (
                    paginatedPosts.map(post => (
                      <div
                        key={post.id}
                        className="bg-card rounded-lg shadow-sm border border-border p-4 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {post.coverImage && (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="h-12 w-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${post.isPublished
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                >
                                  {post.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditPost(post)}
                            disabled={actionLoading}
                            className="inline-flex p-2 hover:bg-primary/10 text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            disabled={actionLoading}
                            className="inline-flex p-2 hover:bg-destructive/10 text-destructive rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-lg ${currentPage === i + 1
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={editingId ? 'Edit Post' : 'Add Blog Post'}
        size="full"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input
              type="text"
              placeholder="Enter post title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
            <input
              type="text"
              placeholder="auto-generated from title if left blank"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => {
                if (e.target.value === '__add__') {
                  setIsCategoryModalOpen(true);
                } else {
                  setFormData({ ...formData, categoryId: e.target.value });
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__add__">+ Add New Category</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Excerpt *</label>
            <textarea
              placeholder="Enter post excerpt"
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
            <textarea
              placeholder="Enter post content"
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
            <input
              type="text"
              placeholder="Enter meta title"
              value={formData.metaTitle || ''}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
            <textarea
              placeholder="Enter meta description"
              value={formData.metaDescription || ''}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
            <div className="space-y-2">
              {(selectedImage || (editingId && formData.coverImage)) && (
                <div className="relative">
                  <img
                    src={selectedImage ? URL.createObjectURL(selectedImage) : (formData.coverImage as string)}
                    alt="Preview"
                    className="w-full h-40 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedImage(file);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={formData.isPublished ? 'published' : 'draft'}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Publish Date</label>
            <input
              type="date"
              value={formData.publishedAt || ''}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSavePost}
              disabled={actionLoading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              disabled={actionLoading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Category"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category Name *</label>
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={actionLoading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Adding...' : 'Add Category'}
            </button>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={actionLoading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

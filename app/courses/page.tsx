'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import {
  getCourseCategories,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourse,
  createCourseCategory,
  uploadCourseImage,
  type Course,
  type CourseCategory,
} from '@/lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'order'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, coursesData] = await Promise.all([
        getCourseCategories(),
        getCourses(),
      ]);
      setCategories(categoriesData);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === 'All' || course.category.name === filterCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await deleteCourse(id);
      setCourses(courses.filter(course => course.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setActionLoading(true);
      setError(null);
      const updated = await toggleCourse(id);
      setCourses(courses.map(c => c.id === id ? updated : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle course');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCourse = async (formData: any) => {
    try {
      setActionLoading(true);
      setError(null);
      
      // Step 1: Create the course (POST)
      const newCourse = await createCourse({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        fee: formData.fee,
        eligibility: formData.eligibility,
        categoryId: formData.categoryId,
        isActive: true,
      });

      // Step 2: Upload image simultaneously if provided (PUT)
      let courseWithImage = newCourse;
      if (formData.image) {
        try {
          courseWithImage = await uploadCourseImage(newCourse.id, formData.image);
        } catch (imageError) {
          console.error('Image upload failed, but course was created:', imageError);
          // Course was created successfully, but image upload failed
          setError('Course created, but image upload failed. You can retry uploading the image.');
        }
      }

      setCourses([...courses, courseWithImage]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCourse = async (formData: any) => {
    if (selectedCourse) {
      try {
        setActionLoading(true);
        setError(null);

        // Image is REQUIRED - user must provide a new image or we use existing
        if (!formData.image) {
          setError('Please select an image to update the course');
          setActionLoading(false);
          return;
        }

        // Generate slug from title if not provided
        const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-');

        // Update uses formData (multipart) - image is REQUIRED
        // NOTE: Do NOT pass categoryId for updates - backend doesn't accept it
        const courseWithImage = await updateCourse(selectedCourse.id, {
          title: formData.title,
          slug: slug,
          description: formData.description,
          duration: formData.duration,
          fee: formData.fee,
          eligibility: formData.eligibility,
          isActive: true,
          image: formData.image, // REQUIRED - must always be provided
        });

        setCourses(courses.map(c => c.id === selectedCourse.id ? courseWithImage : c));
        setIsEditModalOpen(false);
        setSelectedCourse(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update course');
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      setActionLoading(true);
      setError(null);
      const newCategory = await createCourseCategory({
        name: categoryData.name,
        slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      });
      setCategories([...categories, newCategory]);
      setIsAddCategoryModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Courses' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Courses</h1>
                <p className="text-muted-foreground mt-1">Manage all academic programs and courses</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={actionLoading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={20} /> Add Course
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading courses...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="bg-white border border-border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="All">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsAddCategoryModalOpen(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Add new category"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="order">Sort by Order</option>
                      <option value="title">Sort by Title</option>
                      <option value="duration">Sort by Duration</option>
                    </select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Showing {paginatedCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No courses found
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Image</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Course Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Duration</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Fee</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCourses.map((course) => (
                          <tr key={course.id} className="border-b border-border hover:bg-muted transition-colors">
                            <td className="py-4 px-6">
                              {course.image ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 font-medium text-foreground">{course.title}</td>
                            <td className="py-4 px-6 text-muted-foreground">{course.category.name}</td>
                            <td className="py-4 px-6 text-muted-foreground">{course.duration}</td>
                            <td className="py-4 px-6 text-muted-foreground">₹{course.fee}</td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggle(course.id)}
                                disabled={actionLoading}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${course.isActive
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${course.isActive ? 'bg-green-600' : 'bg-gray-600'
                                    }`}
                                />
                                {course.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(course)}
                                  disabled={actionLoading}
                                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(course.id)}
                                  disabled={actionLoading}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg ${currentPage === page
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
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

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Course">
        <CourseForm
          categories={categories}
          onSubmit={handleAddCourse}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Course">
        <CourseForm
          initialData={selectedCourse || undefined}
          categories={categories}
          onSubmit={handleUpdateCourse}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} title="Add New Category">
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddCategoryModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>
    </div>
  );
}

function CourseForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Course;
  categories: CourseCategory[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || '',
    fee: initialData?.fee || '',
    eligibility: initialData?.eligibility || '',
    categoryId: initialData?.categoryId || '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Course Image</label>
        <div className="space-y-2">
          {imagePreview && (
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">Upload course image (JPEG, PNG, etc.)</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Course Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter course title"
          disabled={isLoading}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter course description"
          disabled={isLoading}
          rows={3}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Duration *</label>
          <input
            type="text"
            placeholder="e.g., 6 months"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Fee *</label>
          <input
            type="text"
            placeholder="e.g., 1500"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Eligibility *</label>
          <input
            type="text"
            placeholder="Enter eligibility criteria"
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add'} Course
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

function CategoryForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Category Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            const name = e.target.value;
            setFormData({
              name,
              slug: generateSlug(name)
            });
          }}
          placeholder="e.g., UnderGraduate"
          disabled={isLoading}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Slug (auto-generated)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="e.g., undergraduate"
          disabled={isLoading}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground mt-1">Auto-generated from category name</p>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create'} Category
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

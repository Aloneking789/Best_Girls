'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  fee: string;
  status: 'Active' | 'Inactive';
  studentsEnrolled: number;
  lastModified: string;
  sortOrder: number;
}

const coursesData: Course[] = [
  { id: 1, title: 'B.Tech in Computer Science', category: 'Engineering', duration: '4 Years', fee: '₹400000', status: 'Active', studentsEnrolled: 245, lastModified: '2024-04-10', sortOrder: 1 },
  { id: 2, title: 'MBA - Finance', category: 'Business', duration: '2 Years', fee: '₹600000', status: 'Active', studentsEnrolled: 89, lastModified: '2024-04-09', sortOrder: 2 },
  { id: 3, title: 'M.Tech in AI', category: 'Engineering', duration: '2 Years', fee: '₹500000', status: 'Active', studentsEnrolled: 156, lastModified: '2024-04-08', sortOrder: 3 },
  { id: 4, title: 'BBA', category: 'Business', duration: '3 Years', fee: '₹300000', status: 'Inactive', studentsEnrolled: 0, lastModified: '2024-04-07', sortOrder: 4 },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(coursesData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'title' | 'students' | 'order'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === 'All' || course.category === filterCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'students':
          return b.studentsEnrolled - a.studentsEnrolled;
        default:
          return a.sortOrder - b.sortOrder;
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

  const handleDelete = (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const toggleStatus = (id: number) => {
    setCourses(courses.map(course =>
      course.id === id
        ? { ...course, status: course.status === 'Active' ? 'Inactive' : 'Active' }
        : course
    ));
  };

  const handleAddCourse = (formData: any) => {
    const newCourse: Course = {
      id: Math.max(...courses.map(c => c.id), 0) + 1,
      title: formData.title,
      category: formData.category,
      duration: formData.duration,
      fee: formData.fee,
      status: 'Active',
      studentsEnrolled: 0,
      lastModified: new Date().toISOString().split('T')[0],
      sortOrder: Math.max(...courses.map(c => c.sortOrder), 0) + 1,
    };
    setCourses([...courses, newCourse]);
    setIsAddModalOpen(false);
  };

  const handleUpdateCourse = (formData: any) => {
    if (selectedCourse) {
      setCourses(courses.map(course =>
        course.id === selectedCourse.id
          ? {
            ...course,
            title: formData.title,
            category: formData.category,
            duration: formData.duration,
            fee: formData.fee,
            sortOrder: parseInt(formData.sortOrder) || course.sortOrder,
            lastModified: new Date().toISOString().split('T')[0],
          }
          : course
      ));
      setIsEditModalOpen(false);
      setSelectedCourse(null);
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
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Add Course
              </button>
            </div>

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

                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Categories</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="order">Sort by Order</option>
                  <option value="title">Sort by Title</option>
                  <option value="students">Sort by Enrollment</option>
                </select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {paginatedCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Course Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Duration</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Fee</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Enrolled</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.map((course) => (
                    <tr key={course.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{course.title}</td>
                      <td className="py-4 px-6 text-muted-foreground">{course.category}</td>
                      <td className="py-4 px-6 text-muted-foreground">{course.duration}</td>
                      <td className="py-4 px-6 text-muted-foreground">{course.fee}</td>
                      <td className="py-4 px-6 text-center text-foreground font-medium">{course.studentsEnrolled}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleStatus(course.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${course.status === 'Active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${course.status === 'Active' ? 'bg-green-600' : 'bg-gray-600'}`} />
                          {course.status}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Course"
      >
        <CourseForm onSubmit={handleAddCourse} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Course"
      >
        <CourseForm
          initialData={selectedCourse || undefined}
          onSubmit={handleUpdateCourse}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function CourseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Course;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    duration: initialData?.duration || '',
    fee: initialData?.fee || '',
    sortOrder: initialData?.sortOrder.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Course Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Category</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
          <input
            type="text"
            placeholder="e.g., 4 Years"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Fee</label>
          <input
            type="text"
            placeholder="e.g., ₹400000"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Course
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

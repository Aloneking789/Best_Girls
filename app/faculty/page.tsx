'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

interface Faculty {
  id: number;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  qualification: string;
  sortOrder: number;
}

const facultyData: Faculty[] = [
  { id: 1, name: 'Dr. Rajesh Kumar', designation: 'Professor', department: 'Computer Science', email: 'rajesh@college.edu', phone: '9876543210', qualification: 'PhD', sortOrder: 1 },
  { id: 2, name: 'Ms. Priya Sharma', designation: 'Associate Professor', department: 'Electronics', email: 'priya@college.edu', phone: '9876543211', qualification: 'M.Tech', sortOrder: 2 },
  { id: 3, name: 'Mr. Amit Singh', designation: 'Assistant Professor', department: 'Mechanical', email: 'amit@college.edu', phone: '9876543212', qualification: 'M.Tech', sortOrder: 3 },
  { id: 4, name: 'Dr. Neha Gupta', designation: 'Professor', department: 'Business', email: 'neha@college.edu', phone: '9876543213', qualification: 'PhD', sortOrder: 4 },
];

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>(facultyData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'order'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFaculty = faculty
    .filter(f =>
      (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.email.includes(searchQuery)) &&
      (filterDept === 'All' || f.department === filterDept)
    )
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.sortOrder - b.sortOrder);

  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);

  const handleEdit = (item: Faculty) => {
    setSelectedFaculty(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setFaculty(faculty.filter(f => f.id !== id));
  };

  const handleAddFaculty = (formData: any) => {
    const newFaculty: Faculty = {
      id: Math.max(...faculty.map(f => f.id), 0) + 1,
      ...formData,
      sortOrder: Math.max(...faculty.map(f => f.sortOrder), 0) + 1,
    };
    setFaculty([...faculty, newFaculty]);
    setIsAddModalOpen(false);
  };

  const handleUpdateFaculty = (formData: any) => {
    if (selectedFaculty) {
      setFaculty(faculty.map(f =>
        f.id === selectedFaculty.id ? { ...f, ...formData } : f
      ));
      setIsEditModalOpen(false);
      setSelectedFaculty(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Faculty' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Faculty Members</h1>
                <p className="text-muted-foreground mt-1">Manage all faculty and staff</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Add Faculty
              </button>
            </div>

            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterDept}
                  onChange={(e) => {
                    setFilterDept(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Business">Business</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="order">Sort by Order</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Designation</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Department</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Qualification</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFaculty.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{item.name}</td>
                      <td className="py-4 px-6 text-muted-foreground">{item.designation}</td>
                      <td className="py-4 px-6 text-muted-foreground">{item.department}</td>
                      <td className="py-4 px-6 text-muted-foreground text-xs">{item.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">{item.qualification}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
      >
        <FacultyForm onSubmit={handleAddFaculty} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Faculty Member"
      >
        <FacultyForm
          initialData={selectedFaculty || undefined}
          onSubmit={handleUpdateFaculty}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function FacultyForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Faculty;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    designation: initialData?.designation || '',
    department: initialData?.department || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    qualification: initialData?.qualification || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Designation</label>
          <select
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select</option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Qualification</label>
        <select
          value={formData.qualification}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
          <option value="PhD">PhD</option>
          <option value="MBA">MBA</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Faculty
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

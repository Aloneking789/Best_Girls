'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Filter, Lock, Unlock } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  joinDate: string;
}

const usersData: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@college.edu', role: 'Admin', status: 'Active', lastLogin: '2024-04-10', joinDate: '2024-01-01' },
  { id: 2, name: 'John Doe', email: 'john@college.edu', role: 'Editor', status: 'Active', lastLogin: '2024-04-10', joinDate: '2024-02-01' },
  { id: 3, name: 'Jane Smith', email: 'jane@college.edu', role: 'Viewer', status: 'Active', lastLogin: '2024-04-09', joinDate: '2024-02-15' },
  { id: 4, name: 'Mike Johnson', email: 'mike@college.edu', role: 'Editor', status: 'Inactive', lastLogin: '2024-03-20', joinDate: '2024-01-15' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(usersData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users
    .filter(user =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.includes(searchQuery)) &&
      (filterRole === 'All' || user.role === filterRole)
    )
    .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handlePermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const toggleStatus = (id: number) => {
    setUsers(users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  const handleAddUser = (formData: any) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...formData,
      status: 'Active',
      lastLogin: new Date().toISOString().split('T')[0],
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
  };

  const handleUpdateUser = (formData: any) => {
    if (selectedUser) {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, ...formData }
          : user
      ));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'User Management' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-1">Manage admin users and their access permissions</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} /> Add User
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
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
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Role</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Last Login</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{user.name}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{user.email}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{user.lastLogin}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.status === 'Active' ? <Unlock size={14} /> : <Lock size={14} />}
                          {user.status}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handlePermissions(user)}
                            className="p-2 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                            title="Manage Permissions"
                          >
                            <Lock size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <UserForm
          initialData={selectedUser || undefined}
          onSubmit={handleUpdateUser}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Permissions Modal */}
      {selectedUser && (
        <Modal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          title={`Permissions: ${selectedUser.name}`}
        >
          <PermissionsForm user={selectedUser} onClose={() => setIsPermissionsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'Editor',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={!!initialData}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} User
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

type Action = 'view' | 'add' | 'edit' | 'delete';

type PermissionSet = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

type PermissionsType = {
  [key: string]: PermissionSet;
};

function PermissionsForm({ user, onClose }: { user: User; onClose: () => void }) {
  const [permissions, setPermissions] = useState<PermissionsType>({
    Content: { view: true, add: user.role !== 'Viewer', edit: user.role === 'Admin', delete: user.role === 'Admin' },
    Courses: { view: true, add: user.role !== 'Viewer', edit: user.role === 'Admin', delete: user.role === 'Admin' },
    Faculty: { view: true, add: user.role !== 'Viewer', edit: user.role === 'Admin', delete: user.role === 'Admin' },
    Admissions: { view: true, add: user.role !== 'Viewer', edit: user.role === 'Admin', delete: user.role === 'Admin' },
  });

  const togglePermission = (module: string, action: Action) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action],
      },
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(permissions).map(([module, actions]) => (
        <div key={module} className="border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">{module}</h3>

          <div className="grid grid-cols-4 gap-2">
            {Object.entries(actions).map(([action, enabled]) => {
              const act = action as Action;

              return (
                <label key={action} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => togglePermission(module, act)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm capitalize text-foreground">{action}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Permissions
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

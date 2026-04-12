'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import Modal from '@/components/modal';
import { Plus, Edit2, Trash2, Search, Lock, Loader, X } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, getRoles, createRole, updateRole, deleteRole, User, UserCreatePayload, UserUpdatePayload, Role, RoleCreatePayload, RoleUpdatePayload } from '@/lib/api';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // User modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // ================== USERS SECTION ==================

  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleAddUser = async (formData: UserCreatePayload) => {
    try {
      setActionLoading(true);
      const newUser = await createUser(formData);
      setUsers([...users, newUser]);
      setIsUserModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, formData: UserUpdatePayload) => {
    try {
      setActionLoading(true);
      const updated = await updateUser(id, formData);
      setUsers(users.map(u => u.id === id ? updated : u));
      setIsUserModalOpen(false);
      setEditingUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setActionLoading(true);
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // ================== ROLES SECTION ==================

  const handleAddRole = async (formData: RoleCreatePayload) => {
    try {
      setActionLoading(true);
      const newRole = await createRole(formData);
      setRoles([...roles, newRole]);
      setIsRoleModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, formData: RoleUpdatePayload) => {
    try {
      setActionLoading(true);
      const updated = await updateRole(id, formData);
      setRoles(roles.map(r => r.id === id ? updated : r));
      setIsRoleModalOpen(false);
      setEditingRoleId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      setActionLoading(true);
      await deleteRole(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setActionLoading(false);
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
                <p className="text-muted-foreground mt-1">Manage admin users and their roles</p>
              </div>
            </div>

            {loading && <div className="text-center py-12 text-muted-foreground">Loading...</div>}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-6">
                {error}
              </div>
            )}

            {!loading && (
              <>
                {/* Tab Buttons */}
                <div className="flex gap-4 border-b border-border">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'users'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'roles'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Roles & Permissions
                  </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="relative flex-1 max-w-md">
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
                      <button
                        onClick={() => {
                          setEditingUserId(null);
                          setIsUserModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Plus size={20} /> Add User
                      </button>
                    </div>

                    {/* Users Table */}
                    {filteredUsers.length > 0 ? (
                      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted border-b border-border">
                              <tr>
                                <th className="text-left py-3 px-4 font-semibold">Name</th>
                                <th className="text-left py-3 px-4 font-semibold">Email</th>
                                <th className="text-left py-3 px-4 font-semibold">Role</th>
                                <th className="text-left py-3 px-4 font-semibold">Permissions</th>
                                <th className="text-center py-3 px-4 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                                  <td className="py-3 px-4 font-medium">{user.name}</td>
                                  <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                                  <td className="py-3 px-4">
                                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                      {user.role.name}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-xs text-muted-foreground">{user.permissions.length} permissions</span>
                                  </td>
                                  <td className="py-3 px-4 text-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingUserId(user.id);
                                        setIsUserModalOpen(true);
                                      }}
                                      disabled={actionLoading}
                                      className="inline-flex p-2 hover:bg-blue-100 text-blue-600 rounded disabled:opacity-50"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      disabled={actionLoading}
                                      className="inline-flex p-2 hover:bg-red-100 text-red-600 rounded disabled:opacity-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">No users found</div>
                    )}

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
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
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
                )}

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setEditingRoleId(null);
                          setIsRoleModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Plus size={20} /> Add Role
                      </button>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roles.map(role => (
                        <div key={role.id} className="bg-white border border-border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg text-foreground">{role.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{role.permissions.length} permissions</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingRoleId(role.id);
                                  setIsRoleModalOpen(true);
                                }}
                                disabled={actionLoading}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded disabled:opacity-50"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={actionLoading}
                                className="p-2 hover:bg-red-100 text-red-600 rounded disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {role.permissions.map(perm => (
                              <div key={perm.id} className="flex items-start gap-2">
                                <Lock size={12} className="mt-1 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {roles.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No roles found</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUserId(null);
        }}
        title={editingUserId ? 'Edit User' : 'Add User'}
      >
        <UserForm
          user={editingUserId ? users.find(u => u.id === editingUserId) : undefined}
          roles={roles}
          onSubmit={editingUserId
            ? (formData) => handleUpdateUser(editingUserId, formData as UserUpdatePayload)
            : (formData) => handleAddUser(formData as UserCreatePayload)}
          onCancel={() => {
            setIsUserModalOpen(false);
            setEditingUserId(null);
          }}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRoleId(null);
        }}
        title={editingRoleId ? 'Edit Role' : 'Add Role'}
      >
        <RoleForm
          role={editingRoleId ? roles.find(r => r.id === editingRoleId) : undefined}
          onSubmit={editingRoleId
            ? (formData) => handleUpdateRole(editingRoleId, formData as RoleUpdatePayload)
            : (formData) => handleAddRole(formData as RoleCreatePayload)}
          onCancel={() => {
            setIsRoleModalOpen(false);
            setEditingRoleId(null);
          }}
          isLoading={actionLoading}
        />
      </Modal>
    </div>
  );
}

interface UserFormProps {
  user?: User;
  roles: Role[];
  onSubmit: (data: UserCreatePayload | UserUpdatePayload) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function UserForm({ user, roles, onSubmit, onCancel, isLoading }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roleId: user?.roleId || (roles[0]?.id || ''),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user?.image || '');

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
    const submitData: any = {
      name: formData.name,
      email: formData.email,
      roleId: formData.roleId,
    };
    if (formData.password) submitData.password = formData.password;
    if (imageFile) submitData.image = imageFile;
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
          disabled={isLoading || !!user}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Password {user && '(leave empty to keep current)'}</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required={!user}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Role</label>
        <select
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
          disabled={isLoading}
        >
          <option value="">Select a role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Profile Image</label>
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded border border-border object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isLoading}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading && <Loader size={16} className="animate-spin" />}
          {user ? 'Update' : 'Add'} User
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

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: RoleCreatePayload | RoleUpdatePayload) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function RoleForm({ role, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const [name, setName] = useState(role?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Role Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          required
          disabled={isLoading}
          placeholder="e.g., Editor, Moderator, Viewer"
        />
      </div>

      {role && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Current Permissions</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {role.permissions.map(perm => (
              <div key={perm.id} className="text-xs p-2 bg-muted rounded">
                <p className="font-medium">{perm.name}</p>
                <p className="text-muted-foreground">{perm.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Permissions are managed from the backend</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading && <Loader size={16} className="animate-spin" />}
          {role ? 'Update' : 'Add'} Role
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

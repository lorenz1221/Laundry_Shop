/**
 * User Management — Admin interface for managing users
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/api';
import type { User, CreateUserPayload, UpdateUserPayload } from '../../types';
import UserTable from './UserTable';
import AddEditUserModal from './AddEditUserModal';

interface PaginationState {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'customer' | 'staff' | 'admin'>('');
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchUsers(page, pagination.perPage, search, roleFilter);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError((err as Error).message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, pagination.perPage]);

  useEffect(() => {
    loadUsers(1);
  }, [search, roleFilter]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (data: CreateUserPayload | UpdateUserPayload) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data as UpdateUserPayload);
      } else {
        await createUser(data as CreateUserPayload);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteUser(userId);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      setError((err as Error).message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Add, edit, and delete system users</p>
        </div>
        <button
          onClick={handleAddUser}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* User Table */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
          No users found. Try adjusting your filters.
        </div>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          pagination={pagination}
          onPageChange={(page) => loadUsers(page)}
        />
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <AddEditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

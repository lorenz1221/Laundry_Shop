/**
 * UserTable — Display users in a table format with edit/delete actions
 */

import type { User } from '../../types';

interface PaginationState {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: UserTableProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-blue-100 text-blue-700';
      case 'customer':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Phone</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Joined</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-slate-600">{user.phone || '—'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-600">
            Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`rounded px-3 py-2 text-sm font-medium transition ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Consolidated Order Operational Queue — search, filters, pagination, payment toggles, modal.
 */

import { useMemo, useState } from 'react';
import { updateOrderStatus } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import PaymentBadge from '../PaymentBadge';
import OrderModal from '../order_modal';
import {
  STAFF_FILTER_TABS,
  STATUS_LABELS,
  type Order,
  type StaffFilterTab,
} from '../../types';

interface Props {
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  onRefresh: () => void;
}

export default function OperationalQueue({ orders, onOrdersChange, onRefresh }: Props) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StaffFilterTab>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Order | null>(null);
  const [completing, setCompleting] = useState(false);
  const [exitingIds, setExitingIds] = useState<Set<number>>(new Set());

  const patchOrder = (updated: Order) => {
    onOrdersChange(orders.map((o) => (o.id === updated.id ? updated : o)));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (exitingIds.has(o.id)) return true;
      const tab = STAFF_FILTER_TABS.find((t) => t.key === filter);
      if (tab?.status && o.status !== tab.status) return false;
      if (!q) return true;
      return o.customerName.toLowerCase().includes(q) || String(o.id).includes(q);
    });
  }, [orders, search, filter, exitingIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const handleStatusChange = async (order: Order, status: Order['status']) => {
    try {
      const updated = await updateOrderStatus(order.id, status);
      patchOrder(updated);
      showToast('success', `Order #${order.id} moved to ${STATUS_LABELS[status]}.`);
    } catch (err) {
      showToast('warning', err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const completeOrder = async (order: Order) => {
    setCompleting(true);
    setExitingIds((prev) => new Set(prev).add(order.id));
    try {
      await updateOrderStatus(order.id, 'completed');
      showToast('success', `Order #${order.id} completed and archived.`);
      setSelected(null);
      window.setTimeout(() => {
        onOrdersChange(orders.filter((o) => o.id !== order.id));
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(order.id);
          return next;
        });
        onRefresh();
      }, 450);
    } catch (err) {
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(order.id);
        return next;
      });
      showToast('warning', err instanceof Error ? err.message : 'Could not complete order');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search by customer name or order ID…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STAFF_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setFilter(tab.key);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === tab.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No active orders match your filters.
                </td>
              </tr>
            ) : (
              pageItems.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className={`cursor-pointer border-b border-slate-50 transition hover:bg-brand-50/50 ${
                    exitingIds.has(order.id) ? 'animate-card-exit opacity-0' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-brand-700">#{order.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <PaymentBadge order={order} onUpdated={patchOrder} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">₱{order.totalFee.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => completeOrder(order)}
                      disabled={completing}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Complete & Archive
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="text-slate-500">
          Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} of{' '}
          {filtered.length} entries
        </span>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
          </select>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="font-medium text-slate-700">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      <OrderModal
        order={selected}
        onClose={() => setSelected(null)}
        onComplete={completeOrder}
        onStatusChange={handleStatusChange}
        onOrderUpdate={patchOrder}
        completing={completing}
      />
    </section>
  );
}

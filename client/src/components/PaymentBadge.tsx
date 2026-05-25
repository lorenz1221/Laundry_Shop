/**
 * Interactive payment status toggle — PATCH /api/update_payment.php
 */

import { useState } from 'react';
import { updatePaymentStatus } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { Order, PaymentStatus } from '../types';

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
  size?: 'sm' | 'md';
}

export default function PaymentBadge({ order, onUpdated, size = 'sm' }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next: PaymentStatus = order.paymentStatus === 'paid' ? 'pending' : 'paid';
    setLoading(true);
    try {
      const updated = await updatePaymentStatus(order.id, next);
      onUpdated({ ...order, paymentStatus: updated.paymentStatus });
      showToast('success', `Order #${order.id} marked as ${next}.`);
    } catch (err) {
      showToast('warning', err instanceof Error ? err.message : 'Payment update failed');
    } finally {
      setLoading(false);
    }
  };

  const paid = order.paymentStatus === 'paid';
  const sizeClass = size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={`rounded-full font-bold uppercase tracking-wide transition ${sizeClass} ${
        paid
          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-200'
          : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300 hover:bg-amber-200'
      } disabled:opacity-50`}
    >
      {loading ? '…' : paid ? 'Paid' : 'Pending'}
    </button>
  );
}

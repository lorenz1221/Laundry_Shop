/**
 * Order detail overlay — full customer submission from laundryshop_db.orders
 */

import { JOURNEY_STEPS, STATUS_LABELS, type Order, type OrderStatus } from '../../types';

interface Props {
  order: Order | null;
  onClose: () => void;
  onComplete: (order: Order) => void;
  onStatusChange?: (order: Order, status: OrderStatus) => void;
  completing: boolean;
}

export default function OrderDetailModal({ order, onClose, onComplete, onStatusChange, completing }: Props) {
  if (!order) return null;

  const fulfilLabel = order.fulfillmentType === 'delivery' ? 'Home Pickup / Delivery' : 'Drop-off / Pickup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Order #{order.id}</h2>
            <p className="text-sm text-slate-500">{STATUS_LABELS[order.status]}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
        </div>

        <dl className="space-y-4 text-sm">
          <Row label="Customer Name" value={order.customerName} />
          <Row label="Contact Number" value={order.contactPhone ?? '—'} />
          <Row label="Address" value={[order.addressLine1, order.addressLine2].filter(Boolean).join(', ') || '—'} />
          <Row label="Service" value={order.serviceType.replace(/-/g, ' ')} />
          <Row label="Estimated Weight" value={`${order.weightKg} kg`} />
          <Row label="Logistics Slot" value={
            [order.scheduledDate, order.scheduledTime].filter(Boolean).join(' at ') || 'Not scheduled'
          } />
          <Row label="Fulfilment" value={fulfilLabel} />
          <Row label="Special Instructions" value={order.specialNotes ?? 'None'} />
          <Row label="Billing Total" value={`₱${order.totalFee.toFixed(2)} (${order.paymentStatus})`} highlight />
        </dl>

        {order.status !== 'completed' && onStatusChange && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Advance Step</label>
            <select
              defaultValue={order.status}
              onChange={(e) => onStatusChange(order, e.target.value as OrderStatus)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {JOURNEY_STEPS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {order.status !== 'completed' && (
          <button
            type="button"
            disabled={completing}
            onClick={() => onComplete(order)}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {completing ? 'Archiving…' : 'Complete Order & Archive'}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 font-medium ${highlight ? 'text-lg text-brand-700' : 'text-slate-800'}`}>{value}</dd>
    </div>
  );
}

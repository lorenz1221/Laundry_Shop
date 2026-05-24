/**
 * Self-Service Booking — POST /api/orders.php → orders INSERT
 */

import { useState, type FormEvent } from 'react';
import { createOrder } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  SERVICE_OPTIONS,
  type FulfillmentType,
  type Order,
  type ServiceType,
} from '../../types';
import WarningBanner from '../ui/WarningBanner';

interface Props {
  onBooked: (order: Order) => void;
}

export default function BookingWidget({ onBooked }: Props) {
  const { showToast } = useToast();
  const [weightKg, setWeightKg] = useState('5');
  const [serviceType, setServiceType] = useState<ServiceType>('wash-dry-fold');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('dropoff');
  const [contactPhone, setContactPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const weight = parseFloat(weightKg) || 0;
  const rate = SERVICE_OPTIONS.find((s) => s.value === serviceType)?.rate ?? 45;

  const validateWeight = (): boolean => {
    if (weight <= 0 || weight < MIN_WEIGHT_KG) {
      setWarning('Weight must be at least 0.5 kg.');
      return false;
    }
    if (weight > MAX_WEIGHT_KG) {
      setWarning(`Weight cannot exceed ${MAX_WEIGHT_KG} kg. Please split into multiple bookings.`);
      return false;
    }
    setWarning('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateWeight()) {
      showToast('warning', warning || 'Invalid weight.');
      return;
    }
    setLoading(true);
    try {
      // DATABASE HOOK: orders.php POST
      const order = await createOrder({
        weightKg: weight,
        serviceType,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        fulfillmentType,
        contactPhone: contactPhone || undefined,
        addressLine1: addressLine1 || undefined,
        specialNotes: specialNotes || undefined,
      });
      showToast('success', 'Wash cycle scheduled successfully!');
      onBooked(order);
    } catch (err) {
      setWarning(err instanceof Error ? err.message : 'Booking failed');
      showToast('warning', err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Self-Service Booking</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Schedule weight, service, and fulfilment preferences.</p>

      {warning && <WarningBanner message={warning} className="mb-4" />}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Weight (kg)</label>
          <input type="number" min="0.5" step="0.5" value={weightKg}
            onChange={(e) => { setWeightKg(e.target.value); setWarning(''); }}
            onBlur={validateWeight}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Service</label>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
            {SERVICE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label} — ₱{s.rate}/kg</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Time Slot</label>
          <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Fulfilment</label>
          <div className="flex gap-3">
            {([
              { value: 'dropoff' as const, label: 'Drop-off / Pickup' },
              { value: 'delivery' as const, label: 'Home Pickup / Delivery' },
            ]).map((opt) => (
              <label key={opt.value}
                className={`flex flex-1 cursor-pointer justify-center rounded-xl border px-3 py-2.5 text-sm font-medium ${
                  fulfillmentType === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200'
                }`}>
                <input type="radio" className="sr-only" checked={fulfillmentType === opt.value}
                  onChange={() => setFulfillmentType(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contact Phone</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="09XX XXX XXXX" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
          <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Street, barangay, city" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Special Instructions</label>
          <textarea value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
          <span className="text-sm text-slate-600">Estimated Total</span>
          <span className="text-xl font-bold text-brand-700">₱{(weight * rate).toFixed(2)}</span>
        </div>
        <button type="submit" disabled={loading}
          className="rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:col-span-2">
          {loading ? 'Scheduling…' : 'Confirm Booking'}
        </button>
      </form>
    </section>
  );
}

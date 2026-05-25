/**
 * Customer portal — journey tracker + booking.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchCustomerOrders } from '../../services/api';
import type { Order } from '../../types';
import PortalLayout, { type PortalSection } from '../layout/PortalLayout';
import BookingWidget from './BookingWidget';
import StatusTracker from './StatusTracker';

const NAV = [
  { id: 'overview' as PortalSection, label: 'My Journey', icon: '📍' },
  { id: 'booking' as PortalSection, label: 'Book Service', icon: '🧺' },
];

export default function CustomerDashboard() {
  const [section, setSection] = useState<PortalSection>('overview');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const orders = await fetchCustomerOrders();
      const tracked = orders.find((o) => o.status !== 'completed') ?? orders[0] ?? null;
      setActiveOrder(tracked);
    } catch {
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, 8000);
    return () => clearInterval(id);
  }, [loadOrders]);

  return (
    <PortalLayout
      title="Customer Portal"
      subtitle="Track your laundry journey in real time"
      role="customer"
      activeSection={section}
      onSectionChange={setSection}
      navItems={NAV}
    >
      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading your orders…</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {section === 'overview' && <StatusTracker order={activeOrder} />}
          {section === 'booking' && (
            <BookingWidget
              onBooked={(order) => {
                setActiveOrder(order);
                setSection('overview');
                loadOrders();
              }}
            />
          )}
        </div>
      )}
    </PortalLayout>
  );
}

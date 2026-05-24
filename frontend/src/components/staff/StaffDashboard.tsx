/**
 * Staff portal — operational queue, ledger, inventory.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchActiveOrders, fetchInventory, fetchLedgerOrders } from '../../services/api';
import type { InventoryItem, Order } from '../../types';
import PortalLayout, { type PortalSection } from '../layout/PortalLayout';
import FinancialLedger from './FinancialLedger';
import InventoryMonitor from './InventoryMonitor';
import OperationalQueue from './OperationalQueue';

const NAV = [
  { id: 'queue' as PortalSection, label: 'Active Queue', icon: '📋' },
  { id: 'ledger' as PortalSection, label: 'Financial Ledger', icon: '💰' },
  { id: 'inventory' as PortalSection, label: 'Supplies', icon: '🧴' },
];

export default function StaffDashboard() {
  const [section, setSection] = useState<PortalSection>('queue');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [ledgerOrders, setLedgerOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [active, ledger, inv] = await Promise.all([
        fetchActiveOrders(),
        fetchLedgerOrders(),
        fetchInventory(),
      ]);
      setActiveOrders(active);
      setLedgerOrders(ledger);
      setInventory(inv);
    } catch {
      /* dev mode */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <PortalLayout
      title="Branch Staff Dashboard"
      subtitle="High-efficiency operations control"
      role="staff"
      activeSection={section}
      onSectionChange={setSection}
      navItems={NAV}
    >
      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading dashboard…</p>
      ) : (
        <>
          {section === 'queue' && (
            <OperationalQueue
              orders={activeOrders}
              onOrdersChange={setActiveOrders}
              onRefresh={refresh}
            />
          )}
          {section === 'ledger' && <FinancialLedger orders={ledgerOrders} />}
          {section === 'inventory' && <InventoryMonitor items={inventory} />}
        </>
      )}
    </PortalLayout>
  );
}

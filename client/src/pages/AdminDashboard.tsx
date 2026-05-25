/**
 * Admin Command Center — analytics widgets + operational queue.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchActiveOrders,
  fetchDashboardStats,
  fetchInventory,
  fetchLedgerOrders,
} from '../services/api';
import type { DashboardStats, InventoryItem, Order } from '../types';
import PortalLayout, { type PortalSection } from '../components/layout/PortalLayout';
import AnalyticsCards from '../components/AnalyticsCards';
import FinancialLedger from '../components/staff/FinancialLedger';
import InventoryMonitor from '../components/staff/InventoryMonitor';
import OperationalQueue from '../components/staff/OperationalQueue';
import UserManagement from '../components/admin/UserManagement';

const NAV = [
  { id: 'overview' as PortalSection, label: 'Overview', icon: '📊' },
  { id: 'queue' as PortalSection, label: 'Active Queue', icon: '📋' },
  { id: 'ledger' as PortalSection, label: 'Financial Ledger', icon: '💰' },
  { id: 'inventory' as PortalSection, label: 'Supplies', icon: '🧴' },
  { id: 'users' as PortalSection, label: 'Users', icon: '👥' },
];

const DEFAULT_STATS: DashboardStats = {
  totalRevenue: 0,
  totalKilograms: 0,
  activeCustomers: 0,
  activeOrders: 0,
};

export default function AdminDashboard() {
  const [section, setSection] = useState<PortalSection>('overview');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [ledgerOrders, setLedgerOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [active, ledger, inv, dash] = await Promise.all([
        fetchActiveOrders(),
        fetchLedgerOrders(),
        fetchInventory(),
        fetchDashboardStats(),
      ]);
      setActiveOrders(active);
      setLedgerOrders(ledger);
      setInventory(inv);
      setStats(dash);
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
      title="Admin Command Center"
      subtitle="Spinzone executive operations & analytics"
      role="admin"
      activeSection={section}
      onSectionChange={setSection}
      navItems={NAV}
    >
      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading dashboard…</p>
      ) : (
        <>
          {section === 'overview' && (
            <div className="space-y-8">
              <AnalyticsCards stats={stats} />
              <OperationalQueue
                orders={activeOrders}
                onOrdersChange={setActiveOrders}
                onRefresh={refresh}
              />
            </div>
          )}
          {section === 'queue' && (
            <OperationalQueue
              orders={activeOrders}
              onOrdersChange={setActiveOrders}
              onRefresh={refresh}
            />
          )}
          {section === 'ledger' && <FinancialLedger orders={ledgerOrders} />}
          {section === 'inventory' && <InventoryMonitor items={inventory} />}
          {section === 'users' && <UserManagement />}
        </>
      )}
    </PortalLayout>
  );
}

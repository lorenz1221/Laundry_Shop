/**
 * Financial ledger — DATABASE HOOK: GET orders.php?view=ledger (includes completed)
 */

import { STATUS_LABELS, type Order } from '../../types';

interface Props {
  orders: Order[];
}

export default function FinancialLedger({ orders }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Financial Ledger</h2>
      <p className="mb-4 text-sm text-slate-500">
        Full fiscal audit trail — includes active and completed records.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-3 pr-4 font-semibold">Order ID</th>
              <th className="py-3 pr-4 font-semibold">Customer</th>
              <th className="py-3 pr-4 font-semibold">Weight</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Total Fee</th>
              <th className="py-3 font-semibold">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">No ledger entries yet.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                  <td className="py-3 font-medium text-slate-800">#{o.id}</td>
                  <td className="py-3 text-slate-600">{o.customerName}</td>
                  <td className="py-3 text-slate-600">{o.weightKg} kg</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-brand-50 text-brand-700'
                    }`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800">₱{o.totalFee.toFixed(2)}</td>
                  <td className="py-3 capitalize text-slate-600">{o.paymentStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

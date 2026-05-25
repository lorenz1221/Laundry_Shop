import type { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats;
}

export default function AnalyticsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Revenue',
      value: `₱${stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      sub: 'Paid orders',
      accent: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Kilograms Processed',
      value: `${stats.totalKilograms.toFixed(1)} kg`,
      sub: 'Active pipeline',
      accent: 'from-brand-500 to-brand-700',
    },
    {
      label: 'Active Customers',
      value: String(stats.activeCustomers),
      sub: 'Registered accounts',
      accent: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Active Orders',
      value: String(stats.activeOrders),
      sub: 'In operational queue',
      accent: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <article
          key={c.label}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className={`h-1.5 bg-gradient-to-r ${c.accent}`} />
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

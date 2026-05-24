/**
 * Supply tracking — DATABASE HOOK: GET inventory.php
 * Amber alert when stock &lt; 15% of max_level
 */

import type { InventoryItem } from '../../types';

interface Props {
  items: InventoryItem[];
}

const LOW_THRESHOLD = 15;

export default function InventoryMonitor({ items }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Supply Tracking</h2>
      <p className="mb-6 text-sm text-slate-500">Auto-updated when laundry batches are processed.</p>
      <div className="space-y-5">
        {items.map((item) => {
          const pct = Math.round((item.currentLevel / item.maxLevel) * 100);
          const isLow = pct < LOW_THRESHOLD;
          return (
            <div key={item.id}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.itemName}</span>
                <span className={isLow ? 'font-semibold text-amber-600' : 'text-slate-500'}>
                  {item.currentLevel} / {item.maxLevel} {item.unit} · {pct}%
                </span>
              </div>
              <div className={`h-3 overflow-hidden rounded-full ${isLow ? 'bg-amber-100 ring-2 ring-amber-300 animate-pulse' : 'bg-slate-100'}`}>
                <div className={`h-full rounded-full transition-all duration-700 ${
                  isLow ? 'bg-amber-500' : pct > 60 ? 'bg-emerald-500' : 'bg-blue-500'
                }`} style={{ width: `${pct}%` }} />
              </div>
              {isLow && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Below {LOW_THRESHOLD}% safety floor — restock immediately.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

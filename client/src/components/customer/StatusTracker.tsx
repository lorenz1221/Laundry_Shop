/**
 * Real-Time Journey Tracker — maps orders.status from laundryshop_db
 */

import { JOURNEY_STEPS, type Order, type OrderStatus } from '../../types';

interface Props {
  order: Order | null;
}

const stepIndex = (s: OrderStatus) =>
  JOURNEY_STEPS.findIndex((step) => step.key === s);

export default function StatusTracker({ order }: Props) {
  const currentIdx = order ? stepIndex(order.status) : -1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Real-Time Journey Tracker</h2>
      <p className="mb-8 mt-1 text-sm text-slate-500">
        {order ? `Tracking Order #${order.id}` : 'Book a wash cycle to begin tracking.'}
      </p>

      <div className="relative flex justify-between gap-2">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all duration-700"
          style={{
            width: order && currentIdx >= 0
              ? `${(currentIdx / (JOURNEY_STEPS.length - 1)) * 100}%`
              : '0%',
          }}
        />

        {JOURNEY_STEPS.map((step, idx) => {
          const done = order !== null && idx < currentIdx;
          const active = order !== null && idx === currentIdx;
          const upcoming = !done && !active;

          return (
            <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
                  active
                    ? 'animate-pulse-glow border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-300/50'
                    : done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200/80 bg-white/60 text-slate-400 opacity-50'
                }`}
              >
                {done ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`mt-3 max-w-[5.5rem] text-center text-[11px] font-medium leading-tight sm:text-xs ${
                  active ? 'text-brand-700' : done ? 'text-emerald-700' : upcoming ? 'text-slate-400/70' : ''
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Unified workspace shell — collapsible side nav (desktop) + sticky mobile tab bar.
 */

import { useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export type PortalSection = 'overview' | 'booking' | 'queue' | 'ledger' | 'inventory';

interface NavItem {
  id: PortalSection;
  label: string;
  icon: string;
}

interface Props {
  title: string;
  subtitle: string;
  role: 'customer' | 'staff';
  activeSection: PortalSection;
  onSectionChange: (s: PortalSection) => void;
  navItems: NavItem[];
  children: ReactNode;
}

export default function PortalLayout({
  title,
  subtitle,
  role,
  activeSection,
  onSectionChange,
  navItems,
  children,
}: Props) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`hidden border-r border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${
          sidebarOpen ? 'w-64' : 'w-[72px]'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-spin-600 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-bold text-slate-800">Spinzone</p>
              <p className="text-xs capitalize text-slate-500">{role} portal</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                activeSection === item.id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="m-3 rounded-lg border border-slate-200 py-2 text-xs text-slate-500 hover:bg-slate-50"
        >
          {sidebarOpen ? '← Collapse' : '→'}
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pb-24 lg:pb-8">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div>
              <h1 className="text-lg font-bold text-slate-800 lg:text-xl">{title}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              activeSection === item.id ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label.split(' ')[0]}
          </button>
        ))}
      </nav>
    </div>
  );
}

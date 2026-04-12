'use client';

import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  breadcrumb?: string[]; // ✅ FIX: make this string[]
}

export default function Header({ breadcrumbs, breadcrumb }: HeaderProps) {
  // ✅ FIXED LOGIC
  const finalBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs ||
    (breadcrumb
      ? breadcrumb.map((b) => ({ label: b }))
      : [{ label: 'Dashboard' }]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
      {/* Main Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {finalBreadcrumbs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-muted-foreground">/</span>}
              <a
                href={item.href || '#'}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 mx-8 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell size={20} className="text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'AD'}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2">
                  <User size={16} /> Profile
                </button>

                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>

                <div className="border-t border-border my-2" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  Bell,
  ChevronDown,
  Code2
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode; // ✅ FIXED (optional)
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },

  {
    label: 'Content & Website',
    icon: <FileText size={20} />,
    children: [
      { label: 'Homepage Content', href: '/content/homepage' },
      { label: 'Homepage Slider', href: '/content/slider' },
      { label: 'Campus Facilities', href: '/content/facilities' },
      // { label: 'Quick Links', href: '/content/quick-links' },
      { label: 'Blog & News', href: '/content/blog' },
      // { label: 'Testimonials', href: '/content/testimonials' },
      { label: 'Departments', href: '/content/departments' },
      { label: 'Gallery', href: '/content/gallery' },
      { label: 'Achievements', href: '/content/achievements' },
      { label: 'Placements', href: '/content/placements' },
    ],
  },

  { label: 'Courses', href: '/courses', icon: <BookOpen size={20} /> },
  { label: 'Faculty', href: '/faculty', icon: <Users size={20} /> },
  { label: 'Events', href: '/events', icon: <Bell size={20} /> },

  {
    label: 'Admissions & Leads',
    icon: <GraduationCap size={20} />,
    children: [
      // { label: 'Admissions', href: '/admissions' },
      { label: 'Contact Leads', href: '/leads' },
      // { label: 'AI Admission Assistant', href: '/admissions/ai-assistant' },
    ],
  },

  { label: 'Notice Board', href: '/notices', icon: <Bell size={20} /> },
  // { label: 'Student Corner', href: '/student-corner', icon: <Code2 size={20} /> },

  {
    label: 'Users & Roles',
    icon: <Users size={20} />,
    children: [
      // { label: 'User Profile', href: '/users/profile' },
      { label: 'User Management', href: '/users' },
      // { label: 'Roles', href: '/users/roles' },
      // { label: 'Permissions', href: '/users/permissions' },
    ],
  },

  { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-white border border-border rounded-lg p-2 hover:bg-muted"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border shadow-lg transform transition-transform duration-300 z-35 md:z-0 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">College CMS</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Admin Panel v1.0
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => {
                      setExpandedItems((prev) =>
                        prev.includes(item.label)
                          ? prev.filter((i) => i !== item.label)
                          : [...prev, item.label]
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
                  >
                    <span className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                      {item.icon && item.icon}
                    </span>

                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedItems.includes(item.label) && (
                    <div className="bg-sidebar-accent/50 rounded-lg mt-1 overflow-hidden">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href!}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-6 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                          <span className="text-xs">•</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
                >
                  <span className="text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                    {item.icon && item.icon}
                  </span>

                  <span className="text-sm font-medium flex-1">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © 2026 College CMS
          </p>
        </div>
      </aside>
    </>
  );
}
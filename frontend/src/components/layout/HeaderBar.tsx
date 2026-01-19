/**
 * HeaderBar - Top navigation bar with breadcrumbs and user menu
 *
 * Features:
 * - Dynamic breadcrumbs based on current route
 * - User profile dropdown
 * - Admin link for super_admin users
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

// Breadcrumb configuration
interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/dashboard/my-profile': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile' },
  ],
  '/dashboard/account': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings' },
  ],
};

// Dynamic route patterns
const dynamicBreadcrumbs: Array<{
  pattern: RegExp;
  getBreadcrumbs: (match: RegExpMatchArray) => BreadcrumbItem[];
}> = [
    {
      pattern: /^\/dashboard\/([^/]+)$/,
      getBreadcrumbs: (match) => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: match[1].charAt(0).toUpperCase() + match[1].slice(1).replace(/-/g, ' ') },
      ],
    },
  ];

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Check static routes first
  if (routeBreadcrumbs[pathname]) {
    return routeBreadcrumbs[pathname];
  }

  // Check dynamic patterns
  for (const { pattern, getBreadcrumbs: getItems } of dynamicBreadcrumbs) {
    const match = pathname.match(pattern);
    if (match) {
      return getItems(match);
    }
  }

  // Default fallback
  return [{ label: 'Dashboard', href: '/dashboard' }];
}

export function HeaderBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email || 'User';

  const initials = user?.first_name
    ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1 text-sm">
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              {crumb.href && index < breadcrumbs.length - 1 ? (
                <Link
                  to={crumb.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Right side: Admin Switch + Profile */}
        <div className="flex items-center gap-3">
          {/* Admin View Switcher - Only for super_admin */}
          {isSuperAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5',
                dropdownOpen ? 'bg-gray-100' : ''
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--btn-primary-bg)] to-[var(--btn-primary-hover)] flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {displayName}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform hidden sm:block',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </Button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  {user?.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[var(--color-app-primary-100)] text-[var(--color-app-primary-700)] rounded-full capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/dashboard/my-profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Account Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;

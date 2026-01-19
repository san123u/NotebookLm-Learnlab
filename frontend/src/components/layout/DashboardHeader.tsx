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

// Breadcrumb configuration
interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/dashboard/hierarchy': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Hierarchy' },
  ],
  '/dashboard/groups': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups' },
  ],
  '/dashboard/companies': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Companies' },
  ],
  '/dashboard/companies/tree': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Companies', href: '/dashboard/companies' },
    { label: 'Tree View' },
  ],
  '/dashboard/financials': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Financials' },
  ],
  '/dashboard/comparison': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Comparison' },
  ],
  '/dashboard/forecasts': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Forecasts' },
  ],
  '/dashboard/chat': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'AI Chat' },
  ],
  '/dashboard/my-profile': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Profile' },
  ],
  '/dashboard/my-profile/add-memory': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Profile', href: '/dashboard/my-profile' },
    { label: 'Add Memory' },
  ],
  '/dashboard/employee-profile': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employee Profiles' },
  ],
  '/dashboard/employee-profile/create': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employee Profiles', href: '/dashboard/employee-profile' },
    { label: 'Create' },
  ],
  '/dashboard/upload': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload Company Data' },
  ],
  '/dashboard/audited-statements': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Audited Statements' },
  ],
  '/dashboard/reference-data': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reference Data' },
  ],
  '/dashboard/account': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Account Settings' },
  ],
};

// Dynamic route patterns
const dynamicBreadcrumbs: Array<{
  pattern: RegExp;
  getBreadcrumbs: (match: RegExpMatchArray) => BreadcrumbItem[];
}> = [
    {
      pattern: /^\/dashboard\/groups\/([^/]+)$/,
      getBreadcrumbs: (match) => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Groups', href: '/dashboard/groups' },
        { label: match[1] },
      ],
    },
    {
      pattern: /^\/dashboard\/companies\/([^/]+)$/,
      getBreadcrumbs: (match) => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Companies', href: '/dashboard/companies' },
        { label: match[1] },
      ],
    },
    {
      pattern: /^\/dashboard\/financial-data\/([^/]+)$/,
      getBreadcrumbs: (match) => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Financials', href: '/dashboard/financials' },
        { label: match[1] },
      ],
    },
    {
      pattern: /^\/dashboard\/c\/([^/]+)$/,
      getBreadcrumbs: () => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'AI Chat', href: '/dashboard/chat' },
        { label: 'Conversation' },
      ],
    },
    {
      pattern: /^\/dashboard\/g\/([^/]+)$/,
      getBreadcrumbs: () => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'AI Chat', href: '/dashboard/chat' },
        { label: 'Agent' },
      ],
    },
    {
      pattern: /^\/dashboard\/my-profile\/edit-memory\/([^/]+)$/,
      getBreadcrumbs: () => [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Profile', href: '/dashboard/my-profile' },
        { label: 'Edit Memory' },
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

export function DashboardHeader() {
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
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
              dropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
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
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;

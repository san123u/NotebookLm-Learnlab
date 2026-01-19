import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { Button } from '../ui/Button';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/dashboard/my-profile', icon: User },
  { name: 'Settings', href: '/dashboard/account', icon: Settings },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { config } = useSystemConfig();

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-900 h-full flex-shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        'flex items-center h-16 border-b border-gray-800 flex-shrink-0',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--btn-primary-bg)] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {config.app.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-white text-lg truncate">
              {config.app.name}
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[var(--btn-primary-bg)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {config.app.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <nav className={cn('flex-1 py-4 space-y-1 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center py-2 text-sm font-medium rounded-lg transition-colors',
                collapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className={cn('w-5 h-5', !collapsed && 'mr-3')} />
            {!collapsed && item.name}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle at Bottom */}
      <div className={cn(
        'p-3 border-t border-gray-800',
        collapsed ? 'flex justify-center' : ''
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'text-gray-400 hover:text-white hover:bg-gray-800',
            collapsed ? 'p-2' : 'w-full justify-start'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

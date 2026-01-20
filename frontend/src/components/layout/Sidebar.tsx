import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  User,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Store,
  ScanText,
  BarChart3,
  Scale,
  ShieldAlert,
  Workflow,
  Bot,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useGeneratedApps } from '../../hooks/useGeneratedApps';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { GeneratedApp } from '../../types/navigation';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  name: string;
  items: NavItem[];
  badge?: number;
}

// Icon mapping for generated apps based on template type
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Store,
  ScanText,
  BarChart3,
  Scale,
  ShieldAlert,
  Workflow,
  Bot,
  Folder,
};

// Get icon component from icon name
function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Folder;
}

// Core navigation items
const coreNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

// Settings navigation items
const settingsNavigation: NavItem[] = [
  { name: 'Profile', href: '/dashboard/my-profile', icon: User },
  { name: 'Account', href: '/dashboard/account', icon: Settings },
];

// Convert generated apps to nav items
function generatedAppsToNavItems(apps: GeneratedApp[]): NavItem[] {
  return apps.map((app) => ({
    name: app.name,
    href: `/dashboard/${app.slug}`,
    icon: getIcon(app.icon),
  }));
}

// Collapsible Nav Group Component
function NavGroupSection({
  group,
  collapsed: sidebarCollapsed,
  isExpanded,
  onToggle,
}: {
  group: NavGroup;
  collapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // If sidebar is collapsed, don't show group headers
  if (sidebarCollapsed) {
    return (
      <>
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/dashboard'}
            title={item.name}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center py-2 px-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          {group.name}
          {group.badge !== undefined && group.badge > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {group.badge}
            </Badge>
          )}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Group Items */}
      {isExpanded && (
        <div className="space-y-1">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center py-2 px-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { config } = useSystemConfig();
  const { data: generatedApps = [] } = useGeneratedApps();

  // Track expanded state for each group
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('sidebar-expanded-groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { core: true, apps: true, settings: true };
      }
    }
    return { core: true, apps: true, settings: true };
  });

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-groups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Build navigation groups
  const navGroups: NavGroup[] = [
    {
      id: 'core',
      name: 'Core',
      items: coreNavigation,
    },
  ];

  // Only add generated apps group if there are apps
  if (generatedApps.length > 0) {
    navGroups.push({
      id: 'apps',
      name: 'Generated Apps',
      items: generatedAppsToNavItems(generatedApps),
      badge: generatedApps.length,
    });
  }

  navGroups.push({
    id: 'settings',
    name: 'Settings',
    items: settingsNavigation,
  });

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

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 space-y-4 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            isExpanded={expandedGroups[group.id] ?? true}
            onToggle={() => toggleGroup(group.id)}
          />
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

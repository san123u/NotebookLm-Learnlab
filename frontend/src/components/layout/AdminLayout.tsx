import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useSystemConfig } from '../../hooks/useSystemConfig';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { config } = useSystemConfig();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header with breadcrumbs and profile */}
        <AdminHeader />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 px-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>© {new Date().getFullYear()} {config.app.name}</span>
            <span className="text-[var(--btn-primary-bg)] font-medium">{config.app.name} Admin</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            <span>© {new Date().getFullYear()} International Holding Company</span>
            <span className="text-purple-500 font-medium">XAILON Admin</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

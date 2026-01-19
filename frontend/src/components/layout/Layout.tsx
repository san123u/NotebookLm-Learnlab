import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

export function Layout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if we're on a chat route (no padding, no header for full-screen experience)
  // All chat routes are now under /dashboard/chat/*
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with breadcrumbs and profile - hidden for chat routes */}
        {!isChatRoute && <DashboardHeader />}

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {isChatRoute ? (
            // No padding for chat - it handles its own layout
            <Outlet />
          ) : (
            <div className="p-6">
              <Outlet />
            </div>
          )}
        </main>

        {/* Footer - hidden for chat routes */}
        {!isChatRoute && (
          <footer className="bg-white border-t border-gray-200 py-3 px-6">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>© {new Date().getFullYear()} International Holding Company</span>
              <span>XAILON - IHC Analytics Platform</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

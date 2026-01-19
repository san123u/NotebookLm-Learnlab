import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Globe,
  Settings,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { getAdminStats, listDomains } from '../../lib/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  superAdmins: number;
  totalDomains: number;
  isLoading: boolean;
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    superAdmins: 0,
    totalDomains: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, domainsResponse] = await Promise.all([
          getAdminStats(),
          listDomains(),
        ]);

        setStats({
          totalUsers: userStats.total_users || 0,
          activeUsers: userStats.active_users || 0,
          pendingUsers: userStats.pending_users || 0,
          superAdmins: userStats.super_admins || 0,
          totalDomains: domainsResponse.total || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          isLoading={stats.isLoading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={ShieldCheck}
          color="green"
          isLoading={stats.isLoading}
        />
        <StatCard
          title="Pending Users"
          value={stats.pendingUsers}
          icon={Users}
          color="amber"
          isLoading={stats.isLoading}
        />
        <StatCard
          title="Domains"
          value={stats.totalDomains}
          icon={Globe}
          color="purple"
          isLoading={stats.isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="User Management"
          description="View and manage all users"
          icon={Users}
          href="/admin/users"
          color="indigo"
        />
        <QuickActionCard
          title="Domain Management"
          description="Configure multi-tenant domains"
          icon={Globe}
          href="/admin/domains"
          color="emerald"
        />
        <QuickActionCard
          title="System Settings"
          description="Configure system settings"
          icon={Settings}
          href="/dashboard/account"
          color="gray"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
  isLoading: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: 'indigo' | 'emerald' | 'gray';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
    gray: 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
  };

  return (
    <Link
      to={href}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </Link>
  );
}

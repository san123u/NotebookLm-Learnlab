import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Users,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { getAdminStats } from '../lib/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  superAdmins: number;
  isLoading: boolean;
}

export default function Dashboard() {
  const { user, isSuperAdmin } = useAuth();
  const { config } = useSystemConfig();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    superAdmins: 0,
    isLoading: true,
  });

  useEffect(() => {
    // Only fetch stats if user is super admin
    if (!isSuperAdmin) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        const userStats = await getAdminStats();
        setStats({
          totalUsers: userStats.total_users || 0,
          activeUsers: userStats.active_users || 0,
          pendingUsers: userStats.pending_users || 0,
          superAdmins: userStats.super_admins || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, [isSuperAdmin]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">
          This is your {config.app.name} dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards - Only show for super admin */}
      {isSuperAdmin && (
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
            title="Super Admins"
            value={stats.superAdmins}
            icon={ShieldCheck}
            color="purple"
            isLoading={stats.isLoading}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          title="Account Settings"
          description="Manage your profile and preferences"
          icon={Settings}
          href="/dashboard/account"
          color="sky"
        />
        {isSuperAdmin && (
          <QuickActionCard
            title="User Management"
            description="Manage users and roles"
            icon={Users}
            href="/admin/users"
            color="emerald"
          />
        )}
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
  color: 'sky' | 'emerald';
}) {
  const colorClasses = {
    sky: 'bg-sky-100 text-sky-600 group-hover:bg-sky-200',
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
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

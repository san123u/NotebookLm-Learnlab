import { Link } from 'react-router-dom';
import { Settings, Users, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardCard {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const dashboardCards: DashboardCard[] = [
  {
    name: 'Account Settings',
    description: 'Manage your profile and preferences',
    href: '/dashboard/account',
    icon: Settings,
  },
  {
    name: 'User Management',
    description: 'Manage users and roles',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
  {
    name: 'Domains',
    description: 'Manage multi-tenant domains',
    href: '/admin/domains',
    icon: Globe,
    adminOnly: true,
  },
];

export default function DashboardV2() {
  const { user, isSuperAdmin } = useAuth();

  const filteredCards = dashboardCards.filter(
    (card) => !card.adminOnly || isSuperAdmin
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-2">
          This is your dashboard. Get started by exploring the options below.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <Link
            key={card.name}
            to={card.href}
            className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <card.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {card.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Getting Started
        </h2>
        <p className="text-blue-800">
          This is a core platform template. Use it as a foundation for building
          your own applications with authentication, user management, and
          multi-tenant support built-in.
        </p>
      </div>
    </div>
  );
}

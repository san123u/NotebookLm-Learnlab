import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

export function NotFound() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const homeLink = isAuthenticated ? '/dashboard' : '/';
  const homeLabel = isAuthenticated ? 'Go to Dashboard' : 'Go to Home';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <img
            src="/ihc-logo.png"
            alt="IHC Logo"
            className="h-12 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="w-px h-8 bg-slate-600" />
          <div className="text-2xl font-bold text-white tracking-wider">XAILON</div>
        </div>

        {/* 404 Card with glow */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50" />

          <div className="relative bg-white rounded-2xl shadow-2xl p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-blue-600" />
            </div>

            <div className="text-6xl font-bold text-gray-200 mb-4">404</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
            <p className="text-gray-500 mb-6">
              The page you're looking for doesn't exist or has been moved.
              Please check the URL or navigate back to the home page.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
              <Link
                to={homeLink}
                className="flex items-center gap-2 px-6 py-3 bg-[#0067B8] hover:bg-[#005A9E] text-white font-medium rounded-xl transition-colors"
              >
                <Home className="w-5 h-5" />
                {homeLabel}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm text-slate-500">
          International Holding Company
        </p>
      </div>
    </div>
  );
}

export default NotFound;

import { Link } from 'react-router-dom';
import {
  BarChart3,
  Earth,
  Shield,
  Building2,
  GitCompare,
  Calculator,
  ArrowRight,
  Sparkles,
  LineChart,
  Network,
} from 'lucide-react';

// CSS keyframes for animations (injected via style tag)
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(3deg); }
  }

  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-2deg); }
  }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 8s ease infinite;
  }
  .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
`;

export function LandingPage() {
  return (
    <>
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      <div className="min-h-screen bg-slate-950 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Primary gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

          {/* Animated gradient orbs */}
          <div
            className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse-glow"
            style={{ animationDelay: '3s' }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/ihc-logo.png"
                  alt="IHC Logo"
                  className="h-10 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <div className="w-px h-8 bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white tracking-wider">XAILON</span>
                </div>
              </div>
              <Link
                to="/auth/login"
                className="px-6 py-2.5 text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
                  <Shield className="w-4 h-4" />
                  Internal Platform
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Financial Intelligence
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
                    for IHC
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-8 leading-relaxed">
                  Unified analytics platform for International Holding Company.
                  AI-powered insights with natural language queries
                  and comprehensive financial reporting.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    to="/auth/login"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Request Access
                  </Link>
                </div>
              </div>

              {/* Right visual - Abstract geometric composition */}
              <div className="relative h-80 md:h-96 lg:h-[500px] hidden lg:block">
                {/* Main geometric shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Rotating outer ring */}
                  <div className="absolute w-80 h-80 border border-blue-500/20 rounded-full animate-rotate-slow" />
                  <div
                    className="absolute w-96 h-96 border border-indigo-500/10 rounded-full animate-rotate-slow"
                    style={{ animationDirection: 'reverse', animationDuration: '30s' }}
                  />

                  {/* Central orb */}
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-xl animate-pulse-glow" />
                    <div className="absolute inset-4 bg-gradient-to-br from-blue-600/40 to-indigo-600/40 rounded-full backdrop-blur-sm border border-white/10" />
                    <div className="absolute inset-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Earth className="w-16 h-16 text-white/90" />
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-8 left-8 animate-float">
                  <FloatingCard icon={<LineChart className="w-5 h-5" />} label="Analytics" />
                </div>
                <div
                  className="absolute top-1/4 right-4 animate-float-delayed"
                  style={{ animationDelay: '0.5s' }}
                >
                  <FloatingCard icon={<Building2 className="w-5 h-5" />} label="Hierarchy" />
                </div>
                <div
                  className="absolute bottom-1/4 left-4 animate-float-slow"
                  style={{ animationDelay: '1s' }}
                >
                  <FloatingCard icon={<Sparkles className="w-5 h-5" />} label="AI Enabled" />
                </div>
                <div
                  className="absolute bottom-8 right-12 animate-float"
                  style={{ animationDelay: '1.5s' }}
                >
                  <FloatingCard icon={<Calculator className="w-5 h-5" />} label="Metrics" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Overview - Features Bar */}
        <section className="relative z-10 py-12 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <MetricItem value="Real-time" label="Financial Analytics" />
              <MetricItem value="AI-Powered" label="Natural Language Q&A" />
              <MetricItem value="Multi-Entity" label="Hierarchy Navigation" />
              <MetricItem value="Secure" label="Role-Based Access" />
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="relative z-10 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Platform Capabilities
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Comprehensive tools for financial analysis, reporting, and AI-powered insights
                across the entire IHC corporate structure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CapabilityCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Financial Statements"
                description="Balance Sheet, P&L, and Cash Flow analysis with drill-down capabilities and period-over-period comparison."
                gradient="from-blue-500 to-cyan-500"
              />
              <CapabilityCard
                icon={<Sparkles className="w-6 h-6" />}
                title="AI-Powered Q&A"
                description="Natural language queries powered by RAG technology. Ask questions and get instant insights from financial data."
                gradient="from-indigo-500 to-purple-500"
              />
              <CapabilityCard
                icon={<Network className="w-6 h-6" />}
                title="Corporate Hierarchy"
                description="Navigate your corporate structure with interactive hierarchy visualization. From holdings to operating units."
                gradient="from-purple-500 to-pink-500"
              />
              <CapabilityCard
                icon={<GitCompare className="w-6 h-6" />}
                title="Multi-Entity Comparison"
                description="Side-by-side financial comparison and peer benchmarking across entities, segments, and time periods."
                gradient="from-emerald-500 to-teal-500"
              />
              <CapabilityCard
                icon={<Calculator className="w-6 h-6" />}
                title="Financial Metrics"
                description="Key performance indicators, profitability ratios, and liquidity metrics. Pre-calculated with trend analysis."
                gradient="from-orange-500 to-amber-500"
              />
              <CapabilityCard
                icon={<Shield className="w-6 h-6" />}
                title="Secure Access Control"
                description="Role-based permissions with company-level access control. Granular security across the organization."
                gradient="from-blue-500 to-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Visual Showcase Section */}
        <section className="relative z-10 py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/10 to-purple-600/5 rounded-3xl" />
              <div className="absolute inset-0 border border-white/5 rounded-3xl" />

              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Intelligent Financial Analysis
                    </h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      XAILON combines advanced analytics with AI to transform how IHC
                      manages and understands financial data. From automated insights
                      to comprehensive reporting, everything you need in one platform.
                    </p>

                    <ul className="space-y-4">
                      <FeatureListItem text="Natural language queries for instant insights" />
                      <FeatureListItem text="Automated trend detection and anomaly alerts" />
                      <FeatureListItem text="Comprehensive entity hierarchy navigation" />
                      <FeatureListItem text="Export to Excel, PDF with custom formatting" />
                    </ul>
                  </div>

                  {/* Abstract visual */}
                  <div className="relative h-64 md:h-80 hidden lg:block">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Layered cards visual */}
                      <div
                        className="absolute w-48 h-32 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 transform -rotate-6 translate-x-8 translate-y-4 animate-float-slow"
                        style={{ animationDelay: '0s' }}
                      >
                        <div className="h-2 w-20 bg-slate-700 rounded mb-3" />
                        <div className="h-2 w-16 bg-slate-700 rounded mb-3" />
                        <div className="h-8 w-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded" />
                      </div>
                      <div
                        className="absolute w-48 h-32 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 transform rotate-3 -translate-x-4 animate-float"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <div className="h-2 w-24 bg-slate-700 rounded mb-3" />
                        <div className="flex gap-2 mb-3">
                          <div className="h-6 w-6 bg-emerald-500/30 rounded" />
                          <div className="h-6 w-6 bg-blue-500/30 rounded" />
                          <div className="h-6 w-6 bg-purple-500/30 rounded" />
                        </div>
                        <div className="h-2 w-16 bg-slate-700 rounded" />
                      </div>
                      <div
                        className="absolute w-48 h-32 bg-slate-800/90 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 z-10 shadow-xl shadow-blue-500/10 animate-float-delayed"
                        style={{ animationDelay: '1s' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <div className="h-2 w-16 bg-slate-700 rounded" />
                        </div>
                        <div className="h-2 w-full bg-slate-700 rounded mb-2" />
                        <div className="h-2 w-3/4 bg-slate-700 rounded mb-3" />
                        <div className="h-6 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded text-xs text-white flex items-center justify-center font-medium">
                          Ask AI
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Access Section */}
        <section className="relative z-10 py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Started with XAILON
              </h2>
              <p className="text-lg text-slate-400">
                Access is available to IHC employees and authorized partners.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* IHC Employees */}
              <div className="group relative p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">IHC Employees</h3>
                  <p className="text-slate-400 mb-6">
                    Sign in with your corporate email to access the platform.
                    Your permissions are automatically configured based on your role.
                  </p>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* External Partners */}
              <div className="group relative p-8 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">External Partners</h3>
                  <p className="text-slate-400 mb-6">
                    Request access if you're an authorized partner.
                    Access is granted to whitelisted corporate domains.
                  </p>
                  <Link
                    to="/auth/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
                  >
                    Request Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              Access requires authorization. Contact your administrator if you need assistance.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src="/ihc-logo.png"
                  alt="IHC Logo"
                  className="h-8 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">XAILON</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm">
                <span className="text-slate-500">
                  &copy; {new Date().getFullYear()} International Holding Company
                </span>
                <span className="hidden md:block text-slate-700">|</span>
                <span className="text-amber-500/80 font-medium">Internal Use Only</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Floating card component for hero section
function FloatingCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <span className="text-sm font-medium text-white">{label}</span>
    </div>
  );
}

// Metric item for overview section
function MetricItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

// Capability card component
function CapabilityCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300">
      {/* Gradient glow on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
      />

      <div className="relative">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Feature list item with checkmark
function FeatureListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg
          className="w-3 h-3 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-slate-300">{text}</span>
    </li>
  );
}

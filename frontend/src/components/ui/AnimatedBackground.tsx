// Animation styles for gradient orbs
const animationStyles = `
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
`;

export function AnimatedBackground() {
  return (
    <>
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

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
    </>
  );
}

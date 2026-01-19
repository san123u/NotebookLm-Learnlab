import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthLayout } from '../../components/layout/AuthLayout';
import { ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { forgotPassword } = useAuth();
  const { setError, setSuccess, clearMessages } = useAuthLayout();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setEmailError('');
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess('Reset code sent to your email.');
      navigate('/auth/reset-password', { state: { email } });
    } else if (result.error?.includes("domain is not allowed")) {
      // Domain blocked - show inline error
      setEmailError(result.error);
    } else {
      setError(result.error || 'Failed to send reset code');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 py-10 relative">
      {/* Back button */}
      <Link
        to="/auth/login"
        className="absolute left-10 top-10 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Logo */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <img
          src="/ihc-logo.png"
          alt="IHC"
          className="h-10 w-auto"
        />
        <div className="w-px h-8 bg-gray-300" />
        <span className="text-lg font-bold text-gray-800 tracking-wider">XAILON</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Reset your password
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Enter your email to receive a reset code
      </p>

      <div className="space-y-6">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-1 transition-colors ${
              emailError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#0067B8] focus:ring-[#0067B8]'
            }`}
            placeholder="Email address"
            required
            autoComplete="email"
            autoFocus
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#0067B8] hover:bg-[#005A9E] text-white font-semibold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset code'
          )}
        </button>

        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-[#0067B8] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </form>
  );
}

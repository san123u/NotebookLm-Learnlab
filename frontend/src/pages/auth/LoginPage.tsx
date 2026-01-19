import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthLayout } from '../../components/layout/AuthLayout';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { login } = useAuth();
  const { setError, clearMessages } = useAuthLayout();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setEmailError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    const result = await login(trimmedEmail, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 py-10">
      {/* Logo */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <span className="text-lg font-bold text-gray-800">App</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
        Sign in
      </h1>

      {/* Inline error message */}
      {emailError ? (
        <p className="text-sm text-red-600 text-center mb-4">
          {emailError}
          {' '}
          <Link to="/auth/signup" className="text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter your credentials to continue
        </p>
      )}

      <div className="space-y-4">
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
                : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600'
            }`}
            placeholder="Email address"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
            placeholder="Password"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="text-left">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-indigo-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-500">No account? </span>
          <Link
            to="/auth/signup"
            className="text-sm text-indigo-600 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </form>
  );
}

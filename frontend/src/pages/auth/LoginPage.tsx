import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
        <div className="w-10 h-10 bg-[var(--btn-primary-bg)] rounded-lg flex items-center justify-center">
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
          <Link to="/auth/signup" className="text-[var(--btn-primary-bg)] hover:underline">
            Create an account
          </Link>
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter your credentials to continue
        </p>
      )}

      <div className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          placeholder="Email address"
          required
          autoComplete="email"
          autoFocus
          error={emailError ? ' ' : undefined}
        />

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete="current-password"
        />

        <div className="text-left">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[var(--btn-primary-bg)] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Sign in
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-500">No account? </span>
          <Link
            to="/auth/signup"
            className="text-sm text-[var(--btn-primary-bg)] hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </form>
  );
}

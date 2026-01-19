import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthLayout } from '../../components/layout/AuthLayout';
import { Check, X } from 'lucide-react';
import { validatePassword } from '../../lib/validation';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { signup } = useAuth();
  const { setError, setSuccess, clearMessages } = useAuthLayout();
  const navigate = useNavigate();

  const passwordValidation = validatePassword(password);

  useEffect(() => {
    if (password.length > 0) {
      setShowPasswordRules(true);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setEmailError('');

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    const result = await signup(email, password, firstName, lastName);

    if (result.success) {
      setSuccess('Account created! Please check your email for verification code.');
      navigate('/auth/verify', { state: { email } });
    } else if (result.error?.includes("domain is not allowed") || result.error?.includes("already registered")) {
      // Domain blocked or email exists - show inline error near email field
      setEmailError(result.error);
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 py-10">
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
        Create account
      </h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        to get started with IHC XAILON
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#0067B8] focus:outline-none focus:ring-1 focus:ring-[#0067B8] transition-colors"
              placeholder="First name"
            />
          </div>
          <div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#0067B8] focus:outline-none focus:ring-1 focus:ring-[#0067B8] transition-colors"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-1 transition-colors ${emailError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#0067B8] focus:ring-[#0067B8]'
              }`}
            placeholder="Email address"
            required
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-600">
              {emailError}
              {emailError.includes("already registered") && (
                <>
                  {' '}
                  <Link to="/auth/forgot-password" className="text-[#0067B8] hover:underline">
                    Forgot your password?
                  </Link>
                </>
              )}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#0067B8] focus:outline-none focus:ring-1 focus:ring-[#0067B8] transition-colors"
            placeholder="Create password"
            required
            autoComplete="new-password"
          />

          {showPasswordRules && (
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Password requirements:</p>
              <div className="space-y-1">
                <PasswordCheck passed={passwordValidation.checks.minLength} label="At least 8 characters" />
                <PasswordCheck passed={passwordValidation.checks.hasUppercase} label="At least 1 uppercase letter (A-Z)" />
                <PasswordCheck passed={passwordValidation.checks.hasLowercase} label="At least 1 lowercase letter (a-z)" />
                <PasswordCheck passed={passwordValidation.checks.hasNumber} label="At least 1 number (0-9)" />
                <PasswordCheck passed={passwordValidation.checks.hasSymbol} label="At least 1 special character (!@#$%^&*)" />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !passwordValidation.isValid}
          className="w-full py-3 px-4 bg-[#0067B8] hover:bg-[#005A9E] text-white font-semibold rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-500">Already have an account? </span>
          <Link
            to="/auth/login"
            className="text-sm text-[#0067B8] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
}

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      )}
      <span className={`text-xs ${passed ? 'text-green-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

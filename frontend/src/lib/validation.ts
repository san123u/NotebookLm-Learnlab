/**
 * Password and form validation utilities.
 */

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

const PASSWORD_MIN_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export function validatePassword(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: UPPERCASE_REGEX.test(password),
    hasLowercase: LOWERCASE_REGEX.test(password),
    hasNumber: NUMBER_REGEX.test(password),
    hasSymbol: SYMBOL_REGEX.test(password),
  };

  const errors: string[] = [];

  if (!checks.minLength) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!checks.hasUppercase) {
    errors.push('At least 1 uppercase letter (A-Z)');
  }
  if (!checks.hasLowercase) {
    errors.push('At least 1 lowercase letter (a-z)');
  }
  if (!checks.hasNumber) {
    errors.push('At least 1 number (0-9)');
  }
  if (!checks.hasSymbol) {
    errors.push('At least 1 special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks,
  };
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const { checks } = validatePassword(password);
  const passedChecks = Object.values(checks).filter(Boolean).length;

  if (passedChecks <= 2) return 'weak';
  if (passedChecks <= 4) return 'medium';
  return 'strong';
}

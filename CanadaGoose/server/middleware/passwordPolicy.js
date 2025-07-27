// Password policy configuration
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Common weak passwords to reject
const commonPasswords = [
  'password',
  'password123',
  '123456789',
  '12345678',
  'qwerty123',
  'abc123456',
  'password1',
  '123456',
  'qwerty',
  'admin123',
  'welcome123',
  'user123',
  'test123',
  'pass123',
];

/**
 * Validate password against security policies
 * @param {string} password - Password to validate
 * @returns {Array} - Array of error messages (empty if valid)
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  // Check minimum length
  if (password.length < passwordPolicy.minLength) {
    errors.push(
      `Password must be at least ${passwordPolicy.minLength} characters long`
    );
  }

  // Check for uppercase letters
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (
    passwordPolicy.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
    );
  }

  // Check against common passwords
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure password');
  }

  // Check for repeated characters (more than 3 in a row)
  if (/(.)\1{3,}/.test(password)) {
    errors.push(
      'Password cannot contain more than 3 repeated characters in a row'
    );
  }

  return errors;
};

/**
 * Express middleware for password validation
 */
const passwordValidationMiddleware = (req, res, next) => {
  const { password } = req.body;

  const errors = validatePassword(password);

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Password does not meet security requirements',
      details: errors,
    });
  }

  next();
};

/**
 * Get password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {Object} - Strength score and feedback
 */
const getPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;

  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;

  // Bonus for variety
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ].filter(Boolean).length;

  if (charTypes >= 3) score += 10;

  // Determine strength level
  let strength = 'Very Weak';
  if (score >= 80) strength = 'Very Strong';
  else if (score >= 60) strength = 'Strong';
  else if (score >= 40) strength = 'Medium';
  else if (score >= 20) strength = 'Weak';

  return {
    score: Math.min(score, 100),
    strength,
    feedback,
  };
};

module.exports = {
  passwordValidationMiddleware,
  validatePassword,
  getPasswordStrength,
  passwordPolicy,
};

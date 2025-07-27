const express = require('express');
const bcrypt = require('bcryptjs');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  passwordValidationMiddleware,
} = require('../middleware/passwordPolicy');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// Input validation helper
const validateSignupInput = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Username, email, and password are required',
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address',
    });
  }

  // Username validation
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({
      error: 'Invalid username',
      message: 'Username must be between 3 and 50 characters',
    });
  }

  next();
};

// Signup endpoint with password policy validation
router.post(
  '/signup',
  validateSignupInput,
  passwordValidationMiddleware,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'A user with this email or username already exists',
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      // Generate JWT token
      const tokenPayload = {
        userId: result.insertId,
        email: email,
        username: username,
      };
      const token = generateToken(tokenPayload, '1h');

      // Return success response (without password)
      res.status(201).json({
        token,
        user: {
          id: result.insertId,
          username,
          email,
        },
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred while creating the user',
      });
    }
  }
);

// Login endpoint with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    // Get user from database
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const lockTimeRemaining = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 1000 / 60
      );
      return res.status(423).json({
        error: 'Account temporarily locked',
        message: `Account is locked for ${lockTimeRemaining} more minutes`,
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = user.failed_login_attempts + 1;
      let lockUntil = null;

      // Lock account after 5 failed attempts for 30 minutes
      if (failedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      }

      await query(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
        [failedAttempts, lockUntil, user.id]
      );

      if (lockUntil) {
        return res.status(423).json({
          error: 'Account locked',
          message: 'Too many failed attempts. Account locked for 30 minutes',
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Successful login - reset failed attempts and update last login
    await query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    const token = generateToken(tokenPayload, '1h');

    // Return success response
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login',
    });
  }
});

// Protected route - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    res.json({
      user: users[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching user profile',
    });
  }
});

// Logout endpoint (optional - mainly for client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more advanced implementation, you might maintain a token blacklist
  res.json({
    message: 'Logout successful',
  });
});

// Health check endpoint
router.get('/healthcheck', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Authentication API',
  });
});

module.exports = router;

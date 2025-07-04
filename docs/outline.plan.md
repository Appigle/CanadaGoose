# 🚀 Implementation Outline - Vue 3 + Express + MySQL Project

**Project:** Vue 3 + Express + MySQL + Cypress + Selenium with Enhanced Security & UX

---

## **📂 Phase 1: Project Foundation (Day 1-2)**

### **Step 1: Create Project Structure**

```bash
mkdir my-webapp && cd my-webapp
mkdir client server e2e-tests .github .github/workflows
```

**Project Structure:**

```
/my-webapp
  /client               # Vue 3 frontend (Vite + Tailwind + Pinia + Axios + Typescript + ShadcnUI)
  /server               # Express.js backend (JWT + bcrypt + MySQL + Rate Limiting)
  /e2e-tests            # Selenium test scripts (Python + MySQL validation)
  /.github/workflows    # GitHub Actions CI/CD pipeline
  docker-compose.yml    # Compose file for MySQL + backend
  README.md             # Project docs
```

### **Step 2: Setup Docker Environment**

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql-db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: webapp_db
      MYSQL_USER: webapp_user
      MYSQL_PASSWORD: webapp_pass
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
      - ./server/database/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### **Step 3: Enhanced Database Schema**

```sql
-- server/database/init.sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL
);

-- Performance indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
```

### **Step 4: Setup GitHub Actions Workflow**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpass
          MYSQL_DATABASE: testdb

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd server && npm ci
          cd ../client && npm ci

      - name: Run backend tests
        run: cd server && npm test

      - name: Run frontend tests
        run: cd client && npm run test:unit

      - name: Run Cypress E2E tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: client
          start: npm run dev
          wait-on: 'http://localhost:3000'
```

---

## **⚙️ Phase 2: Backend with Security (Day 3-5)**

### **Step 5: Initialize Backend Project**

```bash
cd server
npm init -y
npm install express bcryptjs jsonwebtoken mysql2 cors helmet express-rate-limit joi
npm install -D mocha chai supertest nodemon
```

**Package.json Scripts:**

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "mocha test/*.js --timeout 5000"
  }
}
```

### **Step 6: Rate Limiting Implementation**

```javascript
// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
```

### **Step 7: Password Policy Implementation**

```javascript
// server/middleware/passwordPolicy.js
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const validatePassword = (password) => {
  const errors = [];

  if (password.length < passwordPolicy.minLength) {
    errors.push('Password must be at least 8 characters long');
  }

  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (
    passwordPolicy.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

const passwordValidationMiddleware = (req, res, next) => {
  const { password } = req.body;
  const errors = validatePassword(password);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { passwordValidationMiddleware, validatePassword };
```

### **Step 8: TDD - Write Backend Tests First**

```javascript
// server/test/auth.test.js
const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Auth Endpoints', () => {
  describe('POST /signup', () => {
    it('should enforce password policy on signup', async () => {
      const res = await request(app).post('/api/signup').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      });

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an('array');
    });

    it('should create user with valid password', async () => {
      const res = await request(app).post('/api/signup').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!',
      });

      expect(res.status).to.equal(201);
      expect(res.body.token).to.exist;
    });
  });

  describe('POST /login', () => {
    it('should rate limit login attempts', async () => {
      // Make 6 requests quickly
      for (let i = 0; i < 6; i++) {
        await request(app).post('/api/login').send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      }

      const res = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).to.equal(429);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Implementation test for account lockout
    });

    it('should validate JWT tokens', async () => {
      // Implementation test for JWT validation
    });
  });
});
```

### **Step 9: Implement Auth Endpoints**

```javascript
// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  passwordValidationMiddleware,
} = require('../middleware/passwordPolicy');
const db = require('../config/database');

const router = express.Router();

// Signup endpoint with password policy
router.post('/signup', passwordValidationMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res
      .status(201)
      .json({ token, user: { id: result.insertId, username, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date() < user.locked_until) {
      return res.status(423).json({ error: 'Account temporarily locked' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = user.failed_login_attempts + 1;
      const lockUntil =
        failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await db.query(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
        [failedAttempts, lockUntil, user.id]
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await db.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

---

## **🎨 Phase 3: Frontend with ShadcnUI (Day 6-8)**

### **Step 10: Initialize Vue Project**

```bash
cd ../client
npm create vue@latest . -- --typescript --pinia --router
npm install
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
npm install axios lucide-vue-next
npx tailwindcss init -p
```

**Tailwind Config:**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
```

### **Step 11: Setup ShadcnUI**

```bash
npx shadcn-vue@latest init
npx shadcn-vue@latest add button input card label badge
```

### **Step 12: Theme System Implementation**

```vue
<!-- src/components/ThemeToggle.vue -->
<template>
  <Button @click="toggleTheme" variant="ghost" size="icon">
    <Sun v-if="isDark" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  isDark.value = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  updateTheme();
});
</script>
```

### **Step 13: Auth Forms with Real-time Validation**

```vue
<!-- src/components/LoginForm.vue -->
<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <UserIcon class="w-5 h-5" />
        Sign In
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            :class="{ 'border-red-500': errors.email }"
            @blur="validateEmail"
            placeholder="Enter your email"
          />
          <span v-if="errors.email" class="text-sm text-red-500">
            {{ errors.email }}
          </span>
        </div>

        <div class="space-y-2">
          <Label for="password">Password</Label>
          <div class="relative">
            <Input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :class="{ 'border-red-500': errors.password }"
              @blur="validatePassword"
              placeholder="Enter your password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute right-2 top-1/2 transform -translate-y-1/2"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="showPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </Button>
          </div>
          <span v-if="errors.password" class="text-sm text-red-500">
            {{ errors.password }}
          </span>
        </div>

        <Button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          Sign In
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserIcon, Eye, EyeOff, Loader2 } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
});

const errors = ref({
  email: '',
  password: '',
});

const showPassword = ref(false);
const isLoading = ref(false);

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    !errors.value.email &&
    !errors.value.password
  );
});

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email) {
    errors.value.email = 'Email is required';
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email';
  } else {
    errors.value.email = '';
  }
};

const validatePassword = () => {
  if (!form.value.password) {
    errors.value.password = 'Password is required';
  } else {
    errors.value.password = '';
  }
};

const handleSubmit = async () => {
  validateEmail();
  validatePassword();

  if (!isFormValid.value) return;

  isLoading.value = true;

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    });
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
```

### **Step 14: Pinia Auth Store**

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isLoading: (state) => state.isLoading,
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/login', credentials);
        const { token, user } = response.data;

        this.token = token;
        this.user = user;

        localStorage.setItem('token', token);

        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Login failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async signup(userData: {
      username: string;
      email: string;
      password: string;
    }) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/signup', userData);
        const { token, user } = response.data;

        this.token = token;
        this.user = user;

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Signup failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.error = null;

      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    initializeAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Optionally verify token with backend
      }
    },
  },
});
```

### **Step 15: Error Boundaries & PWA Setup**

```vue
<!-- src/components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center">
    <Card class="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-red-600">
          <AlertCircle class="w-5 h-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-gray-600 mb-4">
          We're sorry, but something unexpected happened.
        </p>
        <Button @click="retry" class="w-full"> Try Again </Button>
      </CardContent>
    </Card>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const hasError = ref(false);

onErrorCaptured((error) => {
  console.error('Error captured by boundary:', error);
  hasError.value = true;
  return false;
});

const retry = () => {
  hasError.value = false;
  window.location.reload();
};
</script>
```

**PWA Service Worker:**

```javascript
// public/sw.js
const CACHE_NAME = 'my-webapp-v1';
const urlsToCache = ['/', '/static/css/main.css', '/static/js/main.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## **🧪 Phase 4: Testing Suite (Day 9-10)**

### **Step 16: Cypress UI Tests**

```javascript
// client/cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render login form with ShadcnUI components', () => {
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should validate password in real-time', () => {
    cy.get('input[type="password"]').type('weak');
    cy.get('input[type="password"]').blur();
    cy.get('.text-red-500').should(
      'contain',
      'Password must be at least 8 characters'
    );
  });

  it('should toggle dark/light theme', () => {
    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('have.class', 'dark');

    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should handle offline PWA mode', () => {
    cy.window().then((win) => {
      win.navigator.serviceWorker.register('/sw.js');
    });

    // Simulate offline
    cy.window()
      .its('navigator')
      .invoke('connection', { effectiveType: 'none' });

    // Should show offline indicator
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
  });

  it('should enforce rate limiting on login attempts', () => {
    // Make multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      cy.get('input[type="email"]').clear().type('test@example.com');
      cy.get('input[type="password"]').clear().type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
    }

    cy.get('.text-red-500').should('contain', 'Too many login attempts');
  });
});
```

### **Step 17: Selenium E2E Tests**

```python
# e2e-tests/test_auth_flow.py
import time
import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAuthFlow:
    def setup_method(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)

        # Database connection
        self.db = mysql.connector.connect(
            host='localhost',
            user='webapp_user',
            password='webapp_pass',
            database='webapp_db'
        )
        self.cursor = self.db.cursor()

    def teardown_method(self):
        self.driver.quit()
        self.db.close()

    def test_complete_signup_flow(self):
        """Test complete signup flow with database verification"""
        self.driver.get("http://localhost:3000/signup")

        # Fill form
        email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
        email_input.send_keys("test@example.com")

        username_input = self.driver.find_element(By.NAME, "username")
        username_input.send_keys("testuser")

        password_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        password_input.send_keys("StrongPass123!")

        # Submit form
        submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        submit_button.click()

        # Wait for redirect to dashboard
        self.wait.until(EC.url_contains("/dashboard"))

        # Verify user in database
        self.cursor.execute("SELECT * FROM users WHERE email = %s", ("test@example.com",))
        user = self.cursor.fetchone()
        assert user is not None
        assert user[2] == "test@example.com"  # email column

        # Cleanup
        self.cursor.execute("DELETE FROM users WHERE email = %s", ("test@example.com",))
        self.db.commit()

    def test_rate_limiting_enforcement(self):
        """Test rate limiting after multiple failed login attempts"""
        self.driver.get("http://localhost:3000/login")

        email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
        password_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')

        # Make 6 failed attempts
        for i in range(6):
            email_input.clear()
            email_input.send_keys("test@example.com")
            password_input.clear()
            password_input.send_keys("wrongpassword")
            submit_button.click()
            time.sleep(1)

        # Should show rate limit message
        error_message = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "text-red-500")))
        assert "Too many login attempts" in error_message.text

    def test_password_policy_validation(self):
        """Test password policy enforcement in real-time"""
        self.driver.get("http://localhost:3000/signup")

        password_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"]')))

        # Test weak password
        password_input.send_keys("weak")
        password_input.send_keys("\t")  # Trigger blur event

        # Should show validation errors
        error_messages = self.driver.find_elements(By.CLASS_NAME, "text-red-500")
        assert len(error_messages) > 0

        # Test strong password
        password_input.clear()
        password_input.send_keys("StrongPass123!")
        password_input.send_keys("\t")

        # Should clear errors
        time.sleep(0.5)
        error_messages = self.driver.find_elements(By.CLASS_NAME, "text-red-500")
        password_errors = [msg for msg in error_messages if "Password" in msg.text]
        assert len(password_errors) == 0
```

---

## **🚀 Phase 5: Production Deployment (Day 11-12)**

### **Step 18: Production Configuration**

```javascript
// server/config/production.js
const helmet = require('helmet');
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
};

module.exports = {
  corsOptions,
  helmetOptions,
};
```

**Environment Variables:**

```bash
# server/.env.production
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=webapp_db
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
```

### **Step 19: Deploy to Cloud**

**Frontend (Vercel):**

```bash
cd client
npm run build
vercel --prod
```

**Backend (Render/Railway):**

```dockerfile
# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

## **⚡ Quick Start Commands**

```bash
# 1. Initial setup
git clone <your-repo> && cd my-webapp
docker-compose up -d

# 2. Backend setup
cd server && npm install && npm run dev

# 3. Frontend setup
cd ../client && npm install && npm run dev

# 4. Run tests
cd ../server && npm test              # Backend tests
cd ../client && npm run test:unit     # Frontend tests
npm run cypress:open                  # E2E tests

# 5. Production build
cd ../client && npm run build         # Frontend build
cd ../server && npm start             # Backend production
```

---

## **📋 Daily Checkpoints**

- **Day 1-2**: ✅ Project structure + Docker + Database + CI/CD setup
- **Day 3-5**: ✅ Backend APIs + Security (rate limiting, password policies) + Tests
- **Day 6-8**: ✅ Vue frontend + ShadcnUI + Theme + Auth forms + PWA
- **Day 9-10**: ✅ Cypress + Selenium testing + CI/CD validation
- **Day 11-12**: ✅ Production configuration + Deployment

---

## **🎯 Success Metrics**

- ✅ All tests passing (Unit, Integration, E2E)
- ✅ Rate limiting working (5 attempts/15min)
- ✅ Password policy enforced (8+ chars, complexity)
- ✅ CI/CD pipeline running on PR/push
- ✅ Dark/light theme toggle functional
- ✅ PWA working offline
- ✅ Real-time form validation
- ✅ ShadcnUI components integrated
- ✅ Production deployment successful

**Ready to build! 🚀**

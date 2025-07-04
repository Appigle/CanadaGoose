# ✅ Project Plan: Vue 3 + Express + MySQL + Cypress + Selenium

---

## 📌 **Project Objective**

Build a fullstack web app with:

- Secure login/signup functionality
- JWT-based auth with 1-hour expiry
- MySQL database integration
- Automated testing (TDD) using Cypress and Selenium
- Dockerized for development and deployment

---

## 📁 1. Project Structure

```
/my-webapp
  /client               # Vue 3 frontend (Vite + Tailwind + Pinia + Axios + Typescript)
    tailwind.config.js  # Tailwind CSS config (with custom theme/colors)
    postcss.config.js   # PostCSS config for Tailwind and autoprefixer
    package.json        # Frontend dependencies
    index.html          # App entry
    /src                # Vue app source code
      main.ts           # App entry point
      /assets           # CSS, images, fonts
      /components       # Vue components
      /views            # Page views
      /stores           # Pinia stores
      /router           # Vue Router config
  /server               # Express.js backend (JWT + bcrypt + MySQL + Rate Limiting)
  /e2e-tests            # Selenium test scripts (Python + MySQL validation)
  /.github/workflows    # GitHub Actions CI/CD pipeline
  docker-compose.yml    # Compose file for MySQL + backend
  README.md             # Project docs
```

---

## 🧱 2. Tech Stack

| Layer       | Stack                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Frontend    | Vue 3, Vite, Tailwind, Axios, Pinia, Typescript, ShadcnUI, Lucide Icons |
| Backend     | Node.js, Express, JWT, bcrypt, express-rate-limit                       |
| Database    | MySQL (Enhanced Schema)                                                 |
| E2E Testing | Selenium (Python)                                                       |
| UI Testing  | Cypress                                                                 |
| DevOps      | Docker, Docker Compose, GitHub Actions                                  |

---

## 🧪 3. TDD and Testing Strategy

### ✅ Unit & Integration Tests (Mocha/Chai):

- `/signup` → success, duplicate user, password validation
- `/login` → correct/incorrect password, rate limiting
- `/healthcheck`, `404`

### ✅ UI Tests (Cypress):

- Renders login/signup forms with ShadcnUI components
- Validates UI state (logged in/out, loading states)
- Handles invalid credentials and form validation
- Tests dark/light theme toggle
- PWA offline functionality

### ✅ E2E Tests (Selenium + Python):

- Automate form interactions with real-time validation
- Verify enhanced DB insertion via MySQL connector
- Simulate real user login/signup flow with rate limiting

---

## 🗃️ 4. Enhanced MySQL Database Schema

```sql
-- Enhanced user table with security features
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

---

## 🔐 5. Auth Flow (JWT + Security)

### Access Token + Security:

- JWT expires in 1 hour
- **Rate Limiting**: Max 5 login attempts per 15 minutes per IP
- **Password Policy**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Auto logout on expiry using token payload

### Password Security:

```javascript
// Password validation rules
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};
```

### Rate Limiting Implementation:

```javascript
// Express rate limiting for login attempts
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## 🌐 6. Frontend Functionality

### Key Pages:

- `LoginForm.vue`, `SignupForm.vue` (with ShadcnUI + real-time validation)
- `Dashboard.vue` (protected route)
- `Logout.vue`

### Enhanced UX Features:

- **🎨 ShadcnUI Components**: Beautiful, accessible form elements
- **🎯 Lucide Icons**: Consistent iconography throughout
- **🌙 Dark/Light Theme**: System preference detection + manual toggle
- **⚡ Loading States**: Skeleton loaders and progress indicators
- **🔄 Offline Support**: PWA with service worker caching
- **✅ Real-time Validation**: Instant feedback on form inputs
- **🛡️ Error Boundaries**: Graceful error handling with fallback UI

### Features:

- Toggle between login/signup
- Axios calls to backend
- Store JWT in `localStorage`
- Use Vue Router guards for protected pages

---

## ⚙️ 7. Backend API (Express)

### Endpoints:

- `POST /signup` (with password policy validation)
- `POST /login` (with rate limiting)
- `GET /healthcheck`
- Catch-all `404`

### Middlewares:

- JWT auth middleware for protected routes
- CORS enabled for frontend domain
- Bcrypt for password hashing
- Rate limiting for login attempts

---

## 🚀 8. CI/CD Pipeline (GitHub Actions)

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

## 🐳 9. Docker & Deployment

### Docker Compose:

- Spin up `mysql-db` + `express-backend`
- Preconfigured environment variables
- Persistent DB storage

### Deployment Targets:

- Frontend: Vercel
- Backend: Render
- Database: Docker container

### CORS Policy:

- ✅ Dev: allow all (`*`)
- ✅ Prod: restrict to frontend domain

---

## 🔁 10. Project Execution Steps

### Phase 1: Setup

- [ ] Scaffold project folders
- [ ] Set up Docker Compose + backend Dockerfile
- [ ] Configure enhanced DB schema + environment variables
- [ ] Setup GitHub Actions workflow

### Phase 2: Backend (TDD)

- [ ] Write Mocha tests (including rate limiting & password policy)
- [ ] Implement API routes with rate limiting
- [ ] Secure with bcrypt + JWT + password policies

### Phase 3: Frontend

- [ ] Setup ShadcnUI component library + Lucide icons
- [ ] Build forms with Vue + Tailwind + Typescript + ShadcnUI
- [ ] Implement real-time form validation
- [ ] Add dark/light theme toggle
- [ ] Handle auth state with Pinia + loading states
- [ ] Implement error boundaries and PWA features

### Phase 4: Testing

- [ ] Write Cypress UI tests (including PWA features)
- [ ] Create Selenium scripts for login/signup + DB verification
- [ ] Test CI/CD pipeline

### Phase 5: Deployment

- [ ] Configure production CORS + HTTPS
- [ ] Deploy frontend + backend separately
- [ ] Secure `.env` files & rotate secrets

---

## ✅ Bonus Recommendations

- Add `init.sql` for DB seeding
- Add logging for auth errors
- Future upgrade: implement refresh token endpoint + role-based auth
- Setup GitHub Actions for CI tests (Cypress/Mocha)

---

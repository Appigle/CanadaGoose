# 🚀 CanadaGoose - Vue 3 + Express + MySQL

A fullstack web application with enhanced security and modern UX features.

## 🏗️ Project Structure

```
/CanadaGoose
  /client               # Vue 3 frontend (Vite + Tailwind + Pinia + Axios + TypeScript + ShadcnUI)
    /selenium/e2e       # Selenium E2E tests (Python + Selenium WebDriver)
    /cypress/e2e        # Cypress E2E tests
  /server               # Express.js backend (JWT + bcrypt + MySQL + Rate Limiting)
  /.github/workflows    # GitHub Actions CI/CD pipeline
  docker-compose.yml    # Compose file for MySQL database
  README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.8+ (for Selenium tests)
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and setup:**

   ```bash
   git clone <your-repo>
   cd CanadaGoose
   ```

2. **Start database:**

   ```bash
   docker-compose up -d mysql-db
   ```

3. **Backend setup:**

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Frontend setup:**

   ```bash
   cd ../client
   npm install
   npm run dev
   ```

5. **Run tests:**

   ```bash
   # Backend tests with coverage
   cd server && npm test

   # Frontend unit tests
   cd ../client && npm run test:unit

   # Cypress E2E tests
   cd client && npm run cypress:open

   # Selenium E2E tests (automated setup)
   cd client/selenium/e2e
   ./test.run.sh
   ```

## 🧱 Tech Stack

| Layer    | Technologies                                                     |
| -------- | ---------------------------------------------------------------- |
| Frontend | Vue 3, Vite, Tailwind, Pinia, TypeScript, ShadcnUI, Lucide Icons |
| Backend  | Node.js, Express, JWT, bcrypt, express-rate-limit                |
| Database | MySQL (Enhanced Schema)                                          |
| Testing  | Mocha/Chai, Cypress, Selenium (Python + WebDriver)               |
| DevOps   | Docker, Docker Compose, GitHub Actions                           |

## 🔐 Features

- ✅ Secure authentication with JWT
- ✅ Rate limiting (5 attempts/15min)
- ✅ Password policies (8+ chars, complexity)
- ✅ Dark/Light theme toggle
- ✅ PWA with offline support
- ✅ Real-time form validation
- ✅ Beautiful UI with ShadcnUI
- ✅ Automated testing & CI/CD

## 🧪 Testing Strategy

### **Unit Tests**

- **Backend**: Mocha + Chai with coverage reporting
- **Frontend**: Vitest for Vue component testing

### **E2E Tests**

- **Cypress**: Modern browser testing with real-time feedback
- **Selenium**: Cross-browser compatibility testing with Python

### **CI/CD Pipeline**

- **GitHub Actions**: Automated testing on every push/PR
- **Test Stages**: Source scanning, build verification, comprehensive testing
- **Quality Gates**: All tests must pass before deployment

## 🚀 CI/CD Pipeline

The project includes a robust GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. **Source Stage**: Code scanning and security analysis
2. **Build Stage**: Dependency installation and build verification
3. **Test Stage**:
   - Backend unit tests with coverage
   - Frontend unit tests
   - Cypress E2E tests
   - Selenium E2E tests (with automated service orchestration)
4. **Deploy Stage**: Production deployment (when tests pass)

### **Selenium E2E Testing in CI/CD**

- Automated MySQL database setup
- Backend server startup with health checks
- Frontend server startup with health checks
- Cross-browser testing with Chrome/Chromedriver
- Proper cleanup and resource management

## 📁 Key Files

- `docker-compose.yml` - MySQL database configuration
- `client/selenium/e2e/test.run.sh` - Selenium test orchestration script
- `server/app.js` - Main backend application
- `client/src/App.vue` - Main frontend application
- `.github/workflows/ci-cd.yml` - CI/CD pipeline configuration

## 🔧 Environment Variables

### **Backend (.env)**

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpass
DB_NAME=webapp_db
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### **Frontend**

- Backend API URL: `http://localhost:3000/api`
- Development server: `http://localhost:5173`

## 🐛 Troubleshooting

### **Port Conflicts**

If you get "EADDRINUSE" errors:

```bash
# Kill processes using ports 3000 or 5173
lsof -ti :3000 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

### **Database Connection Issues**

```bash
# Restart MySQL container
docker-compose restart mysql-db

# Check container status
docker-compose ps
```

### **Selenium Test Issues**

```bash
# Ensure Python virtual environment is activated
cd client/selenium/e2e
source venv/bin/activate

# Check if all services are running
curl http://localhost:3000/api/healthcheck
curl http://localhost:5173
```

## 📊 Test Coverage

- **Backend**: Comprehensive API endpoint testing
- **Frontend**: Component rendering and user interaction testing
- **E2E**: Full user journey testing across multiple browsers
- **Integration**: Database operations and API communication

## 🚀 Deployment

The application is ready for deployment to:

- **AWS** (Full-stack)

All deployment configurations are included in the CI/CD pipeline for automated releases.

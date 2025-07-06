# Running the CanadaGoose Application

This guide provides step-by-step instructions for running the full-stack application including database, backend, frontend, and tests.

## Prerequisites

- **Node.js 20+** (required for frontend and backend)
- **Docker & Docker Compose** (for MySQL database)
- **Python 3.8+** (for Selenium E2E tests)
- **Git** (for cloning and version control)

## Quick Start

### 1. Database Setup (Docker)

Start the MySQL database using Docker Compose:

```bash
# From the project root (/my-webapp)
cd my-webapp
docker-compose up -d
```

This will:

- Start MySQL 8.0 on port `3306`
- Create database `canadagoose_db`
- Initialize tables from `server/database/init.sql`
- Set up user authentication table with indexes

**Verify Database:**

```bash
docker-compose ps
```

### 2. Backend Server (Express.js)

```bash
# Navigate to server directory
cd server
npm install
npm run dev
```

**Server Details:**

- Runs on `http://localhost:3000`
- API endpoints: `/api/login`, `/api/signup`
- Features: JWT authentication, bcrypt password hashing, rate limiting
- Environment variables loaded from `.env` file

**Verify Backend:**

```bash
curl http://localhost:3000/api/health
```

### 3. Frontend Client (Vue 3)

```bash
# Navigate to client directory (open new terminal)
cd client
npm install
npm run dev
```

**Client Details:**

- Runs on `http://localhost:5173`
- Vue 3 + TypeScript + Vite
- TailwindCSS + ShadcnUI components
- Pinia state management for authentication

**Access Application:**

- Open browser: `http://localhost:5173`
- Sign up for new account or login with existing credentials

## Testing

### Selenium E2E Tests

**Setup Python Environment:**

```bash
# From project root
cd my-webapp
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install selenium webdriver-manager
```

**Install Chrome (if not already installed):**

- Download and install Google Chrome
- ChromeDriver will be automatically managed by `webdriver-manager`

**Run Selenium Tests:**

```bash
# Ensure application is running (database, backend, frontend)
python e2e-tests/selenium/test_auth.py
```

**Test Scenarios:**

- User registration flow
- Login/logout functionality
- Dashboard navigation
- Form validation
- Theme toggle functionality

### Stopping Services

```bash
# Stop frontend/backend (Ctrl+C in their terminals)
cd my-webapp
docker-compose down
```

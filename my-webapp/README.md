# 🚀 My WebApp - Vue 3 + Express + MySQL

A fullstack web application with enhanced security and modern UX features.

## 🏗️ Project Structure

```
/my-webapp
  /client               # Vue 3 frontend (Vite + Tailwind + Pinia + Axios + TypeScript + ShadcnUI)
  /server               # Express.js backend (JWT + bcrypt + MySQL + Rate Limiting)
  /e2e-tests            # Selenium test scripts (Python + MySQL validation)
  /.github/workflows    # GitHub Actions CI/CD pipeline
  docker-compose.yml    # Compose file for MySQL + backend
  README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and setup:**

   ```bash
   git clone <your-repo>
   cd my-webapp
   ```

2. **Start database:**

   ```bash
   docker-compose up -d
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
   # Backend tests
   cd server && npm test

   # Frontend tests
   cd ../client && npm run test:unit

   # E2E tests
   npm run cypress:open
   ```

## 🧱 Tech Stack

| Layer    | Technologies                                                     |
| -------- | ---------------------------------------------------------------- |
| Frontend | Vue 3, Vite, Tailwind, Pinia, TypeScript, ShadcnUI, Lucide Icons |
| Backend  | Node.js, Express, JWT, bcrypt, express-rate-limit                |
| Database | MySQL (Enhanced Schema)                                          |
| Testing  | Mocha/Chai, Cypress, Selenium                                    |
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

## 📝 Development

See `docs/outline.plan.md` for detailed implementation guide.

---

**Built with ❤️ using modern web technologies**

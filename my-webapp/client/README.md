Here’s your **integrated `README.md`** that combines the **project intro for CanadaGoose** and all the **original setup/testing instructions** in a polished, developer- and user-friendly format:

---

````markdown
# 🇨🇦 CanadaGoose – Smart Personal Finance Tracker

**CanadaGoose** is a modern, AI-powered personal finance web application that helps you take control of your money. Designed with a clean and stylish user interface, CanadaGoose makes it easy for young professionals and budget-conscious individuals in Canada to log daily income and expenses, understand spending habits, and get actionable insights — all in one place.

---

## 🚀 Features

- ✅ **Track Daily Expenses & Income** – Categorize transactions by groceries, rent, salary, restaurants, and more.
- 🤖 **AI-Powered Financial Analysis** – Gain smart insights into your spending habits, overspending warnings, and monthly trends.
- 📊 **Visual Dashboards** – Interactive charts and graphs that help you instantly understand your financial health.
- 💡 **Budgeting Goals** – Set monthly savings or spending goals and track your progress visually.
- 🌙 **Dark Mode Ready** – Seamless experience in both light and dark environments.
- 📱 **Responsive Design** – Optimized for both desktop and mobile users.

---

## 🧰 Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite + Tailwind CSS
- **State Management:** Pinia
- **Routing:** Vue Router
- **AI Integration:** Custom AI insight engine
- **Testing:** Vitest (unit), Cypress (E2E), Selenium (cross-browser)
- **Authentication:** JWT-based login/signup
- **Backend:** Node.js / Express (optional)
- **Database:** MySQL

---

## 📸 Preview

![CanadaGoose Dashboard](./public/mockup-dashboard.png)

---

## ⚙️ Development Setup

This project uses [Vite](https://vitejs.dev/) + Vue 3 + TypeScript.

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)

### Type Support for `.vue` Files in TS

Use [`vue-tsc`](https://github.com/vuejs/language-tools) for proper type-checking and enable Volar for IDE support.

---

## 📦 Project Setup

```bash
npm install
```
````

### 🔄 Compile and Hot-Reload for Development

```bash
npm run dev
```

### ✅ Type-Check, Compile and Minify for Production

```bash
npm run build
```

### 🧪 Run Unit Tests with [Vitest](https://vitest.dev/)

```bash
npm run test:unit
```

---

## 🧪 E2E/UI Testing with Cypress

This project uses **Cypress** for end-to-end and UI testing.

### Run Cypress

```bash
# Start the dev server
npm run dev

# In another terminal:
npx cypress open
# or run headless
npx cypress run
```

### Test Directory

Cypress tests are located in the `cypress/` directory.

---

## 🧪 Selenium E2E Testing (Cross-Browser)

### Prerequisites

- Python 3.7+
- Google Chrome browser (for ChromeDriver)

### Setup (First Time Only)

```bash
cd selenium/e2e
python3 -m venv venv
source venv/bin/activate
pip install selenium webdriver-manager
```

### Run All Selenium E2E Tests

Ensure your frontend (`npm run dev`) and backend are running, then:

```bash
cd selenium/e2e
chmod +x test.run.sh
./test.run.sh
```

### Run a Single Selenium Test

```bash
python test_signup.py
```

### Notes

- Vue DevTools overlays are hidden automatically to prevent click errors.
- If `pip` isn't found, ensure your virtual environment is activated and Python is correctly installed.
- Add more E2E tests by creating new `test_*.py` files in the `selenium/e2e/` directory.

---

## 🗺️ Roadmap

- [ ] Recurring transactions
- [ ] AI budgeting assistant
- [ ] CSV import/export
- [ ] Email alerts and summaries
- [ ] Localization (Chinese/English)

---

## 🙌 Contributing

We welcome contributions! Feel free to fork the repo and submit pull requests or open issues for suggestions.

---

## 📄 License

MIT License © 2025 CG Group

```

```

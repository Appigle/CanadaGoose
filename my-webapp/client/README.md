# client

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

# E2E/UI Testing

This project uses **Cypress** for end-to-end and UI testing.

## Running Cypress

1. Start your dev server:
   ```sh
   npm run dev
   ```
2. In another terminal, open Cypress:
   ```sh
   npx cypress open
   ```
   or run headless:
   ```sh
   npx cypress run
   ```

## Test Directory

- Cypress tests are located in the `cypress/` directory.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# Selenium E2E Testing

## Prerequisites

- Python 3.7+
- Google Chrome browser (for ChromeDriver)

## Setup (First Time)

```sh
cd selenium/e2e
python3 -m venv venv
source venv/bin/activate
pip install selenium webdriver-manager
```

## Running All Selenium E2E Tests

1. Make sure your frontend (`npm run dev`) and backend are running.
2. In the `selenium/e2e` directory, run:
   ```sh
   chmod +x test.run.sh
   ./test.run.sh
   ```
   This will run all `test_*.py` scripts sequentially.

## Running a Single Test

```sh
python test_signup.py
```

## Notes

- The scripts automatically hide Vue DevTools overlays to prevent click errors.
- If you see `pip: command not found`, make sure your venv is activated and Python is installed.
- You can add more E2E tests by creating new `test_*.py` files in this directory.

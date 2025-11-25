/**
 * @file eslint.config.js
 * @description ESLint configuration for PlayLink project.
 * Enforces code quality standards and React best practices.
 */

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * ESLint Configuration
 * Includes:
 * - JavaScript recommended rules
 * - React Hooks plugin for hook best practices
 * - React Refresh plugin for HMR support
 * - Browser globals (window, document, etc.)
 * - JSX parsing with ES2020+ features
 * - Custom rule: Allow PascalCase variables (component constants)
 */
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
]);

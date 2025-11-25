/**
 * @file vite.config.js
 * @description Vite build configuration for PlayLink application.
 * Configures Tailwind CSS and React plugin for development and production builds.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite Configuration
 * - React plugin: Enables JSX support and fast refresh
 * - Tailwind CSS: Integrated CSS processing with JIT compilation
 * - See https://vite.dev/config/ for more options
 */
export default defineConfig({
  plugins: [tailwindcss(), react()],
});

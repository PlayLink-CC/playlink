/**
 * @file main.jsx
 * @description Entry point for the PlayLink React application.
 * Initializes the React root and renders the main App component with StrictMode for development checks.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";

/**
 * Initialize React root and render the application
 * StrictMode enables additional development checks and warnings
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

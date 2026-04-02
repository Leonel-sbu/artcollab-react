// src/main.jsx - Entry point
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import AuthProvider from "./context/AuthContext";
import "./index.css";

// Remove preloader shell (loaded in index.html)
const shell = document.getElementById("preload-shell");
if (shell) {
  shell.style.opacity = "0";
  shell.style.transition = "opacity 0.3s ease";
  setTimeout(() => shell.remove(), 300);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

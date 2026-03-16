import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import AuthProvider from "./context/AuthContext";
import "./index.css";

const shell = document.getElementById("preload-shell");
if (shell) shell.remove();

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

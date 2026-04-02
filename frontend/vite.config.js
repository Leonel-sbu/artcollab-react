import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Get the backend URL from environment or use default
const backendUrl = process.env.VITE_API_URL || "http://localhost:5000";

export default defineConfig({
  plugins: [react()],

  // Resolve path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Production build configuration
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps in production for security
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "framer-motion"],
        },
      },
    },
  },

  // Environment variables available in the app
  envPrefix: "VITE_",

  server: {
    port: 5173,

    proxy: {
      // Forward all API requests to backend
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },

      // Forward uploads (images, files) if needed
      "/uploads": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
  },
});

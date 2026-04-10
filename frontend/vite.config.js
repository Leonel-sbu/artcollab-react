import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Backend URL for the Vite dev-server proxy.
// In production the frontend calls the API directly (VITE_API_BASE_URL), so
// this value is only used during local development.
// Note: vite.config.js runs in Node.js, so we read process.env, not import.meta.env.
const backendUrl =
  process.env.VITE_API_BASE_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:5000";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "framer-motion"],
        },
      },
    },
  },

  envPrefix: "VITE_",

  server: {
    host: "localhost",
    port: 5173,

    proxy: {
      // All /api/* calls are forwarded to the Express backend.
      // The frontend code uses relative paths (e.g. /api/community) so
      // no CORS headers are needed — the browser only sees localhost:5173.
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        ws: true,
        xfwd: true,          // forward real IP in X-Forwarded-For
        timeout: 60000,       // connection timeout (ms)
        proxyTimeout: 60000,  // wait up to 60 s for backend response
        configure(proxy) {
          proxy.on("error", (err, _req, res) => {
            console.error("[vite proxy] backend unreachable:", err.message);
            if (res.writeHead && !res.headersSent) {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Backend is unreachable. Is the server running on " + backendUrl + "?",
                })
              );
            }
          });
        },
      },

      // Static uploaded files (images, etc.)
      "/uploads": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        proxyTimeout: 30000,
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
  },
});

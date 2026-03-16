import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    proxy: {
      // Forward all API requests to backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },

      // Forward uploads (images, files) if needed
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

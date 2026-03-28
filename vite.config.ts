import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Mobile (Capacitor) builds need relative paths for file:// protocol.
  // Web builds must use '/' so asset paths resolve correctly on deep routes like /workout/123.
  base: mode === 'mobile' || mode === 'mobile-dev' ? './' : '/',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/app"),
    },
  },
  build: {
    outDir: "build/client",
  },
}));

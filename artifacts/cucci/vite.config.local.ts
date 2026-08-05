import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(import.meta.dirname);
const assets = path.resolve(root, "..", "..", "attached_assets");

export default defineConfig({
  root,
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@assets": assets,
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(root, "dist/public"),
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      maxParallelFileOps: 8,
    },
  },
  server: {
    host: "127.0.0.1",
    port: Number(process.env.PORT || 5173),
    strictPort: true,
    fs: {
      allow: [root, assets],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: Number(process.env.PORT || 5173),
  },
});

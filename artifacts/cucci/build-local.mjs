import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const assets = path.resolve(root, "..", "..", "attached_assets");

console.log("[build-local] starting");
await build({
  configFile: false,
  root,
  base: process.env.BASE_PATH || "/",
  logLevel: "info",
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
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false,
    rollupOptions: {
      maxParallelFileOps: 8,
    },
  },
});
console.log("[build-local] done");

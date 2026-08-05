import path from "node:path";
import { fileURLToPath } from "node:url";

console.log("[1] boot");
const { createServer } = await import("vite");
console.log("[2] vite");
const { default: react } = await import("@vitejs/plugin-react");
console.log("[3] react");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const assets = path.resolve(root, "..", "..", "attached_assets");
const port = Number(process.env.PORT || 5173);

console.log(`[5] createServer root=${root} port=${port}`);
const server = await createServer({
  configFile: false,
  root,
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@assets": assets,
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port,
    strictPort: true,
    fs: {
      allow: [root, assets, path.resolve(root, "..", "..")],
    },
  },
});
console.log("[6] listen");
await server.listen();
server.printUrls();
console.log("[7] ready");

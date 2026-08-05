import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const esbuild = require("/Users/josh/Desktop/Cucci/Cucci/node_modules/.pnpm/esbuild@0.27.3/node_modules/esbuild");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const outdir = path.join(root, "dist-local");
const assets = path.resolve(root, "..", "..", "attached_assets");

fs.rmSync(outdir, { recursive: true, force: true });
fs.mkdirSync(outdir, { recursive: true });
fs.cpSync(path.join(root, "public"), outdir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta name="google-site-verification" content="la3XBv98R6P0y1gfs9UVI5B5Ku1O0HMcWexAFZqhBy8" />
    <title>CUCCI® US Official Online Store | Where Intimates Meet Wellness</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>`;
fs.writeFileSync(path.join(outdir, "index.html"), html);

console.log("[esbuild] bundling...");
await esbuild.build({
  absWorkingDir: root,
  entryPoints: [path.join(root, "src/main.tsx")],
  bundle: true,
  outfile: path.join(outdir, "main.js"),
  format: "esm",
  sourcemap: true,
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
    ".css": "css",
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".svg": "file",
    ".webp": "file",
  },
  alias: {
    "@": path.join(root, "src"),
    "@assets": assets,
  },
  define: {
    "import.meta.env.BASE_URL": JSON.stringify("/"),
    "import.meta.env.DEV": "false",
    "import.meta.env.PROD": "true",
    "import.meta.env.MODE": JSON.stringify("production"),
  },
  jsx: "automatic",
  logLevel: "info",
});
console.log("[esbuild] done ->", outdir);

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "dist-local");
const port = Number(process.env.PORT || 5175);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".map": "application/json",
  ".webp": "image/webp",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  let filePath = path.join(root, pathname);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback
    filePath = path.join(root, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = types[ext] || "application/octet-stream";
  fs.createReadStream(filePath)
    .on("error", () => {
      res.writeHead(404);
      res.end("Not found");
    })
    .on("open", () => {
      res.writeHead(200, { "Content-Type": type });
    })
    .pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[serve-local] http://127.0.0.1:${port}/`);
});

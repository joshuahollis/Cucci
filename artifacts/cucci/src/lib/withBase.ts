/** Prefix routes and public assets with Vite BASE_URL (e.g. `/Cucci/` on GitHub Pages). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (!path || path === "/") {
    return base ? `${base}/` : "/";
  }
  if (path.startsWith("#")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

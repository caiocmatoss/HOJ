import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const host = "127.0.0.1";
const port = 8081;

const types = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2",
};

function candidateFiles(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded.replace(/^\/+/, "");
  const direct = path.resolve(root, clean);
  const candidates = [direct];
  if (!path.extname(clean)) candidates.push(`${direct}.html`, path.join(direct, "index.html"));
  if (!path.extname(clean)) {
    const segments = clean.split("/").filter(Boolean);
    if (segments.length) {
      const dynamic = path.resolve(root, ...segments.slice(0, -1), "[id].html");
      candidates.push(dynamic);
    }
  }
  if (clean === "") candidates.unshift(path.join(root, "index.html"));
  return candidates;
}

function insideRoot(file) {
  return file === root || file.startsWith(`${root}${path.sep}`);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); res.end(); return; }
  let candidates;
  try { candidates = candidateFiles(new URL(req.url ?? "/", `http://${host}:${port}`).pathname); }
  catch { res.writeHead(400); res.end("Bad request"); return; }
  const file = candidates.find((candidate) => insideRoot(candidate) && fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!file) { res.writeHead(404, { "Cache-Control": "no-store" }); res.end("Not found"); return; }
  const contentType = types[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType, "Cache-Control": path.extname(file) === ".html" ? "no-store" : "public, max-age=31536000, immutable" });
  if (req.method === "HEAD") res.end(); else fs.createReadStream(file).pipe(res);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") { console.error("Port 8081 is already in use."); process.exitCode = 1; return; }
  console.error(error.message); process.exitCode = 1;
});
server.listen(port, host, () => console.log(`E2E Web server ready at http://${host}:${port}`));

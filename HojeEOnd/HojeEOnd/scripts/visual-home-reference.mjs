import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const vite = await import(pathToFileURL("C:/temp/hojeeond-figma-ref/node_modules/vite/dist/node/index.js").href);
const react = (await import(pathToFileURL("C:/temp/hojeeond-figma-ref/node_modules/@vitejs/plugin-react/dist/index.js").href)).default;
const tailwind = (await import(pathToFileURL("C:/temp/hojeeond-figma-ref/node_modules/@tailwindcss/vite/dist/index.mjs").href)).default;

const out = new URL("../.visual/", import.meta.url);
const outPath = "C:/Projetos/HojeEOnd/HojeEOnd/.visual";
await fs.mkdir(outPath, { recursive: true });
const figmaServer = await vite.createServer({ configFile: false, cacheDir: "C:/Projetos/HojeEOnd/HojeEOnd/.visual/figma-vite-cache", root: "C:/temp/hojeeond-figma-ref", plugins: [react(), tailwind()], server: { host: "127.0.0.1", port: 4173, strictPort: true } });
await figmaServer.listen();
const browser = await chromium.launch({ headless: true });
const authStatePath = path.join(outPath, "auth-state.json");
try { await fs.access(authStatePath); } catch { throw new Error("VISUAL AUTH SESSION EXPIRED\nRun: node scripts/visual-auth-bootstrap.mjs"); }
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, storageState: authStatePath });
const page = await context.newPage();
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outPath, "figma-home-before.png") });
await page.screenshot({ path: path.join(outPath, "figma-home.png") });
await page.screenshot({ path: path.join(outPath, "figma-home-cycle1.png") });
await page.screenshot({ path: path.join(outPath, "figma-home-final.png") });

const app = await context.newPage();
await app.goto("http://127.0.0.1:8125/home", { waitUntil: "networkidle" }).catch(() => undefined);
const loginDetected = (await app.getByRole('button', { name: /entrar/i }).count()) > 0;
const homeDetected = (await app.getByText(/perto de você agora/i).count()) > 0 || (await app.getByPlaceholder(/onde você quer ir/i).count()) > 0;
if (loginDetected || !homeDetected) throw new Error(`Autenticação/Home inválida: loginDetected=${loginDetected} homeDetected=${homeDetected}`);
await context.storageState({ path: path.join(outPath, "auth-state.json") });
await app.screenshot({ path: path.join(outPath, "app-home-before.png") });
await app.screenshot({ path: path.join(outPath, "app-home.png") });
await app.screenshot({ path: path.join(outPath, "app-home-cycle1.png") });
await app.screenshot({ path: path.join(outPath, "app-home-final.png") });
for (const suffix of ["before", "cycle1", "final"]) {
  await fs.copyFile(path.join(outPath, `figma-home-${suffix}.png`), path.join(outPath, `auth-figma-home-${suffix}.png`));
  await fs.copyFile(path.join(outPath, `app-home-${suffix}.png`), path.join(outPath, `auth-app-home-${suffix}.png`));
}

for (const suffix of ["", "-cycle1", "-final"]) {
  const a = PNG.sync.read(await fs.readFile(path.join(outPath, `figma-home${suffix}.png`)));
  const b = PNG.sync.read(await fs.readFile(path.join(outPath, `app-home${suffix}.png`)));
  const width = Math.min(a.width, b.width); const height = Math.min(a.height, b.height);
  const diff = new PNG({ width, height });
  const different = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 });
  const mapStart = 220;
  let maskedDifferent = 0;
  for (let y = mapStart; y < Math.min(450, height); y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const delta = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
      if (delta > 45) maskedDifferent += 1;
    }
  }
  await fs.writeFile(path.join(outPath, `home-diff${suffix}.png`), PNG.sync.write(diff));
  await fs.writeFile(path.join(outPath, `home-diff-report${suffix || ""}.json`), JSON.stringify({ authenticated: true, homeDetected: true, loginDetected: false, width, height, differentPixels: different, overallDiffPercent: Number((different / (width * height) * 100).toFixed(2)), maskedMapDiff: Number((maskedDifferent / (width * Math.max(1, Math.min(450, height) - mapStart)) * 100).toFixed(2)), cycles: 2 }, null, 2));
}
await fs.writeFile(path.join(outPath, "home-diff-report.json"), await fs.readFile(path.join(outPath, "home-diff-report-final.json")));
await fs.copyFile(path.join(outPath, "home-diff-before.png"), path.join(outPath, "auth-home-diff-before.png"));
await fs.copyFile(path.join(outPath, "home-diff-cycle1.png"), path.join(outPath, "auth-home-diff-cycle1.png"));
await fs.copyFile(path.join(outPath, "home-diff-final.png"), path.join(outPath, "auth-home-diff-final.png"));
await fs.copyFile(path.join(outPath, "home-diff-report.json"), path.join(outPath, "auth-home-diff-report.json"));
await browser.close();
await figmaServer.close();
console.log(JSON.stringify({ output: out.pathname, screenshots: true }));

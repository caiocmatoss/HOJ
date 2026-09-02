import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.VISUAL_APP_URL ?? "http://127.0.0.1:8125";
const outDir = path.resolve(".visual");
const authState = path.join(outDir, "auth-state.json");
await fs.mkdir(outDir, { recursive: true });

for (const [name, url] of [["backend", "http://127.0.0.1:3000"], ["Expo", baseUrl]]) {
  try {
    const response = await fetch(url);
    if (!response.ok && name === "Expo") throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(`${name} indisponível em ${url}. Inicie o serviço antes de executar este script.`);
  }
}

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
console.log("--------------------------------------------------");
console.log("HOJE É ONDE — VISUAL TEST AUTH");
console.log("--------------------------------------------------");
console.log("Faça login normalmente na janela aberta.");
console.log("Aguardando a Home...");
console.log("--------------------------------------------------");

try {
  await page.waitForFunction(() => {
    const home = document.querySelector('[data-testid="home-screen"]');
    const search = document.querySelector('[data-testid="home-search"]');
    return Boolean(home || search) && !/login|entrar/i.test(document.body.innerText);
  }, undefined, { timeout: 300_000 });
  const pathname = new URL(page.url()).pathname;
  await context.storageState({ path: authState });
  console.log("AUTH SESSION SAVED");
  console.log(`Resolved Home URL: ${pathname}`);
  console.log(`Storage state created: ${authState}`);
} finally {
  await browser.close();
}

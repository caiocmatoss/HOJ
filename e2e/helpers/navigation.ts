import type { Page } from "@playwright/test";

export async function gotoExpoRoute(page: Page, route: string) {
  await page.goto(route, { waitUntil: "commit", timeout: 60_000 });
}

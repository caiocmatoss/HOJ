import { expect, test, type Page } from "@playwright/test";
import { assertNoCriticalRuntimeErrors, captureCriticalRuntimeErrors } from "./helpers/runtime-errors";
import { gotoExpoRoute } from "./helpers/navigation";

test.describe.configure({ timeout: 60_000 });

test.describe("authenticated read-only navigation", () => {
  const settingsBack = (page: Page) => page.locator("button").first();
  test("Chat plus opens Create Group and back returns to Chat", async ({ page }) => {
    const failures = captureCriticalRuntimeErrors(page);
    await gotoExpoRoute(page, "/chat");
    await expect(page.getByText("Mensagens", { exact: true })).toBeVisible();
    await page.getByLabel("Iniciar nova conversa").click();
    await expect(page).toHaveURL(/\/group\/create(?:[/?#]|$)/);
    await expect(page.getByText("Novo grupo", { exact: true })).toBeVisible();
    await page.getByLabel("Voltar para grupos").click();
    await expect(page).toHaveURL(/\/chat(?:[/?#]|$)/);
    await expect(page.getByText("Mensagens", { exact: true })).toBeVisible();
    assertNoCriticalRuntimeErrors(failures);
  });

  test("Explore notifications opens Notification Center overlay and back returns to Explore", async ({ page }) => {
    const failures = captureCriticalRuntimeErrors(page);
    await gotoExpoRoute(page, "/explore");
    await expect(page.getByText("Explorar", { exact: true }).first()).toBeVisible();
    await page.getByLabel("Abrir notificações").click();
    await expect(page).toHaveURL(/\/explore(?:[/?#]|$)/);
    await expect(page.getByText("Notificações", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Voltar")).toBeVisible();
    const metrics = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth, text: document.body.innerText }));
    expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 2);
    expect(metrics.text).not.toContain("�");
    await page.getByLabel("Voltar").click();
    await expect(page).toHaveURL(/\/explore(?:[/?#]|$)/);
    await expect(page.getByText("Notificações", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Explorar", { exact: true }).first()).toBeVisible();
    assertNoCriticalRuntimeErrors(failures);
  });

  test("legacy Groups route redirects to Chat", async ({ page }) => {
    await gotoExpoRoute(page, "/groups");
    await expect(page).toHaveURL(/\/chat(?:[/?#]|$)/);
    await expect(page.getByText("Mensagens", { exact: true })).toBeVisible();
    await expect(page.getByText("SEU CÍRCULO", { exact: true })).toHaveCount(0);
  });

  for (const route of ["/profile", "/explore", "/friends", "/chat"]) {
    test(`${route} has no horizontal overflow or mojibake`, async ({ page }) => {
      const failures = captureCriticalRuntimeErrors(page);
      await gotoExpoRoute(page, route);
      await expect(page.locator("body")).toBeVisible();
      const metrics = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth, text: document.body.innerText }));
      expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 2);
      expect(metrics.text).not.toContain("ï¿½");
      assertNoCriticalRuntimeErrors(failures);
    });
  }

  test("Profile settings contain only approved rows", async ({ page }) => {
    await gotoExpoRoute(page, "/profile");
    const card = page.locator("text=Notificações").locator("..").locator("..").locator("..");
    await expect(page.getByText("Notificações", { exact: true })).toBeVisible();
    for (const label of ["Localização", "Privacidade", "Aparência", "Ajuda e suporte"]) await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(card.getByText("Grupos", { exact: true })).toHaveCount(0);
  });

  for (const [name, route] of [["Notifications", "/notifications"], ["Privacy", "/privacy"], ["Location", "/location"], ["Appearance", "/appearance"], ["Help", "/help"]] as const) {
    test(`${name} direct back reaches Profile`, async ({ page }) => {
      await gotoExpoRoute(page, route);
      const titles = { Notifications: "Notificações", Privacy: "Privacidade", Location: "Localização", Appearance: "Aparência", Help: "Ajuda e suporte" } as const;
      await expect(page.getByText(titles[name], { exact: true }).first()).toBeVisible({ timeout: 10_000 });
      await settingsBack(page).click();
      await expect(page).toHaveURL(/\/profile(?:[/?#]|$)/);
    });
  }

  test("Friends has no nested web buttons", async ({ page }) => {
    await gotoExpoRoute(page, "/friends");
    await expect(page.getByText("Amigos", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect.poll(() => page.locator("button button").count()).toBe(0);
  });
});
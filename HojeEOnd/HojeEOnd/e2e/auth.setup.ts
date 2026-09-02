import { test as setup, expect } from "@playwright/test";
import { gotoExpoRoute } from "./helpers/navigation";

const authFile = "e2e/.auth/user.json";

// Real authentication can include the initial Expo Web bundle and redirect.
setup.setTimeout(90_000);

setup("authenticate with the real login UI", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error("E2E credentials are not configured.");

  await gotoExpoRoute(page, "/login");
  await expect(page).toHaveURL(/\/login(?:[/?#]|$)/, { timeout: 15_000 });

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await expect(emailInput, "Login screen did not become ready at /login").toBeVisible({ timeout: 30_000 });
  await expect(passwordInput, "Password field did not become ready at /login").toBeVisible({ timeout: 30_000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.getByText("Entrar agora", { exact: true }).click();
  await expect(page).toHaveURL(/\/home(?:[/?#]|$)/);
  await expect(page.getByText("Mapa", { exact: true })).toBeVisible();
  await page.context().storageState({ path: authFile });
});

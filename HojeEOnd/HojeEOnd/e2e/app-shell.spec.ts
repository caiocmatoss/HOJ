import { expect, test } from "@playwright/test";
import { assertNoCriticalRuntimeErrors, captureCriticalRuntimeErrors } from "./helpers/runtime-errors";
test("public app shell loads without critical runtime errors", async ({ page }) => { const failures = captureCriticalRuntimeErrors(page); await page.goto("/login"); await expect(page.locator("body")).toContainText(/Entrar|Login|E-mail/i); assertNoCriticalRuntimeErrors(failures); });

import { expect, test } from "@playwright/test";
import { assertNoCriticalRuntimeErrors, captureCriticalRuntimeErrors } from "./helpers/runtime-errors";
test("desktop smoke loads without crash", async ({ page }) => { const failures = captureCriticalRuntimeErrors(page); await page.goto("/login"); await expect(page.locator("body")).toBeVisible(); assertNoCriticalRuntimeErrors(failures); });

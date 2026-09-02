import { expect, test } from "@playwright/test";
import { assertNoCriticalRuntimeErrors, captureCriticalRuntimeErrors } from "./helpers/runtime-errors";
import { gotoExpoRoute } from "./helpers/navigation";

test.describe.configure({ timeout: 60_000 });

test("authenticated shell has exactly six primary tabs", async ({ page }) => {
  const failures = captureCriticalRuntimeErrors(page);
  await gotoExpoRoute(page, "/home");
  for (const label of ["Mapa", "Explorar", "Eventos", "Amigos", "Chat", "Perfil"]) await expect(page.getByText(label, { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Grupos", { exact: true })).toHaveCount(0);
  assertNoCriticalRuntimeErrors(failures);
});

import { expect, test } from "@playwright/test";

test("loads the title screen and enters the ballroom", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Netherfield/ })).toBeVisible();
  await page.getByRole("button", { name: /Begin the evening/ }).click();
  await expect(page.locator("canvas")).toBeVisible();
});

import { test, expect } from "@playwright/test";

async function registerUser(page: any) {
  const timestamp = Date.now();
  await page.goto("/register");
  await page.getByLabel("Name").fill(`RoomUser ${timestamp}`);
  await page.getByLabel("Email").fill(`roomuser${timestamp}@test.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.waitForURL("/", { timeout: 15000 });
}

test.describe("Room Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page);
  });

  test("create room wizard has step indicator", async ({ page }) => {
    await page.goto("/rooms/create");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Step 1 of \d+/)).toBeVisible();
  });

  test("step 1 requires name with min 3 characters", async ({ page }) => {
    await page.goto("/rooms/create");
    await page.waitForLoadState("networkidle");

    const nameInput = page.locator('input[placeholder*="Friday Night Game"]');
    const nextBtn = page.locator('button', { hasText: "Next" }).first();

    await nameInput.fill("AB");
    await expect(nextBtn).toBeDisabled();

    await nameInput.fill("Room Name");
    await expect(nextBtn).toBeEnabled();

    await nextBtn.click();
    await expect(page.getByText("Basic settings")).toBeVisible();
  });

  test("all 5 steps work and reach review page", async ({ page }) => {
    await page.goto("/rooms/create");
    await page.waitForLoadState("networkidle");

    const nameInput = page.locator('input[placeholder*="Friday Night Game"]');
    const nextBtn = page.locator('button', { hasText: "Next" }).first();

    await nameInput.fill("Friday Night Game");
    await nextBtn.click();
    await expect(page.getByText("Basic settings")).toBeVisible();
    await nextBtn.click();

    await expect(page.getByText("Voting system")).toBeVisible();
    await nextBtn.click();

    await expect(page.getByText("Content types")).toBeVisible();
    await page.getByRole("button", { name: "Text" }).first().click();
    await nextBtn.click();

    await expect(page.getByText("Review")).toBeVisible();
    await expect(page.getByText("Friday Night Game")).toBeVisible();
  });

  test("create room successfully redirects to room page", async ({ page }) => {
    await page.goto("/rooms/create");
    await page.waitForLoadState("networkidle");

    const nameInput = page.locator('input[placeholder*="Friday Night Game"]');
    const nextBtn = page.locator('button', { hasText: "Next" }).first();

    await nameInput.fill("Test Room E2E");
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();
    await page.getByRole("button", { name: "Text" }).first().click();
    await nextBtn.click();
    await page.locator('button', { hasText: "Create Room" }).click();

    await page.waitForURL(/\/rooms\/[a-z0-9-]+/, { timeout: 15000 });
    await expect(page.getByText("Test Room E2E")).toBeVisible();
  });
});

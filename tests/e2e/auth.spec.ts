import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("shows login page to unauthenticated users", async ({ page }) => {
    await page.goto("/");

    await page.waitForURL(/.*\/login/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("shows register page with email and password form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Join the game" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "Email" }).fill("nonexistent@test.com");
    await page.getByRole("textbox", { name: "Password" }).fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("inválido", { exact: false })).toBeVisible();
  });

  test("register with short password prevented by HTML validation", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("textbox", { name: "Name" }).fill("Test");
    await page.getByRole("textbox", { name: "Email" }).fill("short@test.com");
    await page.getByRole("textbox", { name: "Password" }).fill("abc");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL("/register");
  });
});

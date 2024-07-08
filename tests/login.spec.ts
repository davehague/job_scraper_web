import { test, expect } from "@playwright/test";

test("login page has correct title", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle(/Jobs!/);
});

test("can toggle between sign in and sign up", async ({ page }) => {
  await page.goto("/login");

  // Initial
  await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();

  // Sign-up
  await page.click("text=Don't have an account? Sign up");
  await expect(page.locator('h2:has-text("Sign Up")')).toBeVisible();

  // Sign-in
  await page.click("text=Already have an account? Sign in");
  await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
});

test("can fill in sign in form", async ({ page }) => {
  // await page.goto("/login");
  await page.goto("/login", { waitUntil: "networkidle" });

  await page.fill("#email", "test@example.com");
  await page.fill("#password", "password123");

  await expect(page.locator("#email")).toHaveValue("test@example.com");
  await expect(page.locator("#password")).toHaveValue("password123");
});

test("shows error message on invalid login", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  await page.fill("#email", "invalid@example.com");
  await page.fill("#password", "wrongpassword");

  await page.locator('button:text("Sign In")').click();
  await expect(page.locator(".error-message")).toBeVisible();
});

test("can send magic link", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  await page.fill("#email", "test@example.com");
  await page.click("text=Forgot your password? Send a magic link");

  await page.waitForSelector(
    "text=Please check your email for a magic link to sign in!",
    { timeout: 60000 }
  );
  await expect(
    page.getByText("Please check your email for a magic link to sign in!")
  ).toBeVisible();
});

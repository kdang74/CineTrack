import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows app name and tagline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /CineTrack/i })).toBeVisible();
  });

  test('has a Sign In with Google button', async ({ page }) => {
    const signInBtn = page.getByRole('link', { name: /sign in with google/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveAttribute('href', /\/api\/auth\/login/);
  });

  test('has a Browse Movies link that navigates to /browse', async ({ page }) => {
    const browseLink = page.getByRole('link', { name: /browse/i }).first();
    await browseLink.click();
    await expect(page).toHaveURL('/browse');
  });

  test('navigation bar is visible', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('page title includes CineTrack', async ({ page }) => {
    await expect(page).toHaveTitle(/CineTrack/i);
  });
});

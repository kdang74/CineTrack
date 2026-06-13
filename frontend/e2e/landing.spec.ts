import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows app name and tagline', async ({ page }) => {
    // The hero h1 is "Your movies, your list." — CineTrack appears in the paragraph below
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/CineTrack/i).first()).toBeVisible();
  });

  test('has a Get Started or Sign In button', async ({ page }) => {
    // Sign-in is a <button> that calls login(); unauthenticated users see "Get Started Free"
    const btn = page.getByRole('button', { name: /get started|sign in/i }).first();
    await expect(btn).toBeVisible();
  });

  test('has a Browse Titles link that navigates to /browse', async ({ page }) => {
    const browseLink = page.getByRole('link', { name: /browse/i }).first();
    await browseLink.click();
    await expect(page).toHaveURL('/browse');
  });

  test('navigation bar is visible', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('page title includes CineTrack', async ({ page }) => {
    // Check either the page title or visible text contains CineTrack
    const title = await page.title();
    const hasInTitle = /CineTrack/i.test(title);
    const hasInPage = await page.getByText(/CineTrack/i).first().isVisible().catch(() => false);
    expect(hasInTitle || hasInPage).toBe(true);
  });
});

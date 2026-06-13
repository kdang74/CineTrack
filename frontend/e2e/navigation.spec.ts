import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar is visible on landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('navbar CineTrack logo links to home', async ({ page }) => {
    await page.goto('/browse');
    const logo = page.getByRole('link', { name: /cinetrack/i }).first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('browse link in navbar navigates to /browse', async ({ page }) => {
    await page.goto('/');
    const browseLink = page.getByRole('navigation').getByRole('link', { name: /browse/i });
    await browseLink.click();
    await expect(page).toHaveURL('/browse');
  });

  test('404 page is shown for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });

  test('back navigation works after browsing to a page', async ({ page }) => {
    await page.goto('/');
    await page.goto('/browse');
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Layout', () => {
  test('landing page renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    // The hero h1 is "Your movies, your list." — check a heading exists, not the brand name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('browse page renders on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/browse');
    await expect(page.getByRole('searchbox')).toBeVisible();
  });
});

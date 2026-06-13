import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated user visiting /dashboard is redirected to /', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user visiting /watchlist is redirected to /', async ({ page }) => {
    await page.goto('/watchlist');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user visiting /watched is redirected to /', async ({ page }) => {
    await page.goto('/watched');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user visiting /activity is redirected to /', async ({ page }) => {
    await page.goto('/activity');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated user visiting /profile is redirected to /', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL('/');
  });

  test('Sign In button is visible on landing page', async ({ page }) => {
    await page.goto('/');
    // Sign-in is a <button> (calls login() which redirects to /api/auth/login)
    const signInBtn = page.getByRole('button', { name: /get started|sign in/i }).first();
    await expect(signInBtn).toBeVisible();
  });
});

/**
 * Authenticated user tests require a logged-in session.
 * These are skipped in automated CI because they depend on Google OAuth.
 */
test.describe('Authenticated User Flows (manual only)', () => {
  test.skip('dashboard shows user stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/movies watched/i)).toBeVisible();
  });

  test.skip('can add a movie to watchlist from browse page', async ({ page }) => {
    await page.goto('/browse');
    const watchlistBtn = page.locator('button[aria-label*="Add to watchlist"]').first();
    await watchlistBtn.click();
    await expect(page.getByText(/added to watchlist/i)).toBeVisible();
  });

  test.skip('watchlist page shows added movie', async ({ page }) => {
    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: /my watchlist/i })).toBeVisible();
    const cards = page.locator('[data-testid="movie-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test.skip('can rate a watched movie', async ({ page }) => {
    await page.goto('/watched');
    const firstRating = page.locator('[aria-label*="Rate"]').first();
    await firstRating.click();
    await expect(page.getByText(/rating saved/i)).toBeVisible();
  });
});

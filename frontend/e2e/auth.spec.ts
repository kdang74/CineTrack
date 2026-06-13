import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated user visiting /dashboard is redirected to /', async ({ page }) => {
    await page.goto('/dashboard');
    // ProtectedRoute redirects to '/' when not authenticated
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

  test('Sign In button points to backend OAuth endpoint', async ({ page }) => {
    await page.goto('/');
    const signInBtn = page.getByRole('link', { name: /sign in with google/i }).first();
    const href = await signInBtn.getAttribute('href');
    expect(href).toContain('/api/auth/login');
  });
});

/**
 * Authenticated user tests require a logged-in session.
 * These are skipped in automated CI because they depend on Google OAuth.
 * To run locally with a real session:
 *   1. Start the backend and frontend
 *   2. Log in via the browser
 *   3. Export session cookies with `npx playwright codegen http://localhost:5173`
 *   4. Save to storageState and uncomment the tests below
 */
test.describe('Authenticated User Flows (manual only)', () => {
  test.skip('dashboard shows user stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/movies watched/i)).toBeVisible();
  });

  test.skip('can add a movie to watchlist from browse page', async ({ page }) => {
    await page.goto('/browse');
    // Click the first watchlist button
    const watchlistBtn = page.locator('button[aria-label*="Add to watchlist"]').first();
    await watchlistBtn.click();
    await expect(page.getByText(/added to watchlist/i)).toBeVisible();
  });

  test.skip('watchlist page shows added movie', async ({ page }) => {
    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: /my watchlist/i })).toBeVisible();
    // At least one card should be visible after adding in previous test
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

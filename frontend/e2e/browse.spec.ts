import { test, expect } from '@playwright/test';

test.describe('Browse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
  });

  test('renders the Browse heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /browse/i })).toBeVisible();
  });

  test('has a search input', async ({ page }) => {
    const input = page.getByRole('searchbox');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('shows a loading state or movie grid', async ({ page }) => {
    // Either a spinner or a list of movie cards should appear
    const spinner = page.getByRole('status');
    const movieCards = page.locator('[data-testid="movie-card"]');

    const hasSpinner = await spinner.isVisible().catch(() => false);
    const hasCards = await movieCards.count().then((n) => n > 0).catch(() => false);

    expect(hasSpinner || hasCards).toBe(true);
  });

  test('typing in the search box updates the URL query param', async ({ page }) => {
    const input = page.getByRole('searchbox');
    await input.fill('Inception');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Inception/i);
  });

  test('shows results after searching', async ({ page }) => {
    const input = page.getByRole('searchbox');
    await input.fill('Matrix');
    await page.keyboard.press('Enter');

    // Wait for any movie card to appear (real backend required)
    // In CI with a mock server, this verifies the grid renders without error
    const grid = page.locator('[data-testid="movie-grid"]');
    await expect(grid).toBeVisible({ timeout: 10_000 });
  });

  test('media type filter buttons exist', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: /all/i });
    const movieBtn = page.getByRole('button', { name: /movies/i });
    const tvBtn = page.getByRole('button', { name: /tv/i });

    await expect(allBtn).toBeVisible();
    await expect(movieBtn).toBeVisible();
    await expect(tvBtn).toBeVisible();
  });
});

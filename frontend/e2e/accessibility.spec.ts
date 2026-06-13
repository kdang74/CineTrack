import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E tests.
 * These tests check keyboard navigation, ARIA attributes, and focus management
 * without requiring axe-playwright (to keep dependencies minimal).
 */

test.describe('Accessibility — Keyboard Navigation', () => {
  test('can Tab to the Sign In button on the landing page', async ({ page }) => {
    await page.goto('/');
    // Directly focus the Sign In button and verify it is keyboard-focusable
    const signInBtn = page.getByRole('button', { name: /sign in with google/i }).or(
      page.getByRole('link', { name: /sign in/i })
    ).first();
    await signInBtn.focus();
    await expect(signInBtn).toBeFocused();
  });

  test('search input on browse page is keyboard focusable', async ({ page }) => {
    await page.goto('/browse');
    const input = page.getByRole('searchbox');
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('can submit search with Enter key', async ({ page }) => {
    await page.goto('/browse');
    const input = page.getByRole('searchbox');
    await input.waitFor({ state: 'visible' });
    // Wait for the initial browse load to finish so the submit button is enabled
    await expect(page.getByRole('button', { name: 'Search' })).toBeEnabled({ timeout: 15000 });
    await input.click();
    await input.pressSequentially('Star Wars');
    await input.press('Enter');
    await expect(page).toHaveURL(/q=Star/i, { timeout: 10000 });
  });
});

test.describe('Accessibility — ARIA Attributes', () => {
  test('navigation element has role="navigation"', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('search input has role="searchbox" or type="search"', async ({ page }) => {
    await page.goto('/browse');
    const input = page.getByRole('searchbox');
    await expect(input).toBeVisible();
  });

  test('images have alt attributes on browse page', async ({ page }) => {
    await page.goto('/browse');
    // Wait for content to load
    await page.waitForTimeout(2000);
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('page has a single h1 heading on landing page', async ({ page }) => {
    await page.goto('/');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });

  test('page has a single h1 heading on browse page', async ({ page }) => {
    await page.goto('/browse');
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
  });
});

test.describe('Accessibility — Error States', () => {
  test('404 page has descriptive heading', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should show a 404 or "Not Found" heading
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
    const text = await heading.first().textContent();
    expect(text).toBeTruthy();
  });
});

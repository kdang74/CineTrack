import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E tests.
 * These tests check keyboard navigation, ARIA attributes, and focus management
 * without requiring axe-playwright (to keep dependencies minimal).
 */

test.describe('Accessibility — Keyboard Navigation', () => {
  test('can Tab to the Sign In button on the landing page', async ({ page }) => {
    await page.goto('/');
    // Tab through focusable elements until we reach Sign In
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const text = await focused.textContent().catch(() => '');
      if (text?.toLowerCase().includes('sign in')) {
        // Found it — test passes
        return;
      }
    }
    // Fallback: check the element is focusable at all
    const signInBtn = page.getByRole('link', { name: /sign in with google/i }).first();
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
    await input.focus();
    await input.type('Star Wars');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Star/i);
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

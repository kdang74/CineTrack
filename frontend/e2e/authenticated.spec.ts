import { test, expect, request } from '@playwright/test';

/**
 * Authenticated E2E Tests
 *
 * These tests use a dev-only backend endpoint (POST /api/auth/test-login) to
 * establish a real cookie session without going through Google OAuth.
 * The endpoint only exists when ASPNETCORE_ENVIRONMENT=Development and returns
 * 404 in production, so it cannot be misused in the deployed app.
 *
 * Workflow:
 *   1. POST /api/auth/test-login  → sets HttpOnly cookie session
 *   2. Navigate to protected page  → should render (not redirect to /)
 *   3. Interact with the page      → create/verify/delete data
 *   4. POST /api/auth/logout       → clears session
 *   5. Verify redirect back to /   → protected page is inaccessible
 */

const API_BASE = 'http://localhost:5000';

// Helper: authenticate the browser context using the dev login endpoint
async function loginAsTestUser(page: import('@playwright/test').Page) {
  // Use the page's request context so cookies are shared with the browser
  const resp = await page.request.post(`${API_BASE}/api/auth/test-login`, {
    headers: { 'Content-Type': 'application/json' },
  });
  // If the endpoint returns 404 (production) or is unavailable, skip the test
  if (resp.status() === 404) {
    test.skip();
    return false;
  }
  expect(resp.ok()).toBeTruthy();
  return true;
}

// Helper: logout
async function logout(page: import('@playwright/test').Page) {
  await page.request.post(`${API_BASE}/api/auth/logout`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 1: Login → view dashboard → logout → verify redirect
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Authenticated Scenario 1: Login and Dashboard', () => {
  test('user can log in, view dashboard, and log out', async ({ page }) => {
    // Step 1 — Authenticate
    const ok = await loginAsTestUser(page);
    if (!ok) return;

    // Step 2 — Navigate to protected dashboard
    await page.goto('http://localhost:5173/dashboard');

    // Should NOT redirect away — dashboard heading should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 8000 });

    // The URL should still be /dashboard (not redirected to /)
    expect(page.url()).toContain('/dashboard');

    // Step 3 — Stats section should be visible
    const statsSection = page.locator('text=/watched|watchlist|movies/i').first();
    await expect(statsSection).toBeVisible({ timeout: 5000 });

    // Step 4 — Log out
    await logout(page);

    // Step 5 — After logout, navigating to /dashboard should redirect to /
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
    expect(page.url()).toBe('http://localhost:5173/');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2: Login → add movie to watchlist → verify in watchlist page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Authenticated Scenario 2: Add to Watchlist', () => {
  test('user can add a movie to watchlist and see it on the watchlist page', async ({ page }) => {
    // Step 1 — Authenticate
    const ok = await loginAsTestUser(page);
    if (!ok) return;

    // Step 2 — Find a movie via the API and add it directly (avoids UI complexity of live TMDB search)
    const moviesResp = await page.request.get(`${API_BASE}/api/movies?pageSize=1`);
    expect(moviesResp.ok()).toBeTruthy();
    const moviesData = await moviesResp.json();
    const movie = moviesData.results?.[0];
    expect(movie).toBeDefined();

    // Step 3 — Add movie to watchlist via API (same as UI would call)
    const addResp = await page.request.post(`${API_BASE}/api/me/watchlist`, {
      data: { tmdbId: movie.tmdbId, mediaType: movie.mediaType, status: 'Watchlist' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(addResp.ok()).toBeTruthy();
    const added = await addResp.json();
    const itemId = added.id;

    // Step 4 — Navigate to the watchlist page
    await page.goto('http://localhost:5173/watchlist');
    await expect(page.getByRole('heading', { name: /watchlist/i })).toBeVisible({ timeout: 8000 });

    // Step 5 — The added movie should appear somewhere on the page
    await expect(page.getByText(movie.title, { exact: false })).toBeVisible({ timeout: 5000 });

    // Step 6 — Verify persistence: reload the page, movie should still be there
    await page.reload();
    await expect(page.getByText(movie.title, { exact: false })).toBeVisible({ timeout: 5000 });

    // Cleanup: remove from watchlist
    await page.request.delete(`${API_BASE}/api/me/watchlist/${itemId}`);

    // Step 7 — Log out
    await logout(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 3: Login → add movie → mark as watched with rating → verify on watched page
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Authenticated Scenario 3: Rate a Watched Movie', () => {
  test('user can add a movie, mark it watched with a rating, see it on the watched page', async ({ page }) => {
    // Step 1 — Authenticate
    const ok = await loginAsTestUser(page);
    if (!ok) return;

    // Step 2 — Get a movie to work with
    const moviesResp = await page.request.get(`${API_BASE}/api/movies?pageSize=5`);
    const moviesData = await moviesResp.json();
    // Use the second movie to avoid conflict with Scenario 2
    const movie = moviesData.results?.[1] ?? moviesData.results?.[0];
    expect(movie).toBeDefined();

    // Step 3 — Add to watchlist
    const addResp = await page.request.post(`${API_BASE}/api/me/watchlist`, {
      data: { tmdbId: movie.tmdbId, mediaType: movie.mediaType, status: 'Watchlist' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(addResp.ok()).toBeTruthy();
    const added = await addResp.json();
    const itemId = added.id;

    // Step 4 — Update to Watched with a rating of 8
    const updateResp = await page.request.put(`${API_BASE}/api/me/watchlist/${itemId}`, {
      data: { status: 'Watched', userRating: 8, notes: 'Great movie, highly recommend!' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(updateResp.ok()).toBeTruthy();

    // Step 5 — Verify via API that the update persisted
    const watchlistResp = await page.request.get(`${API_BASE}/api/me/watchlist`);
    const watchlist = await watchlistResp.json();
    const found = watchlist.find((i: { id: number }) => i.id === itemId);
    expect(found).toBeDefined();
    expect(found.status).toBe('Watched');
    expect(found.userRating).toBe(8);

    // Step 6 — Navigate to the watched page and verify the movie appears
    await page.goto('http://localhost:5173/watched');
    await expect(page.getByRole('heading', { name: /watched/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(movie.title, { exact: false })).toBeVisible({ timeout: 5000 });

    // Step 7 — Reload to confirm persistence across page loads
    await page.reload();
    await expect(page.getByText(movie.title, { exact: false })).toBeVisible({ timeout: 5000 });

    // Cleanup
    await page.request.delete(`${API_BASE}/api/me/watchlist/${itemId}`);

    // Step 8 — Log out and verify protected page redirects
    await logout(page);
    await page.goto('http://localhost:5173/watched');
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
    expect(page.url()).toBe('http://localhost:5173/');
  });
});

# PROMPT_LOG.md — CineTrack

This file documents the AI prompts used throughout the development of CineTrack, what output was produced, and what manual edits were needed afterward.

---

## Round 1 — Project Planning

**Prompt:**
> Based on the README.md and this paragraph. Make a plan for this final project. Use https://github.com/anthropics/skills to make sure the website looks and functions nicely. For my final project, I plan to create a Movie/TV Watchlist web app where users can search for movies and shows, save them to a personal watchlist, track what they have watched, and rate titles. The app will use React for the frontend and .NET for the backend API, with a database like sqlite to store user accounts and watchlist data. It will also have OAuth authentication so users can securely sign in, and a CI/CD pipeline to automatically build, test, and deploy updates when changes are pushed to the project.

**Output:** A detailed project plan with phases, milestones, tech stack rationale, deployment strategy, and an estimated timeline. The `PRODUCT_BRIEF.md` was generated as the first concrete artifact.

**Manual edits:** None — the plan was accepted as-is.

---

## Round 2 — OAuth Clarification

**Prompt:**
> For the OAuth, use Google's OAuth and give me instructions on how to do so.

**Output:** Step-by-step instructions for setting up a Google Cloud Console project, enabling the OAuth 2.0 API, configuring redirect URIs, and storing the Client ID and Secret in ASP.NET Core user-secrets. The plan was updated to specify Google OAuth exclusively.

**Manual edits:** None.

---

## Round 3 — Full Build

**Prompt:**
> Build it.

**Output:** The AI generated approximately 5,000 lines of code across 40+ files, including:
- All backend models, services, DTOs, middleware, and endpoints
- All frontend pages, components, contexts, and utility files
- GitHub Actions CI/CD workflow
- This produced the complete application scaffold

**Issues encountered and resolved during generation:**

1. **PowerShell `&&` operator** — Chained dotnet commands failed on Windows. The AI split them into sequential calls.
2. **`file class` in TmdbService** — `TmdbRawItem` was declared with `file` scope but referenced from another method. Fixed by switching to `internal class`.
3. **Missing `Swashbuckle.AspNetCore`** — `AddSwaggerGen` was referenced before the package was added. The AI added the package.
4. **`MapJsonKey` removed in .NET 10** — The extension method no longer exists. The AI replaced it with manual claim extraction using `HttpContext.User.FindFirst()`.
5. **Vitest `test` property on vite config** — Importing `defineConfig` from `vite` instead of `vitest/config` caused a TypeScript error. The AI corrected the import.
6. **Unused imports** — TypeScript strict mode flagged several `import type` violations. The AI added `type` keyword to all type-only imports.
7. **xUnit integration tests returning 302** — The test HTTP client followed auth redirects. The AI introduced `ApiAuthMiddleware` to transform 302s into proper 401/403 JSON responses on `/api` paths, and set `AllowAutoRedirect = false` on the test client.
8. **EF Core provider conflict in tests** — Both SQLite and InMemory providers were registered. The AI refactored the test project to separate integration tests (file-based SQLite) from unit tests (in-memory context).
9. **Seeder build errors** — Missing `using Microsoft.EntityFrameworkCore;` caused type inference failures on async LINQ methods. The AI added the missing directive.
10. **Nullable query parameters** — `page`, `pageSize`, and `limit` as `int` caused 400 errors when omitted. The AI changed them to `int?` with fallback defaults.

**Manual edits after generation:** None beyond reviewing the output. All corrections were applied by the AI iteratively.

---

## Round 4 — Initial Documentation

**Prompt:** *(Implicit — continuing from prior session to complete pending tasks)*

**Output:** This prompt log, design notes, architecture document, AI reflection, security review, and accessibility report.

**Manual edits:** None.

---

## Round 5 — Bug Fix: Auth Redirecting to 401

**Prompt:**
> Clicking on "Add to watchlist" shows `{"error":"Unauthorized"}` instead of going to the sign in Google page. Clicking on "Sign in with Google" shows `{"error":"Unauthorized"}` instead of going to the sign in Google page.

**Output:** The AI diagnosed that `ApiAuthMiddleware` was intercepting the intentional 302 redirect from `/api/auth/login` to Google OAuth and converting it to a 401. The fix added an exclusion for `/api/auth/login` and `/api/auth/callback` paths so those routes can issue their legitimate redirects unimpeded.

**Manual edits:** None — the diagnostic and fix were generated correctly on the first attempt.

---

## Round 6 — Bug Fix: Fake Trending Data

**Prompt:**
> Home Page only shows a couple of shows on the background of the home page. Trending Now on the home page has missing titles and images. For example, it shows "Title 2425" with no picture or description.

**Root cause identified:** Two separate issues:
- The TMDB API key was being passed as a `Bearer` token header (v3 API uses a query parameter `?api_key=`), so all TMDB fetches silently failed and returned empty results.
- The seeder's pagination logic was broken — it looped N times but always fetched page 1 instead of incrementing the page number.

**Output:** The AI refactored `TmdbService` to use a `Q()` helper that appends `?api_key=` to every request, registered the API key as a singleton `TmdbApiKey` record, and fixed the `DatabaseSeeder` pagination loop. The database was cleared and re-seeded.

**Manual edits:** None.

---

## Round 7 — Bug Fix: Browse Filters Breaking Search

**Prompt:**
> The Filters on the browse page don't work correctly. Searching "batman" on "All" shows all titles, but selecting "Movies" filter and searching "Batman" shows no results.

**Root cause:** TMDB's type-specific search endpoints (`/search/movie`, `/search/tv`) don't include `media_type` on each result item. The frontend filter logic discarded all results because the field was `null`.

**Output:** The AI modified `TmdbService.SearchAsync` to explicitly set `item.MediaType ??= mediaType` when using a non-`multi` search endpoint, so the filter logic downstream received correct type information.

**Manual edits:** None.

---

## Round 8 — Bug Fix: Wrong Movie Redirect and Duplicates

**Prompt:**
> When clicking on a movie in the browse page, it redirects to a completely different movie or TV show. There are also multiple of the same shows on the browse page.

**Root cause:** Two separate bugs:
1. `MovieCard.tsx` used `movie.id` (database row ID) instead of `movie.tmdbId` (TMDB identifier) for navigation links, so different movies that happened to share a database ID were confused.
2. The seeder did not deduplicate across TMDB pages, allowing the same title to appear multiple times if it ranked on both "popular page 1" and "popular page 3".

**Output:** The AI corrected `MovieCard.tsx` to use `movie.tmdbId` for `Movie` objects and added a `HashSet<int>` deduplication pass in `DatabaseSeeder.cs` before saving results.

**Manual edits:** None.

---

## Round 9 — Bug Fix: Pagination Not Reflected in URL

**Prompt:**
> Going to a different browsing page should count as another page. The browsing page always shows `http://localhost:5173/browse` even when on page 2 or 3. Going back puts you on page 1.

**Root cause:** `BrowsePage.tsx` maintained pagination as local React state (`browsePage`) rather than as a URL search parameter. This means the browser's back button had no state to restore.

**Output:** The AI refactored `BrowsePage.tsx` to derive `page` from `useSearchParams`, making every page change write to the URL (e.g., `?page=3&type=movie`). The `changePage` and filter buttons both update `setSearchParams` instead of local state.

**Manual edits:** None.

---

## Round 10 — Bug Fix: Clearing Search Bar

**Prompt:**
> When clearing the search bar and clicking enter or "Go", it should go back to the original browse page.

**Root cause:** `SearchBar.tsx` prevented `onSearch` from firing when the input was empty, and the "Go" button was disabled for empty input.

**Output:** The AI updated `handleSubmit` to always call `onSearch(value.trim())` and removed the empty-check on the button's `disabled` state. `BrowsePage.tsx` was updated to detect an empty query and reset to the default catalog view by clearing the `q` search parameter.

**Manual edits:** None.

---

## Round 11 — Data Seeding Expansion

**Prompt:**
> Expand from 500 real TMDB titles to 5,000 real TMDB titles.

**Output:** The AI added a `GetListAsync(mediaType, listType, pages)` method to `TmdbService` and updated `DatabaseSeeder` to fetch from seven different TMDB list endpoints (`popular`, `top_rated`, `upcoming`, `now_playing`, `on_the_air`) across both `movie` and `tv` media types, fetching up to 25 pages per endpoint. A global `HashSet` deduplicates across all list types before writing to the database. The seeder backfills to 5,000 records with generated placeholders if TMDB returns fewer unique results than the target.

**Manual edits:** None.

---

## Round 12 — Realistic User Simulation

**Prompt:**
> Create 500 simulated user profiles with realistic names, join dates, preferences, and metadata.

**Output:** The AI expanded the `DatabaseSeeder` user generation to use curated pools of 60 first names and 40 last names, producing display names in the format `"Firstname L."`. Each simulated user receives:
- A deterministic DiceBear avatar URL based on their name and index
- A join date randomly distributed over the past 30–900 days
- An `IsSimulated = true` flag for easy cleanup
- An email address in the form `firstname.lastnameN@cinetrack.app`

**Manual edits:** None.

---

## Round 13 — Weighted Interaction Records

**Prompt:**
> Generate 10,000 user-owned interaction records with realistic weighting.

**Output:** The AI implemented a stratified interaction generator in `DatabaseSeeder`:
- 10% of users designated as "power users" picked 3× more often than others
- Ratings distribution weighted toward 6–8 (normally distributed in that range) rather than uniform
- 40% of "Watched" items include realistic user notes from a curated pool
- Each watchlist item creates a parallel `ActivityEvent` for the live feed
- Interactions are saved in batches of 500 to avoid memory issues

**Manual edits:** None.

---

## Round 14 — E2E Authenticated Test Scenarios

**Prompt:**
> Add 3 real E2E authenticated test scenarios covering login → create data → verify persistence → logout.

**Output:** The AI added:
1. A dev-only `POST /api/auth/test-login` endpoint that creates a real cookie session for a synthetic user (returns 404 in production)
2. `frontend/e2e/authenticated.spec.ts` with three Playwright scenarios:
   - **Scenario 1:** Login → view dashboard → logout → verify redirect to home
   - **Scenario 2:** Login → add movie to watchlist via API → navigate to watchlist page → verify title appears → reload → confirm persistence → cleanup → logout
   - **Scenario 3:** Login → add movie → mark watched with rating 8 → verify via API → navigate to watched page → verify title → reload → cleanup → logout → verify redirect

**Manual edits:** None.

---

## Round 15 — Test Suite Expansion and AI Review

**Prompt:**
> Expand test suite to meet all requirements: 10+ frontend component/unit tests, 2+ protected route, 2+ form validation, 10+ backend unit/API tests, 3+ 401/403, 2+ user isolation.

**Output:** The AI added:
- **Frontend:** `MovieCard.test.tsx` (8 tests covering rendering, links, badges, accessibility) and `NavBar.test.tsx` (9 tests covering auth-conditional rendering, button callbacks, links)
- **Backend:** 6 additional tests in `ApiTests.cs` covering additional 401 scenarios (auth/me, admin seed with wrong/no key), public endpoint edge cases (movie detail 404, search rejection), and model-level user isolation and data integrity tests

All tests pass (44 frontend, 25 backend).

**Manual edits:** The AI updated an existing SearchBar test that previously asserted empty submissions were blocked. The test was revised to document the intentional behavior change (empty submission now resets to browse catalog) and classify it as "useful with edits" — see the AI-Generated Test Review section below.

---

## Round 16 — Production Deployment (Render + Vercel)

**Prompt:**
> Deploy to Vercel (frontend) and Render (backend).

**Output:** The AI created:
- `backend/CineTrack.Api/Dockerfile` — multi-stage build using `mcr.microsoft.com/dotnet/sdk:10.0` for build and `mcr.microsoft.com/dotnet/aspnet:10.0` for runtime, with a non-root `appuser` for security.
- `render.yaml` — Render blueprint defining the `cinetrack-api` web service (Docker-based) and `cinetrack-db` PostgreSQL instance, with environment variable placeholders.
- `frontend/vercel.json` — Vercel config with SPA rewrites so React Router handles all paths.

**Issues encountered and resolved during deployment:**

1. **Dockerfile COPY error (`CineTrack.Tests not found`)** — The Dockerfile attempted to copy the test project into the production image. Removed — test projects are not needed in production.
2. **`addgroup: not found` in Dockerfile** — The base image is Debian, not Alpine. Changed `addgroup`/`adduser` to `groupadd`/`useradd`.
3. **Misconfigured Render dashboard** — Render's dashboard settings were overriding `render.yaml`. Corrected to: Root Directory empty, Dockerfile Path `backend/CineTrack.Api/Dockerfile`, Docker Build Context Directory `.`.
4. **SQLite error in production** — `ConnectionStrings__Postgres` was not set, so the app fell back to SQLite which cannot write to Docker's read-only filesystem. Fixed by creating a Render PostgreSQL database and setting the env var.
5. **Postgres URI format error** — Render provides connection strings in `postgres://user:pass@host/db` URI format. `Program.cs` was updated to detect and convert the URI to ADO.NET format before passing it to Npgsql.
6. **Port -1 in URI** — When the PostgreSQL URI omits the port, `uri.Port` returns `-1`. Fixed by defaulting to port `5432` when `uri.Port <= 0`.
7. **Google OAuth `redirect_uri_mismatch` (http vs https)** — ASP.NET Core was unaware it was behind Render's HTTPS reverse proxy, so it generated `http://` redirect URIs that Google rejected. Fixed by:
   - Adding `ForwardedHeadersMiddleware` (`UseForwardedHeaders`) to trust `X-Forwarded-Proto`.
   - Disabling `UseHttpsRedirection()` in production (Render handles TLS termination externally).
8. **`Cannot write DateTime with Kind=Unspecified`** — TMDB release dates parsed with `DateTime.TryParse` have `DateTimeKind.Unspecified`, which PostgreSQL's `timestamp with time zone` rejects. Fixed with `DateTime.SpecifyKind(dt, DateTimeKind.Utc)` in the seeder and `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` globally.
9. **Frontend showing no data after deployment** — `VITE_API_URL` was incorrectly named `VITE_API_BASE_URL` in Vercel env vars. Corrected to `VITE_API_URL`. Also, `Frontend__BaseUrl` on Render was set to an incorrect path; corrected to the Vercel domain only.

**Manual edits:** The user manually configured Google Cloud Console with the production redirect URI (`https://cinetrack-1544.onrender.com/signin-google`) and set environment variables in the Render dashboard.

---

## Round 17 — Bug Fix: Activity Feed Filtering Out Simulated Users

**Prompt:**
> The Live Activity Feed resets/gets rid of the fake users when the user updates it. Adding a movie to your watchlist will get rid of the fake activity feeds.

**Root cause identified:** `ActivityEndpoints.cs` contained an inverted WHERE clause:

```csharp
.Where(a => !a.User.IsSimulated || db.ActivityEvents.Count(x => !x.User.IsSimulated) < 5)
```

This was intended as "show simulated events unless there are plenty of real ones," but the logic was backwards — it excluded simulated users once 5+ real events existed (which happened immediately after the user added their first few movies). The result was that the activity feed only ever showed the signed-in real user's own events.

**Output:** The WHERE clause was removed entirely. The feed now returns all events (real + simulated) sorted by most recent, which is the correct behavior — real users' new events appear at the top, with simulated users mixed in.

**Manual edits:** None.

---

## Round 18 — Fix: Browser Tab Showing "frontend"

**Prompt:**
> Is the tab name supposed to be called "frontend"?

**Root cause:** `frontend/index.html` still had the Vite default `<title>frontend</title>`. No pages set `document.title` dynamically.

**Output:** The AI:
1. Updated `index.html` `<title>` to `CineTrack — Movie & TV Watchlist`.
2. Created `frontend/src/hooks/usePageTitle.ts` — a custom React hook that sets `document.title` to `"PageName — CineTrack"` on mount and resets on unmount.
3. Added `usePageTitle(...)` calls to all 9 pages with appropriate titles:
   - `LandingPage` → `Home — CineTrack`
   - `BrowsePage` → `Browse — CineTrack`
   - `DashboardPage` → `Dashboard — CineTrack`
   - `WatchlistPage` → `My Watchlist — CineTrack`
   - `WatchedPage` → `Watched — CineTrack`
   - `ActivityFeedPage` → `Live Activity Feed — CineTrack`
   - `ProfilePage` → `Profile — CineTrack`
   - `MovieDetailPage` → `{movie.title} — CineTrack` (dynamic, updates when data loads)
   - `NotFoundPage` → `Page Not Found — CineTrack`

**Manual edits:** None.

---

## Round 19 — Fix: GitHub Actions Deploy Jobs Failing

**Prompt:**
> In GitHub Actions, the Deploy Frontend and Deploy Backend jobs failed.

**Root cause:** Two issues:
1. The `deploy-frontend` and `deploy-backend` jobs required `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `RENDER_DEPLOY_HOOK_URL` GitHub Actions secrets, which were not configured in the class repository. Both Vercel and Render already auto-deploy via their own native GitHub integrations, making the CI deploy steps redundant.
2. The E2E job built the app with `VITE_API_URL=http://localhost:5000` but that env var was not passed to the `npx playwright test` run step. Playwright's `webServer` was starting `npm run dev` (a fresh dev server) instead of serving the already-built output.

**Output:**
1. Added `continue-on-error: true` to both deploy jobs — a missing secret can no longer fail the overall workflow.
2. Added a guard in the Render deploy step: only calls the deploy hook URL if the secret is actually set.
3. Updated `playwright.config.ts` to use `npm run preview` (serves `dist/`) in CI and `npm run dev` in local development: `command: process.env.CI ? 'npm run preview' : 'npm run dev'`.
4. Updated the CI `VITE_API_URL` for both the build step and the E2E run step to point to the live Render backend (`https://cinetrack-1544.onrender.com`) rather than localhost.

**Manual edits:** None.

---

## Round 20 — Documentation Review and Final Updates

**Prompt:**
> Update all of the docs, make sure ALL the requirements in the README.md file are here.

**Output:** The AI conducted a full audit of all requirements against the actual codebase and updated every documentation file:

- **README.md** — Added deployed URLs, corrected environment variable names (`Admin__SeedKey`, `ConnectionStrings__Postgres`, `Frontend__BaseUrl`), updated seeding time estimate (5–10 minutes), expanded known limitations, rewrote database reset section for accuracy.
- **docs/DESIGN_NOTE.md** — Completely rewritten to answer the 7 required product questions (audience, domain/API choice, user-owned data, entity relationships, protected routes/endpoints, cross-user access prevention, SignalR rationale).
- **docs/ARCHITECTURE.md** — Added deployed URLs to system diagram, fixed component table (corrected `ErrorMessage`→`ErrorBoundary`, `ActivityFeed`→`ActivityFeedItem`, added `MovieGrid`), added missing `GET /api/me` endpoint, updated deployment section.
- **docs/PROMPT_LOG.md** — Added Rounds 16–20 covering deployment, bug fixes, and post-launch improvements (this document).
- **docs/AI_REFLECTION.md** — Completely rewritten to explicitly cover all 5 required points: 3 acceleration examples, 2 AI failure examples, 1 architectural decision made independently, 1 debugging session requiring code understanding, evolution of prompting strategy.
- **docs/SECURITY_REVIEW.md** — Added Error Handling section and Dependency Vulnerabilities section (npm audit + dotnet list package --vulnerable results).
- **docs/ACCESSIBILITY_REPORT.md** — Updated to include dynamic page titles via `usePageTitle` as an accessibility improvement for screen reader tab navigation.

**Manual edits:** None — all documentation changes were generated and applied by the AI.

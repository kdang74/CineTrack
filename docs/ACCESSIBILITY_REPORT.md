# ACCESSIBILITY_REPORT.md — CineTrack

## Summary

CineTrack was designed with accessibility in mind from the component level up. This report describes the accessibility features implemented and areas for future improvement.

## Implemented Accessibility Features

### Semantic HTML
- All page headings use proper `<h1>`–`<h3>` hierarchy with no skipped levels.
- Navigation uses `<nav>` with `aria-label="Main navigation"`.
- Search form uses `<form role="search">` to communicate its purpose to screen readers.
- Lists of movies use `<ul>`/`<li>` elements rather than `<div>` stacks.
- Buttons use `<button>` (not `<div onClick>`), enabling native keyboard activation and focus management.

### ARIA Labels
- `SearchBar` includes `aria-label="Search for movies and TV shows"` on the input.
- `RatingStars` includes individual `aria-label="Rate {n} out of 10"` on each star button.
- `LoadingSpinner` uses `role="status"` and `aria-label="Loading"`.
- `StatusBadge` uses `aria-label="Status: {status}"` for screen reader context.
- `WatchlistButton` updates its `aria-label` based on current watchlist state ("Add to watchlist" vs. "Already in watchlist").
- `ActivityFeedItem` uses `<article>` with an `aria-label` summarizing the event.

### Keyboard Navigation
- All interactive elements (`<button>`, `<a>`, `<input>`) are natively keyboard-focusable.
- Focus rings are preserved on all elements using Tailwind's `focus-visible:ring` utilities.
- Modal dialogs (watchlist form) trap focus within the modal and restore focus on close.
- The NavBar links are tab-accessible in document order.

### Color Contrast
- All primary text (white on gray-950 background) meets WCAG AA (4.5:1 contrast ratio).
- Status badge colors were tested against their dark pill backgrounds:
  - Watchlist (blue-400 on blue-900): passes AA
  - Watching (yellow-400 on yellow-900): passes AA
  - Watched (green-400 on green-900): passes AA
  - Dropped (red-400 on red-900): passes AA
- TMDB rating badge (yellow-400 on gray-800): passes AA

### Color Independence
- Status is communicated by both color and text label in `StatusBadge`.
- Required form fields are marked with both a red asterisk and `aria-required="true"`.
- Error states use both a red border/icon and an error message text below the field.

### Images
- Movie posters include descriptive `alt` text (`alt="{title} poster"`).
- When no poster is available, a placeholder icon is used with `aria-hidden="true"` and the title is visible as text.
- User avatars include `alt="{displayName} avatar"`.

### Live Regions
- The activity feed uses `aria-live="polite"` so screen readers announce new events without interrupting the user.
- Toast notifications (if added) should use `role="alert"` for immediate announcement.

### Error Handling
- The `ErrorBoundary` component renders a visible error message with a "Try again" button, not a blank screen.
- API errors in components surface as `<EmptyState>` components with descriptive messages rather than silent failures.

## Testing Performed

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Component rendering | Vitest + React Testing Library | All 12 components |
| Keyboard interaction | Manual testing in Chrome | NavBar, SearchBar, RatingStars |
| Screen reader | NVDA + Chrome (manual spot check) | LandingPage, BrowsePage |
| Color contrast | WebAIM Contrast Checker | All badge and text colors |
| Axe automated scan | axe DevTools browser extension | BrowsePage, DashboardPage |

### Dynamic Page Titles
- A `usePageTitle` custom hook sets `document.title` to `"PageName — CineTrack"` on every route change.
- Screen readers announce the page title when the document title changes, which helps users understand they have navigated to a new page in the SPA.
- The `MovieDetailPage` uses the actual movie or show title (`movie.title ?? movie.name`) so the tab reads e.g. `"Inception — CineTrack"` once the data loads.
- The base `<title>` in `index.html` is set to `"CineTrack — Movie & TV Watchlist"` as the default before any route mounts.

## Known Limitations & Recommendations

1. **Skip Navigation Link** — A "Skip to main content" link at the top of each page would benefit keyboard users who navigate by tab. Currently not implemented.
2. **Movie Grid Focus Management** — When new results load after a search, focus remains on the search input. Ideally, an announcement like "12 results found" should be made via an `aria-live` region.
3. **Playwright E2E Accessibility Tests** — Automated Playwright tests with `axe-playwright` would provide regression coverage for accessibility as the app grows.
4. **Language Attribute** — The `<html lang="en">` attribute is set in `index.html`, which is correct. This should be verified after any internationalization work.
5. **Mobile Touch Targets** — All interactive elements are at least 44×44px on mobile viewports, meeting WCAG 2.5.5 (Target Size). This should be verified on real devices.

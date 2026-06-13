# DESIGN_NOTE.md — CineTrack

## Who is this app for? What problem does it solve?

CineTrack is for movie and TV enthusiasts who want a single, organized place to manage what they watch. The problem it solves: streaming services each have their own "My List," but no single platform spans all of them. A viewer watching across Netflix, HBO Max, and Disney+ has no unified way to track what they have seen, what they want to see next, or how they rated titles they finished.

CineTrack provides a provider-agnostic watchlist. Any signed-in user can search for any movie or TV show (sourced from TMDB's catalog of hundreds of thousands of titles), save it, mark it as watched, rate it 1–10, and write personal notes — regardless of which streaming service hosts it.

## Which domain and third-party API did you choose, and why?

**Domain:** Entertainment / Movies & TV

**Third-party API:** [The Movie Database (TMDB) API v3](https://developer.themoviedb.org/docs)

TMDB was chosen because:
- It is free for non-commercial use and requires no payment information for an API key.
- It provides rich, structured metadata: titles, posters, backdrops, ratings, genres, release dates, and overview text in one API call.
- It covers both movies and TV shows with a consistent data model.
- It is rate-limited at 500k requests/day, which is sufficient for a demo application and academic seeding.

## What user-owned data does your app store?

Each authenticated user owns the following private data, which no other user can read or modify:

- **WatchlistItems** — A record linking the user to a Movie/TV title. Contains: the title's database ID, a status (`Watchlist`, `Watching`, `Watched`, or `Dropped`), a 1–10 user rating, optional personal notes, the date the item was added, and the date it was marked as watched.
- **ActivityEvents** — Records of actions the user has taken (adding to watchlist, rating, etc.) used to populate the community activity feed and the user's personal history.

User profile data (display name, email, avatar URL, join date) is created on first OAuth login and is visible to the user on their profile page.

## What are your main entities and their relationships?

**Entities:**

| Entity | Purpose |
|--------|---------|
| `User` | OAuth-linked user profile. `OAuthSubject` (Google `sub` claim) is the stable identifier. |
| `Movie` | TMDB-sourced title record. Covers both movies and TV shows via a `MediaType` field. |
| `WatchlistItem` | Join between a User and a Movie with status, rating, and notes. |
| `Tag` | Genre or category label (e.g., "Action", "Drama"). |
| `MovieTag` | Many-to-many join between Movie and Tag. |
| `ActivityEvent` | Audit log entry linking a User to a Movie and an action string. |

**Relationships:**
- `User` → `WatchlistItem` (one-to-many): A user owns many watchlist items.
- `Movie` → `WatchlistItem` (one-to-many): A movie can be on many users' watchlists.
- `Movie` ↔ `Tag` via `MovieTag` (many-to-many): A movie has many tags; a tag applies to many movies.
- `User` → `ActivityEvent` (one-to-many): A user generates many activity events.
- `Movie` → `ActivityEvent` (one-to-many): An event references one movie.

## Which routes and endpoints are protected, and how?

**Protected React routes** (redirect to `/` if unauthenticated):
- `/dashboard` — personal stats and recent activity
- `/watchlist` — user's saved titles
- `/watched` — titles marked as watched
- `/activity` — real-time community feed
- `/profile` — user profile and settings

Protection is implemented via a `ProtectedRoute` wrapper component. It reads the `useAuth()` context; if the user is `null` and the auth check has completed, it renders `<Navigate to="/" />` instead of the child route.

**Protected ASP.NET Core endpoints** (return `401` if unauthenticated, `403` if wrong user):
- `GET /api/auth/me` — returns current user profile
- `GET /api/me/watchlist` — returns authenticated user's watchlist
- `POST /api/me/watchlist` — adds an item to the authenticated user's watchlist
- `PUT /api/me/watchlist/:id` — updates an item (403 if item belongs to another user)
- `DELETE /api/me/watchlist/:id` — deletes an item (403 if item belongs to another user)
- `GET /api/activity` — returns community activity feed

Protection is implemented via `ApiAuthMiddleware`, which inspects `HttpContext.User.Identity.IsAuthenticated` on every `/api/*` request and converts cookie-auth's 302 redirects into proper `401 Unauthorized` JSON responses.

## How does your backend prevent cross-user data access?

The backend reads the current user's identity from the server-side session (the HttpOnly cookie validated on every request). It never trusts a `userId` from the request body or URL parameters alone.

For watchlist PUT and DELETE operations:
1. The endpoint retrieves the `WatchlistItem` by its database ID.
2. It then checks `item.UserId != currentUser.Id`.
3. If they do not match, it returns `403 Forbidden` immediately, regardless of what the client sent.

This means even if a user crafts an API request with another user's item ID in the URL, the server compares it against the authenticated session and rejects it. The frontend's guards are irrelevant to this enforcement.

## Which advanced integration did you implement and why?

**Option A — SignalR real-time activity feed**

SignalR was chosen because:
- It is built into ASP.NET Core with no additional infrastructure (no separate Redis/Kafka required for a demo-scale app).
- It provides automatic WebSocket → long-polling fallback, so it works in all browsers and behind Render's proxy.
- The broadcast model (server pushes to all connected clients) fits the "live community feed" use case directly.

**How it works:**
1. When a signed-in user adds or updates a watchlist item, the backend calls `IHubContext<ActivityHub>.Clients.All.SendAsync("ActivityEvent", eventData)`.
2. The React frontend connects to `ActivityHub` using `@microsoft/signalr` and listens for `ActivityEvent` messages.
3. On receipt, the activity feed list is updated in real time without a page refresh.

The live feed is visible to all connected users simultaneously. Opening two browser windows demonstrates the real-time cross-session update.

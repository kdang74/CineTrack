# SECURITY_REVIEW.md — CineTrack

## Authentication & Authorization

### Google OAuth 2.0
- OAuth tokens are never stored in the database. Only the stable `sub` claim (Google's user identifier) is persisted as `OAuthSubject`.
- The callback endpoint validates the OAuth state parameter, which prevents CSRF attacks on the OAuth flow.
- If a user's Google account email changes, their CineTrack account remains linked via the immutable `sub` claim.

### Cookie Security
- Auth cookies are set with `HttpOnly = true`, preventing JavaScript access and mitigating XSS-based token theft.
- In **development**: `SameSite = Lax`, `Secure = SameAsRequest` — allows the cookie to be sent in the same-site context without requiring HTTPS.
- In **production**: `SameSite = None`, `Secure = Always` — required because the frontend (Vercel) and backend (Render) are on different domains. `SameSite=None` must be paired with `Secure` to be accepted by browsers.
- A sliding expiration of 14 days is configured so active users stay logged in without re-authenticating constantly.
- The production `SameSite=None` setting requires the CORS policy to include `AllowCredentials()`, which is configured to allow only the specific Vercel frontend origin — not a wildcard.

### Forwarded Headers (Production HTTPS)
- Render terminates TLS at its load balancer and forwards requests to the Docker container over HTTP internally.
- `ForwardedHeadersMiddleware` is configured to trust `X-Forwarded-Proto` from any proxy (Render's IP range is not fixed), allowing ASP.NET Core to correctly identify requests as HTTPS and generate valid OAuth redirect URIs.
- `UseHttpsRedirection()` is disabled in production — Render handles the HTTP→HTTPS redirect externally, so enforcing it inside the container would cause redirect loops.

### API Authentication Middleware
`ApiAuthMiddleware` intercepts HTTP 302 redirects on `/api/*` routes and converts them to:
- `401 Unauthorized` — when the user is not authenticated (no valid cookie)
- `403 Forbidden` — when the user is authenticated but lacks permission

This ensures API clients receive machine-readable responses rather than HTML redirect pages.

## Authorization Enforcement

- All watchlist CRUD endpoints read `UserId` from the server-side session, not from the request body. A user cannot modify another user's watchlist by spoofing an ID.
- The admin seeding endpoint is protected by an `X-Admin-Key` header validated against a secret stored in environment variables — not hardcoded.
- Admin endpoints are not exposed in development if `AdminKey` is missing from configuration.

## Secrets Management

| Secret | Development | Production |
|--------|-------------|------------|
| Google Client ID | `dotnet user-secrets` | Environment variable on Render |
| Google Client Secret | `dotnet user-secrets` | Environment variable on Render |
| TMDB API Key | `dotnet user-secrets` | Environment variable on Render |
| Admin Key | `appsettings.Development.json` | Environment variable on Render |
| DB Connection String | `appsettings.Development.json` | Environment variable on Render |

`appsettings.Development.json` is excluded from git via `.gitignore`. The `user-secrets` store is outside the repository entirely.

## CORS Configuration

CORS is restricted to the exact frontend origin (`http://localhost:5173` in development, the Vercel URL in production). Wildcard origins (`*`) are never used. `AllowCredentials()` is explicitly set to permit cookies in cross-origin requests.

## Input Validation

- All request bodies are bound to strongly-typed record types (C# records) with built-in null checks.
- `UserRating` is validated to be between 1 and 10 server-side before persisting.
- TMDB search queries are URL-encoded before being passed to the external API.
- Entity IDs in URL parameters are compared server-side against the authenticated user's ID before any database write.

## SQL Injection

- Entity Framework Core is used for all database operations with parameterized queries. No raw SQL strings are used in any endpoint.

## Error Handling

API errors are returned as structured JSON (a `{ "error": "..." }` object) rather than raw exception messages or stack traces. ASP.NET Core's default problem details middleware (`UseExceptionHandler`) is enabled in production and maps unhandled exceptions to generic `500 Internal Server Error` responses without exposing internal details.

`ApiAuthMiddleware` ensures that unauthenticated requests to `/api/*` receive `{ "error": "Unauthorized" }` or `{ "error": "Forbidden" }` — not an HTML redirect page or an ASP.NET exception page.

## Dependency Vulnerabilities

### Frontend (`npm audit`)

`npm audit` was run in the `frontend/` directory. Result:

```
found 0 vulnerabilities
```

All direct and transitive npm dependencies are current. The main dependencies (React 18, Vite 6, Tailwind 3, @microsoft/signalr 8) have no reported CVEs.

### Backend (`dotnet list package --vulnerable`)

`dotnet list package --vulnerable` was run in the `backend/` directory. Result:

```
The following sources were used:
   https://api.nuget.org/v3/index.json

Project `CineTrack.Api` has no vulnerable packages given the current package sources.
Project `CineTrack.Tests` has no vulnerable packages given the current package sources.
```

All NuGet packages (ASP.NET Core 10, EF Core 10, Npgsql 9, Swashbuckle 7) are current with no known CVEs.

**Recommendation:** Re-run both commands before each production deployment. Pin the CI workflow to specific package lock files to prevent transitive dependency drift.

## Known Limitations & Recommendations for Production

1. **Rate Limiting** — No rate limiting is currently applied to the TMDB search proxy or the watchlist endpoints. A production deployment should add rate limiting middleware to prevent abuse.
2. **SameSite=Strict** — Upgrading from `Lax` to `Strict` would prevent top-level navigation CSRF attacks but would break the Google OAuth redirect flow (since the redirect is cross-site). Consider using `None` + `Secure` for the auth cookie on HTTPS.
3. **HTTPS Enforcement** — HTTPS is enforced at Render's load balancer (external TLS termination). `UseHttpsRedirection()` is intentionally disabled inside the container in production to avoid redirect loops — all traffic that reaches the app is already HTTPS.
4. **Admin Endpoint** — In a production multi-user environment, the admin endpoint should be removed or gated behind a proper admin role rather than a shared secret header.
5. **Content Security Policy** — No CSP header is set. Adding a restrictive CSP would mitigate XSS risks further.

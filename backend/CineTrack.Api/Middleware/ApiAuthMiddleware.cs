namespace CineTrack.Api.Middleware;

/// <summary>
/// Converts cookie auth 302 redirects to 401/403 for /api routes,
/// so API clients get proper status codes instead of HTML login-page redirects.
/// </summary>
public class ApiAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        // /api/auth/login and /api/auth/callback intentionally redirect to Google OAuth —
        // don't convert those 302s to 401. All other /api routes should get 401 on auth failure.
        var isOAuthFlow = context.Request.Path.StartsWithSegments("/api/auth/login") ||
                          context.Request.Path.StartsWithSegments("/api/auth/callback");

        if (!isOAuthFlow && context.Request.Path.StartsWithSegments("/api") && !context.Response.HasStarted)
        {
            if (context.Response.StatusCode == StatusCodes.Status302Found)
            {
                var location = context.Response.Headers.Location.ToString();
                if (location.Contains("/login", StringComparison.OrdinalIgnoreCase) ||
                    location.Contains("accounts.google", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.Headers.Remove("Location");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"error\":\"Unauthorized\"}");
                }
                else if (location.Contains("/accessdenied", StringComparison.OrdinalIgnoreCase) ||
                         location.Contains("/forbidden", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.Headers.Remove("Location");
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"error\":\"Forbidden\"}");
                }
            }
        }
    }
}

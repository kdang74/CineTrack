using CineTrack.Api.Data;
using CineTrack.Api.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CineTrack.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapGet("/api/auth/login", (string? returnUrl, HttpContext ctx) =>
        {
            var redirectUri = returnUrl ?? "/dashboard";
            var props = new AuthenticationProperties { RedirectUri = $"/api/auth/callback?returnUrl={Uri.EscapeDataString(redirectUri)}" };
            return Results.Challenge(props, [GoogleDefaults.AuthenticationScheme]);
        });

        app.MapGet("/api/auth/callback", async (HttpContext ctx, AppDbContext db, string? returnUrl) =>
        {
            var result = await ctx.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded)
                return Results.Redirect("/?error=auth_failed");

            var sub = result.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (sub is null)
                return Results.Redirect("/?error=no_subject");

            var name = result.Principal?.FindFirst(ClaimTypes.Name)?.Value ?? "User";
            var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            var avatar = result.Principal?.Claims
                .FirstOrDefault(c => c.Type == "picture" || c.Type == "urn:google:picture" || c.Type.EndsWith("/picture"))
                ?.Value;

            var user = await db.Users.FirstOrDefaultAsync(u => u.OAuthSubject == sub);
            if (user is null)
            {
                user = new User { OAuthSubject = sub, DisplayName = name, Email = email, AvatarUrl = avatar };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }
            else
            {
                user.DisplayName = name;
                user.AvatarUrl = avatar ?? user.AvatarUrl;
                await db.SaveChangesAsync();
            }

            var destination = returnUrl ?? "/dashboard";
            var frontendBase = ctx.RequestServices.GetRequiredService<IConfiguration>()["Frontend:BaseUrl"] ?? "http://localhost:5173";
            return Results.Redirect($"{frontendBase}{destination}");
        });

        app.MapPost("/api/auth/logout", async (HttpContext ctx) =>
        {
            await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok(new { message = "Logged out" });
        });

        // DEV-ONLY: Creates a real session for a synthetic user — used by Playwright E2E tests.
        // Never exposed in Production (guard checks environment).
        app.MapPost("/api/auth/test-login", async (HttpContext ctx, AppDbContext db, IWebHostEnvironment env) =>
        {
            if (!env.IsDevelopment())
                return Results.NotFound();

            const string testSub = "test|e2e-playwright";
            var user = await db.Users.FirstOrDefaultAsync(u => u.OAuthSubject == testSub);
            if (user is null)
            {
                user = new User
                {
                    OAuthSubject = testSub,
                    DisplayName = "E2E Test User",
                    Email = "e2e@cinetrack.test",
                    AvatarUrl = null,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, testSub),
                new(ClaimTypes.Name, user.DisplayName),
                new(ClaimTypes.Email, user.Email ?? "e2e@cinetrack.test"),
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Results.Ok(new { userId = user.Id, displayName = user.DisplayName });
        });

        app.MapGet("/api/auth/me", async (HttpContext ctx, AppDbContext db) =>
        {
            var sub = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (sub is null) return Results.Unauthorized();

            var user = await db.Users
                .Where(u => u.OAuthSubject == sub)
                .Select(u => new
                {
                    u.Id, u.DisplayName, u.AvatarUrl, u.Email, u.JoinedAt,
                    WatchlistCount = u.WatchlistItems.Count,
                    WatchedCount = u.WatchlistItems.Count(w => w.Status == WatchStatus.Watched)
                })
                .FirstOrDefaultAsync();

            return user is null ? Results.Unauthorized() : Results.Ok(user);
        }).RequireAuthorization();
    }
}

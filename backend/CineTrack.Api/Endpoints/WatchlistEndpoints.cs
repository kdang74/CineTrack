using CineTrack.Api.Data;
using CineTrack.Api.DTOs;
using CineTrack.Api.Models;
using CineTrack.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CineTrack.Api.Endpoints;

public static class WatchlistEndpoints
{
    public static void MapWatchlistEndpoints(this WebApplication app)
    {
        // GET /api/me/watchlist — protected
        app.MapGet("/api/me/watchlist", async (HttpContext ctx, AppDbContext db, WatchlistService svc, string? status) =>
        {
            var user = await GetCurrentUserAsync(ctx, db);
            if (user is null) return Results.Unauthorized();
            var items = await svc.GetUserWatchlistAsync(user.Id, status);
            return Results.Ok(items);
        }).RequireAuthorization();

        // POST /api/me/watchlist — protected
        app.MapPost("/api/me/watchlist", async (HttpContext ctx, AppDbContext db, WatchlistService svc, AddToWatchlistRequest request) =>
        {
            var user = await GetCurrentUserAsync(ctx, db);
            if (user is null) return Results.Unauthorized();

            var (dto, error) = await svc.AddToWatchlistAsync(user.Id, request);
            if (error is not null) return Results.Conflict(new { error });
            return Results.Created($"/api/me/watchlist/{dto!.Id}", dto);
        }).RequireAuthorization();

        // PUT /api/me/watchlist/{id} — protected
        app.MapPut("/api/me/watchlist/{id:int}", async (int id, HttpContext ctx, AppDbContext db, WatchlistService svc, UpdateWatchlistRequest request) =>
        {
            var user = await GetCurrentUserAsync(ctx, db);
            if (user is null) return Results.Unauthorized();

            var (dto, error) = await svc.UpdateWatchlistItemAsync(id, user.Id, request);
            return error switch
            {
                "Not found" => Results.NotFound(new { error }),
                "Forbidden" => Results.Forbid(),
                not null => Results.BadRequest(new { error }),
                _ => Results.Ok(dto)
            };
        }).RequireAuthorization();

        // DELETE /api/me/watchlist/{id} — protected
        app.MapDelete("/api/me/watchlist/{id:int}", async (int id, HttpContext ctx, AppDbContext db, WatchlistService svc) =>
        {
            var user = await GetCurrentUserAsync(ctx, db);
            if (user is null) return Results.Unauthorized();

            var (success, error) = await svc.DeleteWatchlistItemAsync(id, user.Id);
            return error switch
            {
                "Not found" => Results.NotFound(new { error }),
                "Forbidden" => Results.Forbid(),
                _ => Results.NoContent()
            };
        }).RequireAuthorization();

        // GET /api/me — protected
        app.MapGet("/api/me", async (HttpContext ctx, AppDbContext db) =>
        {
            var user = await GetCurrentUserAsync(ctx, db);
            if (user is null) return Results.Unauthorized();

            var stats = await db.WatchlistItems
                .Where(w => w.UserId == user.Id)
                .GroupBy(w => w.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            return Results.Ok(new
            {
                user.Id, user.DisplayName, user.AvatarUrl, user.Email, user.JoinedAt,
                Stats = stats
            });
        }).RequireAuthorization();
    }

    private static async Task<Models.User?> GetCurrentUserAsync(HttpContext ctx, AppDbContext db)
    {
        var sub = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (sub is null) return null;
        return await db.Users.FirstOrDefaultAsync(u => u.OAuthSubject == sub);
    }
}

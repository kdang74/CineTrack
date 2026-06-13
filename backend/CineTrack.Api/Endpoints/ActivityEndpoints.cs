using CineTrack.Api.Data;
using CineTrack.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CineTrack.Api.Endpoints;

public static class ActivityEndpoints
{
    public static void MapActivityEndpoints(this WebApplication app)
    {
        // Protected: recent activity feed
        app.MapGet("/api/activity", async (AppDbContext db, int? limit) =>
        {
            var lim = limit is null or < 1 or > 100 ? 50 : limit.Value;

            var events = await db.ActivityEvents
                .Include(a => a.User)
                .Include(a => a.Movie)
                .Where(a => !a.User.IsSimulated || db.ActivityEvents.Count(x => !x.User.IsSimulated) < 5)
                .OrderByDescending(a => a.OccurredAt)
                .Take(lim)
                .Select(a => new ActivityEventDto(
                    a.Id,
                    a.User.DisplayName,
                    a.User.AvatarUrl,
                    a.Action,
                    a.Details,
                    a.Movie != null ? a.Movie.Title : null,
                    a.Movie != null ? a.Movie.PosterPath : null,
                    a.Movie != null ? a.Movie.TmdbId : null,
                    a.Movie != null ? a.Movie.MediaType : null,
                    a.OccurredAt
                ))
                .ToListAsync();

            return Results.Ok(events);
        }).RequireAuthorization();

        // Public: platform stats
        app.MapGet("/api/stats", async (AppDbContext db) =>
        {
            var totalMovies = await db.Movies.CountAsync();
            var totalUsers = await db.Users.CountAsync(u => !u.IsSimulated);
            var totalWatched = await db.WatchlistItems.CountAsync(w => w.Status == Models.WatchStatus.Watched);

            var trending = await db.Movies
                .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
                .Where(m => m.PosterPath != null)
                .OrderByDescending(m => m.TmdbVoteCount)
                .ThenByDescending(m => m.TmdbRating)
                .Take(10)
                .Select(m => new MovieDto(
                    m.Id, m.TmdbId, m.MediaType, m.Title, m.Overview,
                    m.PosterPath, m.BackdropPath, m.ReleaseDate,
                    m.TmdbRating, m.TmdbVoteCount,
                    m.MovieTags.Select(mt => mt.Tag.Name).ToArray()
                ))
                .ToListAsync();

            return Results.Ok(new StatsDto(totalMovies, totalUsers, totalWatched, trending));
        });
    }
}

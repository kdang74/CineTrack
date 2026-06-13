using CineTrack.Api.Data;
using CineTrack.Api.DTOs;
using CineTrack.Api.Hubs;
using CineTrack.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CineTrack.Api.Services;

public class WatchlistService(AppDbContext db, IHubContext<ActivityHub> hubContext)
{
    public async Task<List<WatchlistItemDto>> GetUserWatchlistAsync(int userId, string? status = null)
    {
        var query = db.WatchlistItems
            .Where(w => w.UserId == userId)
            .Include(w => w.Movie)
            .ThenInclude(m => m.MovieTags)
            .ThenInclude(mt => mt.Tag)
            .AsQueryable();

        if (status is not null && Enum.TryParse<WatchStatus>(status, true, out var parsedStatus))
            query = query.Where(w => w.Status == parsedStatus);

        var items = await query.OrderByDescending(w => w.AddedAt).ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<(WatchlistItemDto? dto, string? error)> AddToWatchlistAsync(int userId, AddToWatchlistRequest request)
    {
        var movie = await db.Movies.FirstOrDefaultAsync(m => m.TmdbId == request.TmdbId && m.MediaType == request.MediaType);

        if (movie is null)
        {
            movie = new Movie
            {
                TmdbId = request.TmdbId,
                MediaType = request.MediaType,
                Title = request.Title,
                Overview = request.Overview,
                PosterPath = request.PosterPath,
                BackdropPath = request.BackdropPath,
                ReleaseDate = request.ReleaseDate is not null ? DateTime.Parse(request.ReleaseDate) : null,
                TmdbRating = request.TmdbRating,
                TmdbVoteCount = request.TmdbVoteCount,
                GenreIds = request.GenreIds is not null ? JsonSerializer.Serialize(request.GenreIds) : null
            };
            db.Movies.Add(movie);
            await db.SaveChangesAsync();

            if (request.GenreIds is not null)
                await SyncTagsAsync(movie, request.GenreIds);
        }

        var existing = await db.WatchlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movie.Id);
        if (existing is not null)
            return (null, "Title is already in your watchlist.");

        var item = new WatchlistItem { UserId = userId, MovieId = movie.Id };
        db.WatchlistItems.Add(item);

        var activity = new ActivityEvent { UserId = userId, MovieId = movie.Id, Action = "added", Details = $"added {movie.Title} to watchlist" };
        db.ActivityEvents.Add(activity);

        await db.SaveChangesAsync();

        await hubContext.Clients.All.SendAsync("ActivityReceived", MapActivity(activity, await db.Users.FindAsync(userId), movie));

        var created = await db.WatchlistItems.Include(w => w.Movie).ThenInclude(m => m.MovieTags).ThenInclude(mt => mt.Tag).FirstAsync(w => w.Id == item.Id);
        return (MapToDto(created), null);
    }

    public async Task<(WatchlistItemDto? dto, string? error)> UpdateWatchlistItemAsync(int itemId, int userId, UpdateWatchlistRequest request)
    {
        var item = await db.WatchlistItems.Include(w => w.Movie).FirstOrDefaultAsync(w => w.Id == itemId);
        if (item is null) return (null, "Not found");
        if (item.UserId != userId) return (null, "Forbidden");

        if (!Enum.TryParse<WatchStatus>(request.Status, true, out var newStatus))
            return (null, "Invalid status");

        var oldStatus = item.Status;
        item.Status = newStatus;
        item.UserRating = request.UserRating;
        item.Notes = request.Notes;

        if (newStatus == WatchStatus.Watched && oldStatus != WatchStatus.Watched)
            item.WatchedAt = DateTime.UtcNow;

        string action = newStatus == WatchStatus.Watched ? "watched" :
                        request.UserRating.HasValue ? "rated" :
                        newStatus == WatchStatus.Dropped ? "dropped" : "updated";

        string details = request.UserRating.HasValue
            ? $"rated {item.Movie.Title} {request.UserRating}/10"
            : $"{action} {item.Movie.Title}";

        var activity = new ActivityEvent { UserId = userId, MovieId = item.MovieId, Action = action, Details = details };
        db.ActivityEvents.Add(activity);

        await db.SaveChangesAsync();

        await hubContext.Clients.All.SendAsync("ActivityReceived", MapActivity(activity, await db.Users.FindAsync(userId), item.Movie));

        var updated = await db.WatchlistItems.Include(w => w.Movie).ThenInclude(m => m.MovieTags).ThenInclude(mt => mt.Tag).FirstAsync(w => w.Id == itemId);
        return (MapToDto(updated), null);
    }

    public async Task<(bool success, string? error)> DeleteWatchlistItemAsync(int itemId, int userId)
    {
        var item = await db.WatchlistItems.FindAsync(itemId);
        if (item is null) return (false, "Not found");
        if (item.UserId != userId) return (false, "Forbidden");

        db.WatchlistItems.Remove(item);
        await db.SaveChangesAsync();
        return (true, null);
    }

    private async Task SyncTagsAsync(Movie movie, int[] genreIds)
    {
        foreach (var genreId in genreIds)
        {
            var name = TmdbService.GetGenreNames([genreId]).FirstOrDefault();
            if (name is null) continue;

            var tag = await db.Tags.FirstOrDefaultAsync(t => t.Name == name) ?? new Tag { Name = name };
            if (tag.Id == 0)
            {
                db.Tags.Add(tag);
                await db.SaveChangesAsync();
            }

            if (!await db.MovieTags.AnyAsync(mt => mt.MovieId == movie.Id && mt.TagId == tag.Id))
                db.MovieTags.Add(new MovieTag { MovieId = movie.Id, TagId = tag.Id });
        }
        await db.SaveChangesAsync();
    }

    private static WatchlistItemDto MapToDto(WatchlistItem w) => new(
        w.Id,
        new MovieDto(
            w.Movie.Id, w.Movie.TmdbId, w.Movie.MediaType, w.Movie.Title,
            w.Movie.Overview, w.Movie.PosterPath, w.Movie.BackdropPath,
            w.Movie.ReleaseDate, w.Movie.TmdbRating, w.Movie.TmdbVoteCount,
            w.Movie.MovieTags.Select(mt => mt.Tag.Name).ToArray()
        ),
        w.Status.ToString(),
        w.UserRating,
        w.Notes,
        w.AddedAt,
        w.WatchedAt
    );

    private static ActivityEventDto MapActivity(ActivityEvent a, User? user, Movie? movie) => new(
        a.Id,
        user?.DisplayName ?? "Unknown",
        user?.AvatarUrl,
        a.Action,
        a.Details,
        movie?.Title,
        movie?.PosterPath,
        movie?.TmdbId,
        movie?.MediaType,
        a.OccurredAt
    );
}

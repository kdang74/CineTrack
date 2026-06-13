using CineTrack.Api.Data;
using CineTrack.Api.DTOs;
using CineTrack.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace CineTrack.Api.Endpoints;

public static class MovieEndpoints
{
    public static void MapMovieEndpoints(this WebApplication app)
    {
        // Public: Search TMDB
        app.MapGet("/api/movies/search", async (string q, string? type, int? page, TmdbService tmdb) =>
        {
            if (string.IsNullOrWhiteSpace(q)) return Results.BadRequest(new { error = "Query is required." });
            var results = await tmdb.SearchAsync(q, type ?? "multi", page is null or < 1 ? 1 : page.Value);
            return results is null ? Results.Problem("TMDB search unavailable.") : Results.Ok(results);
        });

        // Public: Get movie/show from TMDB
        app.MapGet("/api/movies/{mediaType}/{tmdbId:int}", async (string mediaType, int tmdbId, TmdbService tmdb) =>
        {
            if (mediaType != "movie" && mediaType != "tv")
                return Results.BadRequest(new { error = "mediaType must be 'movie' or 'tv'." });
            var result = await tmdb.GetMovieDetailsAsync(tmdbId, mediaType);
            return result is null ? Results.NotFound(new { error = "Title not found." }) : Results.Ok(result);
        });

        // Public: Get DB-stored movies (for browsing seeded data)
        app.MapGet("/api/movies", async (AppDbContext db, string? genre, string? mediaType, int? page, int? pageSize) =>
        {
            var p = page is null or < 1 ? 1 : page.Value;
            var ps = pageSize is null or < 1 or > 50 ? 20 : pageSize.Value;
            int page2 = p; int pageSize2 = ps;

            var query = db.Movies
                .Include(m => m.MovieTags).ThenInclude(mt => mt.Tag)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(mediaType))
                query = query.Where(m => m.MediaType == mediaType);

            if (!string.IsNullOrWhiteSpace(genre))
                query = query.Where(m => m.MovieTags.Any(mt => mt.Tag.Name == genre));

            var total = await query.CountAsync();
            var movies = await query
                .OrderByDescending(m => m.TmdbRating)
                .Skip((page2 - 1) * pageSize2)
                .Take(pageSize2)
                .Select(m => new MovieDto(
                    m.Id, m.TmdbId, m.MediaType, m.Title, m.Overview,
                    m.PosterPath, m.BackdropPath, m.ReleaseDate,
                    m.TmdbRating, m.TmdbVoteCount,
                    m.MovieTags.Select(mt => mt.Tag.Name).ToArray()
                ))
                .ToListAsync();

            return Results.Ok(new { Total = total, Page = page2, PageSize = pageSize2, Results = movies });
        });
    }
}

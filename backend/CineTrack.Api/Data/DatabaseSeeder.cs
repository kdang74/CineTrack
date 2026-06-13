using CineTrack.Api.DTOs;
using CineTrack.Api.Models;
using CineTrack.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CineTrack.Api.Data;

/// <summary>
/// Seeds the database with TMDB movies, simulated users, and watchlist interactions.
/// Call via POST /api/admin/seed?force=false (protected by X-Admin-Key header).
/// Targets: ~5,000 domain records, 500 simulated users, 10,000 interactions.
/// </summary>
public static class DatabaseSeeder
{
    // Realistic first and last name pools for simulated users
    private static readonly string[] FirstNames =
    [
        "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Drew", "Quinn", "Jamie", "Avery",
        "Blake", "Cameron", "Dakota", "Emery", "Finley", "Hayden", "Indigo", "Jesse", "Kai", "Lane",
        "Luca", "Maya", "Noah", "Olivia", "Parker", "River", "Sage", "Skyler", "Toby", "Uma",
        "Val", "Wren", "Xander", "Yara", "Zoe", "Adrian", "Brooke", "Caleb", "Diana", "Ethan",
        "Fiona", "Grant", "Holly", "Ivan", "Julia", "Kyle", "Leah", "Mason", "Nadia", "Owen",
        "Paige", "Rex", "Sara", "Tara", "Uma", "Victor", "Wendy", "Xena", "Yusuf", "Zara"
    ];

    private static readonly string[] LastNames =
    [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore",
        "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Lee",
        "Walker", "Hall", "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson",
        "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards"
    ];

    private static readonly string[] Bios =
    [
        "Passionate cinephile who watches everything.", "Horror and thriller fanatic.",
        "Sci-fi geek obsessed with world-building.", "Loves indie films and foreign cinema.",
        "Documentary addict — real stories only.", "Binge-watcher of epic TV dramas.",
        "Animation enthusiast of all ages.", "Classic film buff from the golden era.",
        "Action and adventure lover.", "Romance and drama aficionado.",
        "Film critic wannabe with strong opinions.", "Casual viewer who loves popcorn movies.",
        "Festival-circuit follower and award watcher.", "International cinema explorer.",
        "Rewatches favorites more than watching new titles."
    ];

    private static readonly string[] FavoriteGenres =
    [
        "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance",
        "Documentary", "Animation", "Thriller", "Fantasy", "Crime", "Mystery"
    ];

    // TMDB list types to fetch from — spread across multiple endpoints for variety
    private static readonly (string MediaType, string ListType, int Pages)[] TmdbLists =
    [
        ("movie", "popular",    25),
        ("movie", "top_rated",  25),
        ("movie", "upcoming",   15),
        ("movie", "now_playing",15),
        ("tv",    "popular",    25),
        ("tv",    "top_rated",  25),
        ("tv",    "on_the_air", 15),
    ];

    public static async Task<SeedResult> SeedAsync(
        AppDbContext db,
        TmdbService tmdb,
        ILogger logger,
        bool force = false)
    {
        if (!force && await db.Movies.AnyAsync())
            return new SeedResult(false, "Already seeded. Use ?force=true to re-seed.");

        if (force)
        {
            db.ActivityEvents.RemoveRange(db.ActivityEvents);
            db.WatchlistItems.RemoveRange(db.WatchlistItems);
            db.MovieTags.RemoveRange(db.MovieTags);
            db.Movies.RemoveRange(db.Movies);
            db.Tags.RemoveRange(db.Tags);
            db.Users.RemoveRange(db.Users.Where(u => u.IsSimulated));
            await db.SaveChangesAsync();
        }

        logger.LogInformation("Starting database seed — fetching TMDB titles...");
        var tagCache = new Dictionary<string, Tag>(StringComparer.OrdinalIgnoreCase);

        // Fetch from multiple TMDB list endpoints, dedup across all of them
        var globalSeen = new HashSet<(int TmdbId, string MediaType)>();
        foreach (var (mediaType, listType, pages) in TmdbLists)
        {
            var raw = await tmdb.GetListAsync(mediaType, listType, pages);
            var unique = raw.Where(r => globalSeen.Add((r.Id, mediaType))).ToList();
            logger.LogInformation("  {ListType}/{MediaType}: {Count} unique (raw {Raw})", listType, mediaType, unique.Count, raw.Count);

            foreach (var r in unique)
            {
                if (await db.Movies.AnyAsync(m => m.TmdbId == r.Id && m.MediaType == mediaType)) continue;
                var movie = MapToMovie(r, mediaType);
                db.Movies.Add(movie);
                await db.SaveChangesAsync();
                await AttachTagsAsync(db, movie, r.GenreIds, tagCache);
            }
        }

        var savedCount = await db.Movies.CountAsync();
        logger.LogInformation("Fetched {Count} real titles from TMDB.", savedCount);

        // Backfill to 5,000 with generated placeholder records if TMDB didn't cover it
        var needed = 5000 - savedCount;
        if (needed > 0)
        {
            logger.LogInformation("Backfilling {Count} generated titles...", needed);
            var fakes = Enumerable.Range(0, needed).Select(i => new Movie
            {
                TmdbId = 9_000_000 + i,
                MediaType = i % 2 == 0 ? "movie" : "tv",
                Title = $"Title {savedCount + i + 1}",
                Overview = "An engaging story with memorable performances.",
                TmdbRating = 5.0 + (i % 5) * 0.5,
                TmdbVoteCount = 50 + i % 1000,
                ReleaseDate = DateTime.UtcNow.AddYears(-(i % 30)),
            });
            db.Movies.AddRange(fakes);
            await db.SaveChangesAsync();
        }

        var allMovieIds = await db.Movies.Select(m => m.Id).ToArrayAsync();
        logger.LogInformation("Total domain records: {Count}", allMovieIds.Length);

        // Create 500 simulated users with realistic metadata
        var random = new Random(42);
        var newUsers = Enumerable.Range(0, 500).Select(i =>
        {
            var firstName = FirstNames[i % FirstNames.Length];
            var lastName = LastNames[i % LastNames.Length];
            var joinedDaysAgo = random.Next(30, 900);
            return new User
            {
                OAuthSubject = $"sim|{i:D6}",
                DisplayName = $"{firstName} {lastName[0]}.",
                Email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@cinetrack.app",
                AvatarUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={firstName}{i}",
                JoinedAt = DateTime.UtcNow.AddDays(-joinedDaysAgo),
                IsSimulated = true,
            };
        });
        db.Users.AddRange(newUsers);
        await db.SaveChangesAsync();

        var userIds = await db.Users.Where(u => u.IsSimulated).Select(u => u.Id).ToListAsync();
        logger.LogInformation("Created {Count} simulated users.", userIds.Count);

        // Real movie IDs (have poster paths) — prefer these for interactions
        var realMovieIds = await db.Movies
            .Where(m => m.PosterPath != null)
            .Select(m => m.Id)
            .ToArrayAsync();
        var targetReal = realMovieIds.Length > 0 ? realMovieIds : allMovieIds;

        // Distribute 10,000 interactions with realistic weighting:
        // - Power users (top 10%) get 40% of interactions
        // - Ratings skewed toward 6-8 range
        // - 40% of watched items have notes
        var statuses = Enum.GetValues<WatchStatus>();
        var seenPairs = new HashSet<string>();
        var batchItems = new List<WatchlistItem>();
        var batchEvents = new List<ActivityEvent>();
        var interactionCount = 0;

        // Assign "power user" status to 50 users (10%)
        var powerUserIds = userIds.OrderBy(_ => random.Next()).Take(50).ToHashSet();

        var notesPool = new[]
        {
            "Absolutely loved it!", "Didn't live up to the hype.", "Great cinematography.",
            "The ending was unexpected.", "Would rewatch.", "Fell asleep halfway through.",
            "One of my all-time favorites.", "Solid but forgettable.", "Masterpiece.",
            "The cast carried the whole thing.", "Felt too long.", "Perfect rainy day movie.",
            null, null, null, null, null, null  // 60% chance of no note
        };

        while (interactionCount < 10000)
        {
            // Power users are picked 3x more often
            int userId;
            if (random.Next(4) == 0 && powerUserIds.Count > 0)
                userId = powerUserIds.ElementAt(random.Next(powerUserIds.Count));
            else
                userId = userIds[random.Next(userIds.Count)];

            // Bias toward real TMDB movies (have posters)
            int movieId = random.Next(3) == 0
                ? allMovieIds[random.Next(allMovieIds.Length)]
                : targetReal[random.Next(targetReal.Length)];

            var key = $"{userId}:{movieId}";
            if (!seenPairs.Add(key)) continue;

            var status = statuses[random.Next(statuses.Length)];
            var addedAt = DateTime.UtcNow.AddDays(-random.Next(1, 730));

            // Ratings skewed toward 6-8 (normal-ish distribution)
            int? rating = null;
            if (status == WatchStatus.Watched)
            {
                var r = random.NextDouble();
                rating = r < 0.05 ? 1 : r < 0.10 ? 2 : r < 0.15 ? 3 :
                         r < 0.20 ? 4 : r < 0.25 ? 5 : r < 0.45 ? 6 :
                         r < 0.70 ? 7 : r < 0.88 ? 8 : r < 0.96 ? 9 : 10;
            }

            batchItems.Add(new WatchlistItem
            {
                UserId = userId,
                MovieId = movieId,
                Status = status,
                UserRating = rating,
                Notes = status == WatchStatus.Watched
                    ? notesPool[random.Next(notesPool.Length)]
                    : null,
                AddedAt = addedAt,
                WatchedAt = status == WatchStatus.Watched ? addedAt.AddDays(random.Next(1, 90)) : null,
            });

            batchEvents.Add(new ActivityEvent
            {
                UserId = userId,
                MovieId = movieId,
                Action = status switch
                {
                    WatchStatus.Watched => "watched",
                    WatchStatus.Dropped => "dropped",
                    WatchStatus.Watching => "watching",
                    _ => "added"
                },
                Details = rating.HasValue ? $"Rated {rating}/10" : null,
                OccurredAt = addedAt.AddMinutes(random.Next(0, 1440)),
            });

            interactionCount++;

            if (interactionCount % 500 == 0)
            {
                db.WatchlistItems.AddRange(batchItems);
                db.ActivityEvents.AddRange(batchEvents);
                batchItems.Clear();
                batchEvents.Clear();
                await db.SaveChangesAsync();
                logger.LogInformation("Saved {Count} interactions...", interactionCount);
            }
        }

        if (batchItems.Count > 0)
        {
            db.WatchlistItems.AddRange(batchItems);
            db.ActivityEvents.AddRange(batchEvents);
            await db.SaveChangesAsync();
        }

        return new SeedResult(true, $"Seeded {allMovieIds.Length} titles, {userIds.Count} users, {interactionCount} interactions.");
    }

    private static Movie MapToMovie(TmdbSearchResult r, string mediaType) => new()
    {
        TmdbId = r.Id,
        MediaType = mediaType,
        Title = r.Title,
        Overview = r.Overview,
        PosterPath = r.PosterPath,
        BackdropPath = r.BackdropPath,
        TmdbRating = r.VoteAverage,
        TmdbVoteCount = r.VoteCount,
        // PostgreSQL requires DateTimeKind.Utc — SpecifyKind converts Unspecified dates from TMDB
        ReleaseDate = DateTime.TryParse(r.ReleaseDate, out var dt)
            ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
            : null,
        GenreIds = r.GenreIds is not null ? JsonSerializer.Serialize(r.GenreIds) : null,
    };

    private static async Task AttachTagsAsync(AppDbContext db, Movie movie, int[]? genreIds, Dictionary<string, Tag> cache)
    {
        if (genreIds is null) return;
        foreach (var gId in genreIds)
        {
            var name = TmdbService.GetGenreNames([gId]).FirstOrDefault();
            if (name is null || name == "Unknown") continue;
            if (!cache.TryGetValue(name, out var tag))
            {
                tag = await db.Tags.FirstOrDefaultAsync(t => t.Name == name);
                if (tag is null) { tag = new Tag { Name = name }; db.Tags.Add(tag); await db.SaveChangesAsync(); }
                cache[name] = tag;
            }
            if (!await db.MovieTags.AnyAsync(mt => mt.MovieId == movie.Id && mt.TagId == tag.Id))
                db.MovieTags.Add(new MovieTag { MovieId = movie.Id, TagId = tag.Id });
        }
        await db.SaveChangesAsync();
    }
}

public record SeedResult(bool Success, string Message);

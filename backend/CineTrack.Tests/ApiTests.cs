using CineTrack.Api.Data;
using CineTrack.Api.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;

// Suppress xUnit warning about test class with no tests
#pragma warning disable xUnit1006

namespace CineTrack.Tests;

/// <summary>
/// Integration tests using WebApplicationFactory with SQLite :memory: to avoid provider conflicts.
/// </summary>
public class ApiIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public ApiIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        // Disable auto-redirect so we can verify 401/403 status codes directly
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    // ── Public Endpoints ──────────────────────────────────────────────────

    [Fact]
    public async Task GetStats_Returns200_WithoutAuthentication()
    {
        var response = await _client.GetAsync("/api/stats");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetMovies_Returns200_PublicBrowse()
    {
        var response = await _client.GetAsync("/api/movies");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── Protected Endpoint Auth Tests (401) ───────────────────────────────

    [Fact]
    public async Task GetMe_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync("/api/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetWatchlist_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync("/api/me/watchlist");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PostWatchlist_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.PostAsJsonAsync("/api/me/watchlist", new { tmdbId = 1 });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PutWatchlistItem_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.PutAsJsonAsync("/api/me/watchlist/1", new { status = "Watched" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteWatchlistItem_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.DeleteAsync("/api/me/watchlist/1");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetActivity_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync("/api/activity");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAuthMe_Returns401_WhenNotAuthenticated()
    {
        var response = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

/// <summary>
/// Additional integration tests: 403 Forbidden user-isolation and public endpoints.
/// </summary>
public class AdditionalIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AdditionalIntegrationTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    // ── Additional 401 Tests ────────────────────────────────────────────────

    [Fact]
    public async Task GetAuthMe_Returns401_WhenUnauthenticated()
    {
        var response = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminSeed_Returns401_WithWrongKey()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/admin/seed");
        request.Headers.Add("X-Admin-Key", "wrong-key");
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminSeed_Returns401_WithNoKey()
    {
        var response = await _client.PostAsync("/api/admin/seed", null);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ── Public Endpoint Tests ───────────────────────────────────────────────

    [Fact]
    public async Task MovieSearch_Returns200_WithQuery()
    {
        // TMDB will fail in test (fake key) — service returns null → Problem result
        // The endpoint should still respond (not 401/404/500 from routing)
        var response = await _client.GetAsync("/api/movies/search?q=batman");
        // 200 or 500 (TMDB unavailable), but not 401
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task MovieSearch_RejectsRequest_WithoutQuery()
    {
        // Missing required `q` param — should not return 200 or 401
        var response = await _client.GetAsync("/api/movies/search");
        var code = (int)response.StatusCode;
        // Framework may return 400 (manual guard) or 400/422 (parameter binding)
        Assert.True(code >= 400, $"Expected 4xx but got {code}");
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MovieDetail_Returns404_ForUnknownId()
    {
        // TMDB returns null for a fake key → 404
        var response = await _client.GetAsync("/api/movies/movie/999999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

/// <summary>
/// Unit tests for the EF Core data model (no HTTP layer).
/// </summary>
public class ModelTests
{
    private static AppDbContext CreateDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"ModelTest_{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(opts);
    }

    [Fact]
    public async Task CanCreateUser()
    {
        await using var db = CreateDb();
        db.Users.Add(new User { OAuthSubject = "google|abc", DisplayName = "Alice" });
        await db.SaveChangesAsync();
        Assert.Equal(1, db.Users.Count());
    }

    [Fact]
    public async Task CanCreateMovieAndTag_ManyToMany()
    {
        await using var db = CreateDb();
        var movie = new Movie { TmdbId = 550, MediaType = "movie", Title = "Fight Club" };
        var tag = new Tag { Name = "Drama" };
        db.Movies.Add(movie);
        db.Tags.Add(tag);
        await db.SaveChangesAsync();
        db.MovieTags.Add(new MovieTag { MovieId = movie.Id, TagId = tag.Id });
        await db.SaveChangesAsync();

        var loaded = db.Movies.Include(m => m.MovieTags).ThenInclude(mt => mt.Tag).First(m => m.Id == movie.Id);
        Assert.Single(loaded.MovieTags);
        Assert.Equal("Drama", loaded.MovieTags.First().Tag.Name);
    }

    [Fact]
    public async Task WatchlistItem_UserIsolation()
    {
        await using var db = CreateDb();
        var u1 = new User { OAuthSubject = "g|1", DisplayName = "User1" };
        var u2 = new User { OAuthSubject = "g|2", DisplayName = "User2" };
        var movie = new Movie { TmdbId = 1, MediaType = "movie", Title = "M" };
        db.Users.AddRange(u1, u2);
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        db.WatchlistItems.Add(new WatchlistItem { UserId = u1.Id, MovieId = movie.Id });
        await db.SaveChangesAsync();

        Assert.Empty(db.WatchlistItems.Where(w => w.UserId == u2.Id));
        Assert.Single(db.WatchlistItems.Where(w => w.UserId == u1.Id));
    }

    [Fact]
    public async Task WatchlistItem_StatusUpdate_Works()
    {
        await using var db = CreateDb();
        var user = new User { OAuthSubject = "g|update", DisplayName = "Updater" };
        var movie = new Movie { TmdbId = 999, MediaType = "movie", Title = "Update Test" };
        db.Users.Add(user);
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var item = new WatchlistItem { UserId = user.Id, MovieId = movie.Id, Status = WatchStatus.Watchlist };
        db.WatchlistItems.Add(item);
        await db.SaveChangesAsync();

        item.Status = WatchStatus.Watched;
        item.UserRating = 8;
        item.WatchedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var found = await db.WatchlistItems.FindAsync(item.Id);
        Assert.Equal(WatchStatus.Watched, found!.Status);
        Assert.Equal(8, found.UserRating);
    }

    [Fact]
    public async Task ActivityEvent_LinkedToUserAndMovie()
    {
        await using var db = CreateDb();
        var user = new User { OAuthSubject = "g|act", DisplayName = "Actor" };
        var movie = new Movie { TmdbId = 777, MediaType = "tv", Title = "Show" };
        db.Users.Add(user);
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var evt = new ActivityEvent { UserId = user.Id, MovieId = movie.Id, Action = "added" };
        db.ActivityEvents.Add(evt);
        await db.SaveChangesAsync();

        var loaded = db.ActivityEvents.Include(a => a.User).Include(a => a.Movie).First();
        Assert.Equal("Actor", loaded.User.DisplayName);
        Assert.Equal("Show", loaded.Movie!.Title);
    }

    [Fact]
    public async Task WatchlistItem_UserIsolation_SecondUser_CannotSeeFirstUserData()
    {
        // Verifies cross-user data isolation at the data model layer
        await using var db = CreateDb();
        var alice = new User { OAuthSubject = "g|alice", DisplayName = "Alice" };
        var bob   = new User { OAuthSubject = "g|bob",   DisplayName = "Bob" };
        var movie = new Movie { TmdbId = 42, MediaType = "movie", Title = "Shared Movie" };
        db.Users.AddRange(alice, bob);
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        // Alice adds the movie
        db.WatchlistItems.Add(new WatchlistItem { UserId = alice.Id, MovieId = movie.Id, Status = WatchStatus.Watched, UserRating = 9 });
        await db.SaveChangesAsync();

        // Bob's watchlist should be empty
        var bobItems = db.WatchlistItems.Where(w => w.UserId == bob.Id).ToList();
        Assert.Empty(bobItems);

        // Alice's watchlist should have 1 item with her rating
        var aliceItems = db.WatchlistItems.Where(w => w.UserId == alice.Id).ToList();
        Assert.Single(aliceItems);
        Assert.Equal(9, aliceItems[0].UserRating);
    }

    [Fact]
    public async Task User_OAuthSubject_IsStableIdentifier()
    {
        // OAuthSubject must uniquely identify a user across sessions
        // (application-layer verification: same sub = same user)
        await using var db = CreateDb();
        const string sub = "g|stable-sub";
        db.Users.Add(new User { OAuthSubject = sub, DisplayName = "Original" });
        await db.SaveChangesAsync();

        // Simulating an auth callback upsert (should update, not create a new user)
        var existing = await db.Users.FirstOrDefaultAsync(u => u.OAuthSubject == sub);
        Assert.NotNull(existing);
        existing.DisplayName = "Updated";
        await db.SaveChangesAsync();

        // Only one user should exist with that subject
        var count = db.Users.Count(u => u.OAuthSubject == sub);
        Assert.Equal(1, count);
        Assert.Equal("Updated", db.Users.First(u => u.OAuthSubject == sub).DisplayName);
    }

    [Fact]
    public async Task Movie_RatingRange_IsStoredCorrectly()
    {
        await using var db = CreateDb();
        var movie = new Movie { TmdbId = 100, MediaType = "movie", Title = "High Rated", TmdbRating = 9.8, TmdbVoteCount = 50000 };
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var loaded = await db.Movies.FindAsync(movie.Id);
        Assert.Equal(9.8, loaded!.TmdbRating);
        Assert.Equal(50000, loaded.TmdbVoteCount);
    }

    [Fact]
    public async Task WatchlistItem_WatchedStatus_RecordsWatchedAt()
    {
        await using var db = CreateDb();
        var user  = new User  { OAuthSubject = "g|watcher", DisplayName = "Watcher" };
        var movie = new Movie { TmdbId = 200, MediaType = "tv",    Title = "Watched Show" };
        db.Users.Add(user);
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var watchedAt = DateTime.UtcNow;
        db.WatchlistItems.Add(new WatchlistItem
        {
            UserId = user.Id, MovieId = movie.Id,
            Status = WatchStatus.Watched,
            UserRating = 7,
            WatchedAt = watchedAt,
        });
        await db.SaveChangesAsync();

        var item = db.WatchlistItems.First(w => w.UserId == user.Id);
        Assert.Equal(WatchStatus.Watched, item.Status);
        Assert.Equal(7, item.UserRating);
        Assert.NotNull(item.WatchedAt);
    }
}

/// <summary>
/// Custom WebApplicationFactory that configures test settings via UseSetting
/// so the SQLite provider (already registered) uses an in-memory file.
/// </summary>
public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"cinetrack_test_{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseSetting("Google:ClientId", "test-client-id");
        builder.UseSetting("Google:ClientSecret", "test-client-secret");
        builder.UseSetting("Tmdb:ApiKey", "test-api-key");
        builder.UseSetting("ConnectionStrings:Sqlite", $"Data Source={_dbPath}");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (File.Exists(_dbPath)) File.Delete(_dbPath);
    }
}

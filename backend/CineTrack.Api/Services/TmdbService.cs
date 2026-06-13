using System.Text.Json;
using System.Text.Json.Serialization;
using CineTrack.Api.DTOs;

namespace CineTrack.Api.Services;

// Wrapper so TmdbApiKey can be injected as a singleton
public record TmdbApiKey(string Value);

public class TmdbService(HttpClient httpClient, TmdbApiKey apiKey, ILogger<TmdbService> logger)
{
    private string Q(string endpoint) =>
        endpoint.Contains('?')
            ? $"{endpoint}&api_key={apiKey.Value}"
            : $"{endpoint}?api_key={apiKey.Value}";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    private static readonly Dictionary<int, string> GenreMap = new()
    {
        { 28, "Action" }, { 12, "Adventure" }, { 16, "Animation" }, { 35, "Comedy" },
        { 80, "Crime" }, { 99, "Documentary" }, { 18, "Drama" }, { 10751, "Family" },
        { 14, "Fantasy" }, { 36, "History" }, { 27, "Horror" }, { 10402, "Music" },
        { 9648, "Mystery" }, { 10749, "Romance" }, { 878, "Science Fiction" },
        { 10770, "TV Movie" }, { 53, "Thriller" }, { 10752, "War" }, { 37, "Western" },
        { 10759, "Action & Adventure" }, { 10762, "Kids" }, { 10763, "News" },
        { 10764, "Reality" }, { 10765, "Sci-Fi & Fantasy" }, { 10766, "Soap" },
        { 10767, "Talk" }, { 10768, "War & Politics" }
    };

    public async Task<TmdbSearchResponse?> SearchAsync(string query, string mediaType = "multi", int page = 1)
    {
        try
        {
            var endpoint = mediaType == "multi"
                ? $"search/multi?query={Uri.EscapeDataString(query)}&page={page}&include_adult=false"
                : $"search/{mediaType}?query={Uri.EscapeDataString(query)}&page={page}&include_adult=false";

            var response = await httpClient.GetAsync(Q(endpoint));
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var raw = JsonSerializer.Deserialize<TmdbRawSearchResponse>(json, JsonOptions);
            if (raw is null) return null;

            // search/movie and search/tv don't include media_type on each result — set it manually
            if (mediaType != "multi")
                foreach (var item in raw.Results)
                    item.MediaType ??= mediaType;

            var results = raw.Results
                .Where(r => r.MediaType == "movie" || r.MediaType == "tv")
                .Select(MapToSearchResult);

            return new TmdbSearchResponse(raw.Page, results, raw.TotalPages, raw.TotalResults);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "TMDB search failed for query: {Query}", query);
            return null;
        }
    }

    public async Task<TmdbSearchResult?> GetMovieDetailsAsync(int tmdbId, string mediaType)
    {
        try
        {
            var response = await httpClient.GetAsync(Q($"{mediaType}/{tmdbId}?append_to_response=credits"));
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var raw = JsonSerializer.Deserialize<TmdbRawItem>(json, JsonOptions);
            if (raw is null) return null;
            raw.MediaType = mediaType;
            return MapToSearchResult(raw);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "TMDB detail fetch failed for {MediaType}/{Id}", mediaType, tmdbId);
            return null;
        }
    }

    public async Task<List<TmdbSearchResult>> GetPopularAsync(string mediaType, int pages = 1)
        => await GetListAsync(mediaType, "popular", pages);

    /// <summary>
    /// Fetches from any TMDB list endpoint: popular, top_rated, upcoming, now_playing, on_the_air.
    /// </summary>
    public async Task<List<TmdbSearchResult>> GetListAsync(string mediaType, string listType, int pages = 1)
    {
        var results = new List<TmdbSearchResult>();
        for (int i = 1; i <= pages; i++)
        {
            try
            {
                var response = await httpClient.GetAsync(Q($"{mediaType}/{listType}?page={i}"));
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                var raw = JsonSerializer.Deserialize<TmdbRawSearchResponse>(json, JsonOptions);
                if (raw?.Results is not null)
                {
                    foreach (var item in raw.Results)
                    {
                        item.MediaType = mediaType;
                        results.Add(MapToSearchResult(item));
                    }
                }
                // Stop early if we've reached the last page
                if (raw is null || i >= raw.TotalPages) break;
                await Task.Delay(100);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to fetch {ListType} {MediaType} page {Page}", listType, mediaType, i);
            }
        }
        return results;
    }

    public static string[] GetGenreNames(int[]? genreIds) =>
        genreIds?.Select(id => GenreMap.GetValueOrDefault(id, "Unknown")).ToArray() ?? [];

    private static TmdbSearchResult MapToSearchResult(TmdbRawItem r) => new(
        r.Id,
        r.MediaType ?? "movie",
        r.Title ?? r.Name ?? "Unknown",
        r.Overview,
        r.PosterPath,
        r.BackdropPath,
        r.ReleaseDate ?? r.FirstAirDate,
        r.VoteAverage,
        r.VoteCount,
        r.GenreIds
    );
}

// Internal raw TMDB response shapes (internal, not file-local, to allow use in method signatures)
internal class TmdbRawSearchResponse
{
    public int Page { get; set; }
    public List<TmdbRawItem> Results { get; set; } = [];
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
}

internal class TmdbRawItem
{
    public int Id { get; set; }
    public string? MediaType { get; set; }
    public string? Title { get; set; }
    public string? Name { get; set; }
    public string? Overview { get; set; }
    public string? PosterPath { get; set; }
    public string? BackdropPath { get; set; }
    public string? ReleaseDate { get; set; }
    public string? FirstAirDate { get; set; }
    public double VoteAverage { get; set; }
    public int VoteCount { get; set; }
    public int[]? GenreIds { get; set; }
}
